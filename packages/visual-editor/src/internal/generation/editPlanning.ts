import { z } from "zod";
import { translationModeGuidance } from "./prompts.ts";
import { sameCollection, validateTaskGraph } from "./editUtils.ts";
import { editPath } from "./editValues.ts";
import {
  buildEditInventory,
  validateAuthored,
  walkAuthored,
  type Content,
  type EditCollectionRef,
  type SavedComponent,
} from "./authored.ts";
import type {
  EditAnchor,
  SectionEditPlan,
  SectionEditTask,
} from "./editProtocol.ts";
import { sectionEditTaskSchema } from "./editProtocolSchema.ts";
import { generationFields } from "./slottedItemSource.ts";
import { createGenerationSchemaCompiler } from "./generationSchemaCompiler.ts";
import { exportGenerationSchema } from "./strictGenerationSchema.ts";
import { getEditValueContracts } from "./editCapabilities.ts";
import type { PuckGenerationCatalog } from "../../utils/generationCatalog.ts";
import { localizedTextState } from "./localizedText.ts";

/** Include current read-only fields and static permissions in planning context. */
const buildPlanningContext = (
  catalog: PuckGenerationCatalog,
  data: Content,
  selectedComponentId?: string | null
) => {
  validateAuthored(catalog, data);
  const inventory = buildEditInventory(catalog, data, selectedComponentId);
  const saved = new Map<string, SavedComponent>();
  walkAuthored(catalog, data, ({ component }) =>
    saved.set(component.props.id, component)
  );
  for (const item of inventory.components) {
    const permissions = catalog.data.components[item.type]?.permissions;
    item.editable &&= permissions?.edit !== false;
    item.canRemove &&= permissions?.delete !== false;
    item.canReorder &&= permissions?.drag !== false;
  }
  for (const collection of inventory.collections) {
    const owner = collection.ownerId
      ? saved.get(collection.ownerId)
      : undefined;
    const permissions = owner
      ? catalog.data.components[owner.type]?.permissions
      : undefined;
    const topField = collection.slotPath
      ? editPath(collection.slotPath)[0]
      : undefined;
    if (
      permissions?.edit === false ||
      permissions?.insert === false ||
      (topField && owner?.readOnly?.[topField])
    ) {
      collection.allowedInsertionTypes = [];
    } else {
      collection.allowedInsertionTypes =
        collection.allowedInsertionTypes.filter(
          (name) => catalog.data.components[name].permissions?.insert !== false
        );
    }
  }
  const byId = new Map(
    inventory.components.map((item) => [item.componentId, item])
  );
  return { inventory, byId, saved };
};

type PlanningContext = ReturnType<typeof buildPlanningContext>;

const checkTask = (
  catalog: PuckGenerationCatalog,
  task: SectionEditTask,
  { inventory, byId, saved }: PlanningContext
) => {
  const section = byId.get(task.sectionId);
  if (
    section &&
    (!section.editable || section.sectionId !== section.componentId)
  ) {
    throw new Error("Task must belong to an editable section.");
  }
  if (
    new Set(task.targetComponentIds).size !== task.targetComponentIds.length
  ) {
    throw new Error("Task targets must be unique.");
  }
  for (const componentId of task.targetComponentIds) {
    const target = byId.get(componentId);
    if (!target?.editable || target.sectionId !== task.sectionId) {
      throw new Error("Task target is protected or outside its section.");
    }
  }
  const anchor = (
    value: EditAnchor,
    collection: EditCollectionRef,
    movingId?: string
  ) => {
    if (!("componentId" in value)) {
      return;
    }
    const target = byId.get(value.componentId);
    if (
      !target ||
      value.componentId === movingId ||
      !sameCollection(target.collection, collection)
    ) {
      throw new Error("Anchor must identify a different existing sibling.");
    }
  };
  let newSections = 0;
  const seen = new Set<string>();
  for (const operation of task.structuralOperations) {
    const key =
      operation.kind === "insert"
        ? `insert:${operation.insertionKey}`
        : `existing:${operation.componentId}`;
    if (seen.has(key)) {
      throw new Error(
        "Structural operations must have unique targets and insertion keys."
      );
    }
    seen.add(key);
    if (operation.kind === "insert") {
      const collection = inventory.collections.find((item) =>
        sameCollection(item, operation.collection)
      );
      const owner = operation.collection.ownerId
        ? byId.get(operation.collection.ownerId)
        : undefined;
      const sectionCollection =
        !operation.collection.ownerId ||
        (owner?.type === "MainContent" &&
          operation.collection.slotPath === "/content");
      if (
        !collection?.allowedInsertionTypes.includes(operation.componentType)
      ) {
        throw new Error("Insertion violates component or slot permissions.");
      }
      if (sectionCollection) {
        newSections++;
        if (section) {
          throw new Error("A new section requires its own task.");
        }
      } else if (!owner?.editable || owner.sectionId !== task.sectionId) {
        throw new Error("Insertion is outside the owning section.");
      }
      anchor(operation.anchor, collection);
    } else {
      const target = byId.get(operation.componentId);
      if (
        !target?.editable ||
        target.sectionId !== task.sectionId ||
        !task.targetComponentIds.includes(operation.componentId)
      ) {
        throw new Error(
          "Structural target is protected or outside task scope."
        );
      }
      const owner = target.parentId ? byId.get(target.parentId) : undefined;
      if (
        (owner &&
          catalog.data.components[owner.type]?.permissions?.edit === false) ||
        (operation.kind === "remove" ? !target.canRemove : !target.canReorder)
      ) {
        throw new Error("Structural operation would change protected content.");
      }
      const topField = target.collection.slotPath
        ? editPath(target.collection.slotPath)[0]
        : undefined;
      if (
        owner &&
        topField &&
        saved.get(owner.componentId)?.readOnly?.[topField]
      ) {
        throw new Error("Cannot restructure a protected slot.");
      }
      if (operation.kind === "reorder") {
        anchor(operation.anchor, target.collection, operation.componentId);
      }
    }
  }
  if (
    !section &&
    (newSections !== 1 ||
      task.structuralOperations.length !== 1 ||
      task.targetComponentIds.length)
  ) {
    throw new Error(
      "A new section task must contain exactly one section insertion."
    );
  }
  if (!task.targetComponentIds.length && !task.structuralOperations.length) {
    throw new Error("Task has no concrete targets or operations.");
  }
  if (
    task.generateContent === false &&
    (!task.structuralOperations.length ||
      task.structuralOperations.some(
        (operation) => operation.kind === "insert"
      ))
  ) {
    throw new Error("Only removal and reorder tasks can skip generation.");
  }
  for (const operation of task.structuralOperations) {
    if (operation.kind !== "remove") {
      continue;
    }
    for (const targetId of task.targetComponentIds) {
      if (byId.get(targetId)?.ancestorIds.includes(operation.componentId)) {
        throw new Error("Task targets a descendant of a component it removes.");
      }
    }
    for (const other of task.structuralOperations) {
      if (
        other.kind === "insert" &&
        (other.collection.ownerId === operation.componentId ||
          byId
            .get(other.collection.ownerId ?? "")
            ?.ancestorIds.includes(operation.componentId))
      ) {
        throw new Error("Task inserts into a component it removes.");
      }
    }
  }
};

/** Validate a section request and retain its canvas context for compilation. */
export const validateSectionEditTask = (
  catalog: PuckGenerationCatalog,
  data: Content,
  input: SectionEditTask
) => {
  const task = sectionEditTaskSchema.parse(input);
  const context = buildPlanningContext(catalog, data);
  checkTask(catalog, task, context);
  return { task, ...context };
};

/** Validate task ownership and the full dependency graph before execution begins. */
const validateEditPlan = (
  catalog: PuckGenerationCatalog,
  context: PlanningContext,
  plan: SectionEditPlan
): SectionEditPlan => {
  validateTaskGraph(plan.tasks);
  for (const task of plan.tasks) {
    checkTask(catalog, task, context);
  }
  if (plan.intent === "globalStyle" || plan.intent === "mixed") {
    if (!plan.globalStyleGuidance?.trim()) {
      throw new Error("Styling requests require global style editor guidance.");
    }
  } else if (plan.globalStyleGuidance !== null) {
    throw new Error("Style guidance requires a styling or mixed request.");
  }
  if (
    plan.intent === "clarification"
      ? !plan.clarification?.trim()
      : plan.clarification !== null
  ) {
    throw new Error("Clarification must match the request intent.");
  }
  const permitsTasks = plan.intent === "content" || plan.intent === "mixed";
  if (permitsTasks ? !plan.tasks.length : !!plan.tasks.length) {
    throw new Error(
      "Only content and mixed requests may contain section tasks."
    );
  }
  return plan;
};

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
    text: z
      .string()
      .min(1)
      .describe(
        "User-facing reply addressed directly to you, not an internal summary about the user. Explain unsupported requests without claiming changes were applied."
      ),
    intent: z
      .enum([
        "content",
        "globalStyle",
        "mixed",
        "conversation",
        "clarification",
      ])
      .describe(
        "Use content for local edits, including batches with unsupported parts. Use mixed only when local edits also require non-null globalStyleGuidance for a supported manual theme change."
      ),
    clarification: z
      .string()
      .min(1)
      .nullable()
      .describe(
        "One user-facing question resolving ambiguity between supported actions. A missing capability is a limitation, not a reason to ask for permission."
      ),
    globalStyleGuidance: z
      .string()
      .min(1)
      .nullable()
      .describe(
        "User-facing guidance for supported global theme settings only. Address you directly; do not include internal notes such as 'The user agreed'. This is advice, not an applied edit."
      ),
    limitations: z
      .string()
      .trim()
      .min(1)
      .nullable()
      .describe(
        "For batches with supported edits, explain unsupported parts here. This note is retained alongside actual task outcomes; never claim edits succeeded. Use null when there are no limitations or no tasks."
      ),
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
