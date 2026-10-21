import type { PuckGenerationCatalog } from "../../../utils/generationCatalog.ts";
import {
  authoredValue,
  permitted,
  walkAuthored,
  type Content,
} from "../shared/authoredValues.ts";
import {
  generationFields,
  isLinkedSource,
  slottedAuthoredProps,
} from "../shared/slottedItemSource.ts";
import type { EditCollectionRef } from "./types.ts";

type EditInventoryComponent = {
  /** The saved component's unique Id. */
  componentId: string;
  /** The registered component name. */
  type: string;
  /** Catalog guidance for using this component. */
  description: string;
  /** Declared values only, with child slots represented separately. */
  authoredValues: Record<string, unknown>;
  /** Zero-based order in the traversed component tree. */
  displayOrder: number;
  /** Zero-based position within the containing collection. */
  position: number;
  /** The parent component's Id, or null at the page root. */
  parentId: string | null;
  /** Ancestor Ids ordered from the page root to the parent. */
  ancestorIds: string[];
  /** The owning section's Id, or null for MainContent. */
  sectionId: string | null;
  /** The collection containing this component. */
  collection: EditCollectionRef;
  /** Whether this component's authored values can be edited. */
  editable: boolean;
  /** Why this component is protected from edits. */
  protectedReason?: "scaffolding" | "opaque" | "inactiveManual";
  /** Whether any traversed descendant lacks a generation schema. */
  hasOpaqueDescendants: boolean;
  /** Whether removal would avoid protected content. */
  canRemove: boolean;
  /** Whether reordering would avoid protected content. */
  canReorder: boolean;
};

type EditInventoryCollection = EditCollectionRef & {
  /** Saved component Ids in collection order. */
  componentIds: string[];
  /** Generation-enabled types permitted for insertion. */
  allowedInsertionTypes: string[];
  /** Slot type allowlist; an empty list allows all types. */
  allow?: string[];
  /** Component types forbidden by the slot. */
  disallow?: string[];
};

type EditInventory = {
  /** Components available for targeting, including protected boundaries. */
  components: EditInventoryComponent[];
  /** Authored collections and their insertion restrictions. */
  collections: EditInventoryCollection[];
  /** The selected component's Id, or null if absent from the inventory. */
  selectedComponentId: string | null;
  /** The selected component's owning section Id, when available. */
  selectedSectionId: string | null;
};

/**
 * Read-only targeting context for follow-ups. Opaque components are boundaries:
 * neither their values nor their children are exposed. Populated zones are
 * rejected, and root settings are omitted. Explicit user references override the
 * captured selection; ambiguous targets must be clarified by the planner.
 */
export const buildEditInventory = (
  catalog: PuckGenerationCatalog,
  data: Content,
  selectedComponentId?: string | null
): EditInventory => {
  const components: EditInventoryComponent[] = [];
  const collections: EditInventoryCollection[] = [];
  const byId = new Map<string, EditInventoryComponent>();
  const propsPaths = new Map<string, string>();
  const collectionRefs = new Map<string, EditCollectionRef>();
  walkAuthored(
    catalog,
    data,
    ({ component, collection }) => {
      const componentId = component.props.id;
      if (typeof componentId !== "string" || !componentId.trim()) {
        throw new Error(`${collection.path}: missing component Id`);
      }
      if (byId.has(componentId)) {
        throw new Error(
          `${collection.path}: duplicate component Id ${componentId}`
        );
      }
      const parent = collection.ownerId
        ? byId.get(collection.ownerId)
        : undefined;
      const config = Object.hasOwn(catalog.data.components, component.type)
        ? catalog.data.components[component.type]
        : undefined;
      const position = collection.items.indexOf(component);
      propsPaths.set(componentId, `${collection.path}/${position}/props`);
      const ref = collectionRefs.get(collection.path)!;
      const inactiveManual =
        parent?.protectedReason === "inactiveManual" ||
        ref.slotPath === "/manualSlots/CardSlot";
      const protectedReason = !config?.generation
        ? "opaque"
        : component.type === "MainContent"
          ? "scaffolding"
          : inactiveManual
            ? "inactiveManual"
            : undefined;
      const item: EditInventoryComponent = {
        componentId,
        type: component.type,
        description: config?.description ?? "",
        authoredValues:
          config?.generation && !inactiveManual
            ? authoredValue(
                slottedAuthoredProps(component, config),
                config.generation.props,
                { type: "object", objectFields: generationFields(config) },
                "props",
                () => []
              )
            : {},
        displayOrder: components.length,
        position,
        parentId: parent?.componentId ?? null,
        ancestorIds: parent ? [...parent.ancestorIds, parent.componentId] : [],
        sectionId:
          component.type === "MainContent"
            ? null
            : !parent || parent.type === "MainContent"
              ? componentId
              : parent.sectionId,
        collection: ref,
        editable: protectedReason === undefined,
        ...(protectedReason ? { protectedReason } : {}),
        hasOpaqueDescendants: false,
        canRemove: protectedReason === undefined,
        canReorder: protectedReason === undefined,
      };
      components.push(item);
      byId.set(componentId, item);
    },
    {
      onCollection: (collection) => {
        const owner = collection.ownerId
          ? byId.get(collection.ownerId)
          : undefined;
        const slotPath = collection.ownerId
          ? collection.path.slice(propsPaths.get(collection.ownerId)!.length)
          : null;
        const ref = { ownerId: collection.ownerId ?? null, slotPath };
        collectionRefs.set(collection.path, ref);
        const config = owner ? catalog.data.components[owner.type] : undefined;
        const linkedCards =
          !!config?.generation?.slottedItemSource &&
          isLinkedSource(owner?.authoredValues ?? {});
        collections.push({
          ...ref,
          componentIds: collection.items.map((component) => component.props.id),
          ...(collection.field?.allow
            ? { allow: [...collection.field.allow] }
            : {}),
          ...(collection.field?.disallow
            ? { disallow: [...collection.field.disallow] }
            : {}),
          allowedInsertionTypes:
            owner?.protectedReason === "inactiveManual" ||
            slotPath === "/manualSlots/CardSlot" ||
            (linkedCards && slotPath === "/slots/CardSlot")
              ? []
              : Object.entries(catalog.data.components)
                  .filter(
                    ([name, candidate]) =>
                      name !== "MainContent" &&
                      !!candidate.generation &&
                      permitted(name, collection.field) &&
                      (owner ||
                        (!candidate.nestedOnly &&
                          (!catalog.puckOptions.rootAllowedComponentIds ||
                            catalog.puckOptions.rootAllowedComponentIds.includes(
                              name
                            ))))
                  )
                  .map(([name]) => name),
        });
      },
    }
  );
  for (const item of components) {
    if (item.protectedReason !== "opaque") {
      continue;
    }
    for (const ancestorId of item.ancestorIds) {
      const ancestor = byId.get(ancestorId)!;
      ancestor.hasOpaqueDescendants = true;
      ancestor.canRemove = false;
      ancestor.canReorder = false;
    }
  }
  const selected = selectedComponentId
    ? byId.get(selectedComponentId)
    : undefined;
  return {
    components,
    collections,
    selectedComponentId: selected?.componentId ?? null,
    selectedSectionId: selected?.sectionId ?? null,
  };
};
