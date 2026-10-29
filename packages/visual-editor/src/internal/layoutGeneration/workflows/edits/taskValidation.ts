import type { PuckGenerationCatalog } from "../../../../utils/createPuckGenerationCatalog.ts";
import {
  validateAuthored,
  walkAuthored,
  type Content,
  type SavedComponent,
} from "../../shared/authoredValues.ts";
import { buildEditInventory } from "./buildEditInventory.ts";
import { sectionEditTaskSchema } from "./sectionEditTaskSchema.ts";
import type {
  EditAnchor,
  EditCollectionRef,
  SectionEditPlan,
  SectionEditTask,
} from "./types.ts";
import { sameCollection, validateTaskGraph } from "./utils.ts";
import { editPath } from "./applyEditsToComponent.ts";

/** Include current read-only fields and static permissions in planning context. */
export const buildPlanningContext = (
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
      if (!target?.editable || target.sectionId !== task.sectionId) {
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
    const affectedIds = new Set([
      ...task.targetComponentIds,
      ...task.structuralOperations.flatMap((operation) =>
        operation.kind === "insert" ? [] : [operation.componentId]
      ),
    ]);
    for (const targetId of affectedIds) {
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
export const validateEditPlan = (
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
