import type { Permissions } from "@puckeditor/core";
import { isDeepEqual } from "../../../../utils/deepEqual.ts";
import type { PuckGenerationCatalog } from "../../../../utils/createPuckGenerationCatalog.ts";
import { setChildSlotIds } from "../../../../utils/itemSource/createSlottedItemSource.ts";
import {
  assertAuthoredPreserved,
  clone,
  validateAuthored,
  walkAuthored,
  type Content,
  type SavedComponent,
} from "../../shared/authoredValues.ts";
import {
  finalizeSlottedSource,
  isLinkedSource,
  prepareSlottedSource,
} from "../../shared/slottedItemSource.ts";
import { buildEditInventory } from "./buildEditInventory.ts";
import {
  sectionEditResultSchema,
  sectionEditTaskSchema,
} from "./sectionEditTaskSchema.ts";
import type {
  EditAnchor,
  NewEditComponent,
  SectionEditResult,
  SectionEditTask,
} from "./types.ts";
import type { EditCollectionRef } from "./types.ts";
import { sameCollection } from "./utils.ts";
import {
  applyAuthoredValueEdits,
  editPath,
  editSlot,
} from "./applyEditsToComponent.ts";

type EditApplicationOptions = {
  /** Check the editor's current permissions before applying each operation. */
  can?: (
    permission: keyof Permissions,
    component: SavedComponent | null
  ) => boolean;
};

const anchorIndex = (items: SavedComponent[], anchor: EditAnchor): number => {
  if (anchor.position === "start") {
    return 0;
  }
  if (anchor.position === "end") {
    return items.length;
  }
  if (!("componentId" in anchor)) {
    throw new Error("Invalid relative anchor.");
  }
  const index = items.findIndex((item) => item.props.id === anchor.componentId);
  if (index < 0) {
    throw new Error(
      `Anchor is not in the permitted collection. Anchor: ${JSON.stringify(anchor)}. Available sibling Ids: ${JSON.stringify(items.map((item) => item.props.id))}.`
    );
  }
  return index + (anchor.position === "after" ? 1 : 0);
};

/** Execute pure removal and reorder tasks without a generation request. */
export const structuralEditResult = (
  task: SectionEditTask
): SectionEditResult => {
  const parsed = sectionEditTaskSchema.parse(task);
  if (
    parsed.structuralOperations.some((operation) => operation.kind === "insert")
  ) {
    throw new Error("Insertion requires generated component values.");
  }
  return {
    taskId: parsed.taskId,
    sectionId: parsed.sectionId,
    operations: clone(
      parsed.structuralOperations
    ) as SectionEditResult["operations"],
  };
};

/** Apply one task to a clone of the latest layout, never to a generation snapshot. */
export const materializeSectionEdit = <T extends Content>(
  catalog: PuckGenerationCatalog,
  baseline: T,
  taskInput: SectionEditTask,
  resultInput: SectionEditResult,
  options: EditApplicationOptions = {}
): T => {
  const task = sectionEditTaskSchema.parse(taskInput);
  const result = sectionEditResultSchema.parse(resultInput);
  if (task.taskId !== result.taskId || task.sectionId !== result.sectionId) {
    throw new Error("Section result does not match its task.");
  }
  const candidate = clone(baseline);
  const initial = buildEditInventory(catalog, candidate);
  const initialById = new Map(
    initial.components.map((item) => [item.componentId, item])
  );
  const existingSection = initialById.get(task.sectionId);
  if (
    existingSection &&
    (existingSection.sectionId !== task.sectionId || !existingSection.editable)
  ) {
    throw new Error("Task must belong to an editable section.");
  }
  if (
    new Set(task.targetComponentIds).size !== task.targetComponentIds.length
  ) {
    throw new Error("Task contains duplicate targets.");
  }
  for (const targetId of task.targetComponentIds) {
    const target = initialById.get(targetId);
    if (!target?.editable || target.sectionId !== task.sectionId) {
      throw new Error("Task target is protected or outside its section.");
    }
  }
  const structure = result.operations
    .filter((operation) => operation.kind !== "update")
    .map((operation) => {
      if (operation.kind !== "insert") {
        return operation;
      }
      const { component, ...planned } = operation;
      return { ...planned, componentType: component.type };
    });
  if (!isDeepEqual(structure, task.structuralOperations)) {
    throw new Error(
      "Section result changed the planned structural operations."
    );
  }
  const reservedIds = new Set<string>();
  const scanIds = (value: any, seen = new WeakSet<object>()) => {
    if (!value || typeof value !== "object" || seen.has(value)) {
      return;
    }
    seen.add(value);
    if (typeof value.type === "string" && typeof value.props?.id === "string") {
      reservedIds.add(value.props.id);
    }
    Object.values(value).forEach((child) => scanIds(child, seen));
  };
  scanIds(baseline);
  if (!existingSection && reservedIds.has(task.sectionId)) {
    throw new Error("New section Id is already in use.");
  }
  reservedIds.add(task.sectionId);
  const allocateId = () => {
    const componentId = `generated-${crypto.randomUUID()}`;
    if (reservedIds.has(componentId)) {
      throw new Error("New component Id is already in use.");
    }
    reservedIds.add(componentId);
    return componentId;
  };
  const requirePermission = (
    permission: keyof Permissions,
    component: SavedComponent | null
  ) => {
    if (options.can?.(permission, component) === false) {
      throw new Error(`Editor permission denied: ${permission}`);
    }
  };
  const changedIds = new Set<string>();
  const newComponents = new WeakSet<SavedComponent>();
  const createComponent = (input: NewEditComponent): SavedComponent => {
    const config = Object.hasOwn(catalog.data.components, input.type)
      ? catalog.data.components[input.type]
      : undefined;
    if (!config?.generation || input.type === "MainContent") {
      throw new Error("Cannot insert a protected component type.");
    }
    const component: SavedComponent = {
      type: input.type,
      props: clone(config.defaultProps ?? {}),
    };
    applyAuthoredValueEdits(
      component,
      config,
      Object.entries(input.authoredValues).map(([key, value]) => ({
        kind: "set",
        path: `/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`,
        value,
      })),
      true
    );
    if (
      new Set(input.slots.map((slot) => slot.slotPath)).size !==
      input.slots.length
    ) {
      throw new Error("New component contains duplicate slots.");
    }
    for (const slot of input.slots) {
      const children = editSlot(component, config, slot.slotPath, true);
      children.splice(
        0,
        children.length,
        ...slot.components.map(createComponent)
      );
    }
    applyAuthoredValueEdits(
      component,
      config,
      (input.unsetPaths ?? []).map((path) => ({ kind: "unset", path })),
      true
    );
    // Defaults may contain nested templates; every new descendant needs a fresh Id.
    walkAuthored(catalog, { content: [component] }, ({ component: child }) => {
      const childConfig = catalog.data.components[child.type];
      if (!childConfig?.generation) {
        throw new Error("New descendants require generation schemas.");
      }
      if (!newComponents.has(child)) {
        prepareSlottedSource(
          child,
          childConfig,
          child === component &&
            input.slots.some((slot) => slot.slotPath === "/slots/CardSlot")
        );
        child.props.id = allocateId();
        newComponents.add(child);
        requirePermission("insert", child);
      }
    });
    return component;
  };
  let insertedSection = false;
  for (const operation of result.operations) {
    const inventory = buildEditInventory(catalog, candidate);
    const byId = new Map(
      inventory.components.map((item) => [item.componentId, item])
    );
    const saved = new Map<string, SavedComponent>();
    walkAuthored(catalog, candidate, ({ component }) =>
      saved.set(component.props.id, component)
    );
    const collectionItems = (ref: EditCollectionRef) => {
      const collection = inventory.collections.find((item) =>
        sameCollection(item, ref)
      );
      if (!collection) {
        throw new Error("Collection is not an authored slot.");
      }
      const owner = ref.ownerId ? saved.get(ref.ownerId)! : undefined;
      return {
        collection,
        owner,
        items: owner
          ? editSlot(owner, catalog.data.components[owner.type], ref.slotPath!)
          : candidate.content,
      };
    };
    if (operation.kind === "insert") {
      const { collection, owner, items } = collectionItems(
        operation.collection
      );
      const sectionCollection =
        !owner ||
        (owner.type === "MainContent" &&
          operation.collection.slotPath === "/content");
      if (
        sectionCollection
          ? !!existingSection || insertedSection
          : !owner || byId.get(owner.props.id)?.sectionId !== task.sectionId
      ) {
        throw new Error("Insertion is outside the task's section.");
      }
      if (!sectionCollection && !byId.get(owner!.props.id)?.editable) {
        throw new Error("Cannot insert into a protected component.");
      }
      if (owner?.readOnly?.[editPath(operation.collection.slotPath!)[0]]) {
        throw new Error("Cannot insert into a read-only slot.");
      }
      if (
        !collection.allowedInsertionTypes.includes(operation.component.type)
      ) {
        throw new Error("Component type is not permitted in this collection.");
      }
      requirePermission("edit", owner ?? null);
      requirePermission("insert", owner ?? null);
      const component = createComponent(operation.component);
      if (sectionCollection) {
        component.props.id = task.sectionId;
        insertedSection = true;
      }
      items.splice(anchorIndex(items, operation.anchor), 0, component);
      changedIds.add(component.props.id);
      if (owner) {
        changedIds.add(owner.props.id);
      }
      continue;
    }
    const target = byId.get(operation.componentId);
    const component = saved.get(operation.componentId);
    if (
      !target?.editable ||
      !component ||
      target.sectionId !== task.sectionId ||
      (operation.kind === "update" &&
        !task.targetComponentIds.includes(operation.componentId))
    ) {
      throw new Error("Operation target is protected or outside task scope.");
    }
    changedIds.add(operation.componentId);
    if (operation.kind === "update") {
      requirePermission("edit", component);
      const config = catalog.data.components[component.type];
      const wasLinked =
        !!config.generation?.slottedItemSource &&
        isLinkedSource(component.props);
      applyAuthoredValueEdits(component, config, operation.changes);
      if (
        config.generation?.slottedItemSource &&
        wasLinked !== isLinkedSource(component.props)
      ) {
        const manualSlots = component.props.manualSlots;
        if (wasLinked) {
          component.props.slots.CardSlot = clone(
            component.props.manualSlots.CardSlot
          );
        }
        prepareSlottedSource(component, config, wasLinked);
        component.props.manualSlots = {
          ...manualSlots,
          ...component.props.manualSlots,
        };
      }
    } else {
      if (
        operation.kind === "remove" ? !target.canRemove : !target.canReorder
      ) {
        throw new Error("Structural operation would change protected content.");
      }
      const { owner, items } = collectionItems(target.collection);
      if (owner?.readOnly?.[editPath(target.collection.slotPath!)[0]]) {
        throw new Error("Cannot change a read-only slot.");
      }
      requirePermission(
        operation.kind === "remove" ? "delete" : "drag",
        component
      );
      if (owner) {
        requirePermission("edit", owner);
      }
      const index = items.findIndex(
        (item) => item.props.id === operation.componentId
      );
      items.splice(index, 1);
      if (operation.kind === "reorder") {
        items.splice(anchorIndex(items, operation.anchor), 0, component);
      }
      if (owner) {
        changedIds.add(owner.props.id);
      }
    }
  }
  if (!existingSection && !insertedSection) {
    throw new Error("New section task did not insert its section.");
  }
  const finalInventory = buildEditInventory(catalog, candidate);
  const affectedIds = new Set(changedIds);
  for (const item of finalInventory.components)
    if (changedIds.has(item.componentId)) {
      item.ancestorIds.forEach((ancestorId) => affectedIds.add(ancestorId));
    }
  const sources: SavedComponent[] = [];
  walkAuthored(catalog, candidate, ({ component }) => {
    if (
      (affectedIds.has(component.props.id) || newComponents.has(component)) &&
      catalog.data.components[component.type]?.generation?.slottedItemSource
    ) {
      sources.push(component);
    }
  });
  for (const source of sources.reverse()) {
    const config = catalog.data.components[source.type];
    // The helper's convention is safe only for new children; existing identities stay fixed.
    const cards = isLinkedSource(source.props)
      ? (source.props.manualSlots?.CardSlot ?? [])
      : source.props.slots.CardSlot;
    for (const card of cards) {
      const convention = setChildSlotIds(clone(card), card.props.id);
      for (const [slotName, children] of Object.entries(
        card.props.slots ?? {}
      )) {
        (children as SavedComponent[]).forEach((child, index) => {
          if (newComponents.has(child)) {
            child.props.id = (convention.props.slots as any)[slotName][
              index
            ].props.id;
            delete child.props.parentData;
          }
        });
      }
    }
    finalizeSlottedSource(source, config, true);
  }
  const finalById = new Map(
    buildEditInventory(catalog, candidate).components.map((item) => [
      item.componentId,
      item,
    ])
  );
  for (const item of initial.components) {
    const after = finalById.get(item.componentId);
    if (after && after.type !== item.type) {
      throw new Error("Existing component identity changed.");
    }
  }
  validateAuthored(catalog, candidate);
  return candidate;
};

/** Verify authored resolution, then restore existing opaque values and editor metadata. */
export const preserveSectionEditResolution = <T extends Content>(
  catalog: PuckGenerationCatalog,
  resolved: T,
  candidate: T
): T => {
  assertAuthoredPreserved(catalog, resolved, candidate);
  const inventory = buildEditInventory(catalog, candidate);
  const restore = (
    expected: SavedComponent,
    actual: SavedComponent
  ): SavedComponent => {
    const config = catalog.data.components[expected.type];
    if (!config?.generation) {
      return clone(expected);
    }
    const component = {
      ...actual,
      ...clone(expected),
      props: { ...actual.props, ...clone(expected.props) },
    };
    for (const collection of inventory.collections.filter(
      (item) => item.ownerId === expected.props.id
    )) {
      if (collection.slotPath === "/manualSlots/CardSlot") {
        continue;
      }
      if (
        config.generation.slottedItemSource &&
        isLinkedSource(expected.props) &&
        collection.slotPath === "/slots/CardSlot"
      ) {
        component.props.slots.CardSlot = clone(actual.props.slots.CardSlot);
        continue;
      }
      const children = editSlot(component, config, collection.slotPath!);
      const actualChildren = editSlot(actual, config, collection.slotPath!);
      children.splice(
        0,
        children.length,
        ...children.map((child, index) => restore(child, actualChildren[index]))
      );
    }
    return component;
  };
  const restored = {
    ...resolved,
    ...clone(candidate),
    content: candidate.content.map((component, index) =>
      restore(component, resolved.content[index])
    ),
  };
  validateAuthored(catalog, restored);
  return restored;
};
