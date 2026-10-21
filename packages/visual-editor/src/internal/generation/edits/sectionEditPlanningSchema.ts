import { z } from "zod";
import type { PuckGenerationCatalog } from "../../../utils/generationCatalog.ts";
import { planningDescriptions, translationModeGuidance } from "../prompts.ts";
import { createGenerationSchemaCompiler } from "../schema/compiler.ts";
import { exportGenerationSchema } from "../schema/strictSchema.ts";
import type { Content } from "../shared/authoredValues.ts";
import { localizedTextState } from "../shared/localizedText.ts";
import { generationFields } from "../shared/slottedItemSource.ts";
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
          })),
          slots: slotCapabilities(generationFields(config)),
        },
      ])
  );
  const editableIds = inventory.components
    .filter((item) => item.editable)
    .map((item) => item.componentId);
  const sectionIds = inventory.components
    .filter((item) => item.editable && item.sectionId === item.componentId)
    .map((item) => item.componentId);
  const [insert, remove, reorder] =
    sectionEditTaskSchema.shape.structuralOperations.element.options;
  const insertionSchemas = inventory.collections
    .filter((collection) => collection.allowedInsertionTypes.length)
    .map((collection) =>
      insert.extend({
        componentType: z.enum(collection.allowedInsertionTypes),
        collection: z.strictObject({
          ownerId: z.literal(collection.ownerId),
          slotPath: z.literal(collection.slotPath),
        }),
      })
    );
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
  return {
    jsonSchema: exportGenerationSchema(
      responseSchema.extend({
        tasks: z.array(
          responseSchema.shape.tasks.element.extend({
            structuralOperations: z.array(
              z.union([...insertionSchemas, remove, reorder])
            ),
          })
        ),
      })
    ),
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
          return fields.length ? [[componentId, fields]] : [];
        })
      ),
      inventory,
      capabilities,
      readOnlyFields: Object.fromEntries(
        [...saved]
          .filter(([, component]) => component.readOnly)
          .map(([componentId, component]) => [componentId, component.readOnly])
      ),
    },
    availableComponentNames: Object.keys(capabilities),
    parseResponse: (text: string): SectionEditPlan => {
      const parsed = responseSchema.parse(JSON.parse(text));
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
  prefix = ""
): object[] =>
  Object.entries(fields).flatMap(([key, field]) => {
    const path = `${prefix}/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`;
    if (field.type === "slot") {
      return [
        { path, allow: field.allow ?? [], disallow: field.disallow ?? [] },
      ];
    }
    if (field.type === "object") {
      return slotCapabilities(field.objectFields, path);
    }
    if (field.type === "array") {
      return slotCapabilities(field.arrayFields, `${path}/*`);
    }
    return [];
  });
