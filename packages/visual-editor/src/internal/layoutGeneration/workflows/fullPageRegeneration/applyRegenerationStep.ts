import type { Permissions } from "@puckeditor/core";
import type { PuckGenerationCatalog } from "../../../../utils/createPuckGenerationCatalog.ts";
import {
  clone,
  validateAuthored,
  walkAuthored,
  type Content,
  type SavedComponent,
} from "../../shared/authoredValues.ts";
import { materializeSectionEdit } from "../edits/applyEditsToLayout.ts";
import { buildEditInventory } from "../edits/buildEditInventory.ts";
import type {
  EditAnchor,
  EditCollectionRef,
  SectionEditOperation,
  SectionEditTask,
} from "../edits/types.ts";
import { sameCollection } from "../edits/utils.ts";
import { regenerationStepSchema, type RegenerationStep } from "./contracts.ts";

/** Apply a whole-section step atomically, preserving every untouched saved value. */
export const applyRegenerationStep = <T extends Content>(
  catalog: PuckGenerationCatalog,
  baseline: T,
  input: RegenerationStep,
  can: (
    permission: keyof Permissions,
    component: SavedComponent | null
  ) => boolean = () => true
): T => {
  const step = regenerationStepSchema.parse(input);
  let candidate = clone(baseline);
  const inventory = buildEditInventory(catalog, candidate);
  const section =
    "sectionId" in step
      ? inventory.components.find((item) => item.componentId === step.sectionId)
      : undefined;
  if ("sectionId" in step && (!section || section.sectionId !== step.sectionId))
    throw new Error(
      "Regeneration must target an existing section, not scaffolding or nested components."
    );
  if (step.kind === "keep") return candidate;
  const structure = (
    operation: Extract<SectionEditOperation, { kind: "remove" | "reorder" }>
  ) => {
    const task: SectionEditTask = {
      taskId: crypto.randomUUID(),
      sectionId: section!.componentId,
      targetComponentIds: [section!.componentId],
      instructions: "Regenerate page",
      structuralOperations: [operation],
      dependsOn: [],
    };
    candidate = materializeSectionEdit(
      catalog,
      candidate,
      task,
      {
        taskId: task.taskId,
        sectionId: task.sectionId,
        operations: [operation],
      },
      { can }
    );
  };
  if (step.kind === "remove" || step.kind === "reorder") {
    structure(
      step.kind === "remove"
        ? { kind: "remove", componentId: step.sectionId }
        : { kind: "reorder", componentId: step.sectionId, anchor: step.anchor }
    );
    return candidate;
  }
  let collection: EditCollectionRef;
  let anchor: EditAnchor;
  if (step.kind === "replace") {
    collection = section!.collection;
    const siblings = inventory.collections.find((item) =>
      sameCollection(item, collection)
    )!.componentIds;
    const next = siblings[siblings.indexOf(step.sectionId) + 1];
    anchor = next
      ? { position: "before", componentId: next }
      : { position: "end" };
    structure({ kind: "remove", componentId: step.sectionId });
  } else {
    collection = step.collection;
    anchor = step.anchor;
  }
  const destination = buildEditInventory(catalog, candidate).collections.find(
    (item) => sameCollection(item, collection)
  );
  const saved = new Map<string, SavedComponent>();
  walkAuthored(catalog, candidate, ({ component }) =>
    saved.set(component.props.id, component)
  );
  const owner = collection.ownerId ? saved.get(collection.ownerId) : undefined;
  if (
    !destination ||
    (collection.ownerId !== null &&
      (!owner ||
        owner.type !== "MainContent" ||
        collection.slotPath !== "/content")) ||
    (collection.ownerId === null && collection.slotPath !== null)
  )
    throw new Error(
      "Regeneration insertion requires a page section collection."
    );
  const requirePermission = (
    permission: keyof Permissions,
    component: SavedComponent | null
  ) => {
    if (!can(permission, component))
      throw new Error(`Editor permission denied: ${permission}`);
  };
  if (owner?.readOnly?.content)
    throw new Error("Cannot insert into a read-only slot.");
  requirePermission("edit", owner ?? null);
  requirePermission("insert", owner ?? null);
  const additions = clone(step.sections);
  for (const component of additions) {
    if (
      component.type === "MainContent" ||
      !destination.allowedInsertionTypes.includes(component.type)
    )
      throw new Error(
        "Component type is not permitted in this section collection."
      );
  }
  const reserved = new Set(
    inventory.components.map((item) => item.componentId)
  );
  walkAuthored(catalog, { content: additions }, ({ component }) => {
    requirePermission("insert", component);
    if (!component.props.id || reserved.has(component.props.id))
      throw new Error(
        "Generated component identity is missing or already in use."
      );
    reserved.add(component.props.id);
  });
  const items: SavedComponent[] = owner
    ? owner.props.content
    : candidate.content;
  let index = anchor.position === "start" ? 0 : items.length;
  if ("componentId" in anchor) {
    index = items.findIndex((item) => item.props.id === anchor.componentId);
    if (index < 0)
      throw new Error(
        `Anchor is not in the permitted collection. Anchor: ${JSON.stringify(anchor)}. Destination: ${JSON.stringify(collection)}. Available sibling Ids: ${JSON.stringify(items.map((item) => item.props.id))}.`
      );
    if (anchor.position === "after") index++;
  }
  items.splice(index, 0, ...additions);
  validateAuthored(catalog, candidate);
  return candidate;
};
