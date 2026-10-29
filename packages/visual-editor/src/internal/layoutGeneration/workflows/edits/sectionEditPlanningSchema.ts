import { z } from "zod";
import { unwrapZodSchema as unwrap } from "../../../utils/unwrapZodSchema.ts";
import type { PuckGenerationCatalog } from "../../../../utils/createPuckGenerationCatalog.ts";
import {
  planningDescriptions,
  translationModeGuidance,
} from "../../prompts.ts";
import { createGenerationSchemaCompiler } from "../../schema/compiler.ts";
import { createRequestLocalIds } from "../../shared/requestLocalIds.ts";
import { exportGenerationSchema } from "../../schema/strictSchema.ts";
import type { Content } from "../../shared/authoredValues.ts";
import { localizedTextState } from "../../shared/localizedText.ts";
import { generationFields } from "../../shared/slottedItemSource.ts";
import { getEditValueContracts } from "./getEditValueContracts.ts";
import { sectionEditTaskSchema } from "./sectionEditTaskSchema.ts";
import type { SectionEditPlan } from "./types.ts";
import { buildPlanningContext, validateEditPlan } from "./taskValidation.ts";

/** Compile planning output independently from component-value generation. */
export const compileEditPlanningSchema = (
  catalog: PuckGenerationCatalog,
  locales: string[],
  data: Content,
  selectedComponentId?: string | null
) => {
  const context = buildPlanningContext(catalog, data, selectedComponentId);
  const { inventory, saved } = context;
  const compiler = createGenerationSchemaCompiler(catalog, locales, "insert");
  // Contracts depend on type and read-only fields, not current authored values.
  const contracts = new Map<string, ReturnType<typeof getEditValueContracts>>();
  const contractsFor = (
    type: string,
    readOnly: Record<string, boolean> = {}
  ) => {
    const key = JSON.stringify([
      type,
      Object.keys(readOnly)
        .filter((key) => readOnly[key])
        .sort(),
    ]);
    let cached = contracts.get(key);
    if (!cached) {
      cached = getEditValueContracts(
        compiler,
        catalog.data.components[type],
        readOnly
      );
      contracts.set(key, cached);
    }
    return cached;
  };
  const capabilities = Object.fromEntries(
    Object.entries(catalog.data.components)
      .filter(([, config]) => config.generation)
      .map(([name, config]) => [
        name,
        {
          description: config.description ?? "",
          nestedOnly: !!config.nestedOnly,
          permissions: config.permissions ?? {},
          authoredPaths: contractsFor(name).map((contract) => ({
            path: contract.path,
            set: !!contract.set,
            unset: contract.unset,
            ...(contract.description
              ? { description: contract.description }
              : {}),
          })),
          slots: slotCapabilities(
            generationFields(config),
            config.generation!.props
          ),
        },
      ])
  );
  const editableIds = inventory.components
    .filter((item) => item.editable)
    .map((item) => item.componentId);
  const sectionIds = inventory.components
    .filter((item) => item.editable && item.sectionId === item.componentId)
    .map((item) => item.componentId);
  const ids = createRequestLocalIds(
    inventory.components.map((item) => item.componentId)
  );
  // Shared collection allowlists and parent links retain all structural information.
  const insertionTypes: Record<string, string[]> = {};
  const insertionTypeKeys = new Map<string, string>();
  const wireInventory = {
    selectedComponentId: ids.encode(inventory.selectedComponentId),
    selectedSectionId: ids.encode(inventory.selectedSectionId),
    components: inventory.components.map(
      ({
        description,
        ancestorIds: _ancestorIds,
        displayOrder: _displayOrder,
        collection: _collection,
        ...item
      }) => ({
        ...item,
        ...(!capabilities[item.type] ? { description } : {}),
        componentId: ids.encode(item.componentId),
        parentId: ids.encode(item.parentId),
        sectionId: ids.encode(item.sectionId),
      })
    ),
    collections: inventory.collections.map(
      ({ allowedInsertionTypes, ...collection }) => {
        const signature = JSON.stringify(allowedInsertionTypes);
        let key = insertionTypeKeys.get(signature);
        if (!key) {
          key = `t${insertionTypeKeys.size}`;
          insertionTypeKeys.set(signature, key);
          insertionTypes[key] = allowedInsertionTypes;
        }
        return {
          ...collection,
          ownerId: ids.encode(collection.ownerId),
          componentIds: collection.componentIds.map((id) => ids.encode(id)),
          insertionTypeSet: key,
        };
      }
    ),
    insertionTypes,
  };
  const responseSchema = z.strictObject({
    text: z.string().min(1).describe(planningDescriptions.reply),
    intent: z
      .enum([
        "content",
        "globalStyle",
        "mixed",
        "conversation",
        "clarification",
      ])
      .describe(planningDescriptions.intent),
    clarification: z
      .string()
      .min(1)
      .nullable()
      .describe(planningDescriptions.clarification),
    globalStyleGuidance: z
      .string()
      .min(1)
      .nullable()
      .describe(planningDescriptions.globalStyleGuidance),
    limitations: z
      .string()
      .trim()
      .min(1)
      .nullable()
      .describe(planningDescriptions.limitations),
    sharedIntent: z.string(),
    tasks: z.array(
      sectionEditTaskSchema.extend({
        sectionId: sectionIds.length ? z.enum(sectionIds).nullable() : z.null(),
        targetComponentIds: editableIds.length
          ? z.array(z.enum(editableIds))
          : z.array(z.string()).max(0),
        generateContent: z.boolean(),
        translationMode: z
          .enum(["defaultOnly", "translate"])
          .describe(translationModeGuidance),
        description: z.string().trim().min(1),
      })
    ),
  });
  // One nullable slot per existing section makes duplicate ownership
  // unrepresentable. New sections have their own insertion-only task list.
  const wireTask = responseSchema.shape.tasks.element.omit({
    sectionId: true,
    targetComponentIds: true,
  });
  const dependency = z.strictObject({
    taskId: z.string().trim().min(1),
    kind: z.enum(["structuralPrerequisite", "conditionalReplacement"]),
    reason: z
      .string()
      .trim()
      .min(1)
      .describe(
        "Explain the concrete structural prerequisite or the user-requested condition that requires this task to succeed. Task order and topical similarity are not prerequisites."
      ),
  });
  const justifiedTask = wireTask.extend({
    dependsOn: z
      .array(dependency)
      .describe(
        "Default to []. Each entry requires successful application, and failure skips this task. Use only for a structural prerequisite or an explicitly requested conditional replacement."
      ),
  });
  const [insert] =
    sectionEditTaskSchema.shape.structuralOperations.element.options;
  const wireResponseSchema = responseSchema.omit({ tasks: true }).extend({
    existingTasks: z.strictObject(
      Object.fromEntries(
        sectionIds.map((sectionId) => {
          const targets = inventory.components
            .filter((item) => item.editable && item.sectionId === sectionId)
            .map((item) => ids.encode(item.componentId));
          return [
            ids.encode(sectionId),
            justifiedTask
              .extend({
                targetComponentIds: z.array(z.enum(targets)),
              })
              .nullable(),
          ];
        })
      )
    ),
    newSections: z.array(
      justifiedTask.extend({
        targetComponentIds: z.array(z.string()).max(0),
        structuralOperations: z.array(insert).length(1),
        generateContent: z.literal(true),
      })
    ),
  });
  return {
    // Placement and permissions remain enforced by validateEditPlan.
    jsonSchema: exportGenerationSchema(wireResponseSchema),
    context: {
      locales,
      localizedText: Object.fromEntries(
        [...saved].flatMap(([componentId, component]) => {
          const fields = localizedTextState(
            component.props,
            catalog.data.components[component.type],
            locales,
            component.readOnly
          );
          return fields.length ? [[ids.encode(componentId), fields]] : [];
        })
      ),
      inventory: wireInventory,
      capabilities,
      readOnlyFields: Object.fromEntries(
        [...saved]
          .filter(([, component]) => component.readOnly)
          .map(([componentId, component]) => [
            ids.encode(componentId),
            component.readOnly,
          ])
      ),
    },
    availableComponentNames: Object.keys(capabilities),
    parseResponse: (text: string): SectionEditPlan => {
      const { existingTasks, newSections, ...reply } = wireResponseSchema.parse(
        JSON.parse(text)
      );
      const parsed = responseSchema.parse(
        ids.references(
          {
            ...reply,
            tasks: [
              ...Object.entries(existingTasks).flatMap(([sectionId, task]) =>
                task
                  ? [
                      {
                        ...task,
                        sectionId,
                        dependsOn: task.dependsOn.map(
                          (dependency) => dependency.taskId
                        ),
                      },
                    ]
                  : []
              ),
              ...newSections.map((task) => ({
                ...task,
                sectionId: null,
                dependsOn: task.dependsOn.map(
                  (dependency) => dependency.taskId
                ),
              })),
            ],
          },
          ids.decode
        )
      );
      const plan = {
        ...parsed,
        // Mixed means local edits plus manual global theme guidance, not a
        // batch containing different edits or an unsupported subrequest.
        intent:
          parsed.intent === "mixed" && parsed.globalStyleGuidance === null
            ? ("content" as const)
            : parsed.intent,
        tasks: parsed.tasks.map((task) => ({
          ...task,
          sectionId: task.sectionId ?? `generated-${crypto.randomUUID()}`,
        })),
      };
      validateEditPlan(catalog, context, plan);
      for (const task of plan.tasks) {
        if (
          task.generateContent &&
          !task.structuralOperations.some(
            (operation) => operation.kind === "insert"
          )
        ) {
          const removed = new Set(
            task.structuralOperations
              .filter((operation) => operation.kind === "remove")
              .map((operation) => operation.componentId)
          );
          if (
            !task.targetComponentIds.some(
              (componentId) =>
                !removed.has(componentId) &&
                contractsFor(
                  saved.get(componentId)!.type,
                  saved.get(componentId)!.readOnly
                ).length
            )
          ) {
            throw new Error("Content task has no writable authored paths.");
          }
        }
      }
      return plan;
    },
  };
};

const slotCapabilities = (
  fields: import("@puckeditor/core").Fields,
  schema?: z.ZodType,
  prefix = ""
): object[] =>
  Object.entries(fields).flatMap(([key, field]) => {
    const path = `${prefix}/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`;
    const node = schema ? unwrap(schema) : undefined;
    const child =
      node instanceof z.ZodObject
        ? (node.shape[key] as z.ZodType | undefined)
        : undefined;
    if (field.type === "slot") {
      return [
        {
          path,
          allow: field.allow ?? [],
          disallow: field.disallow ?? [],
          ...(child?.description ? { description: child.description } : {}),
        },
      ];
    }
    if (field.type === "object") {
      return slotCapabilities(field.objectFields, child, path);
    }
    if (field.type === "array") {
      const array = child ? unwrap(child) : undefined;
      return slotCapabilities(
        field.arrayFields,
        array instanceof z.ZodArray ? (array.element as z.ZodType) : undefined,
        `${path}/*`
      );
    }
    return [];
  });
