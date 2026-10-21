import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import { unwrapZodSchema as unwrap } from "../utils/unwrapZodSchema.ts";
import { isDeepEqual } from "../../utils/deepEqual.ts";
import { clonePuckResolveData } from "../utils/clonePuckResolveData.ts";
import type { PuckGenerationCatalog } from "../../utils/generationCatalog.ts";
import {
  generationFields,
  isLinkedSource,
  manualBackup,
  slottedAuthoredProps,
  validateSlottedSource,
  validateLinkedCardStructure,
} from "./slottedItemSource.ts";

export type SavedComponent = {
  type: string;
  props: Record<string, any>;
  [key: string]: any;
};
export type Content = {
  content: SavedComponent[];
  zones?: Record<string, unknown[]>;
};
type Collection = {
  items: SavedComponent[];
  ownerId?: string;
  path: string;
  field?: { allow?: string[]; disallow?: string[] };
};
type InventoryItem = {
  component: SavedComponent;
  collection: Collection;
};
export const permitted = (name: string, field?: Collection["field"]) =>
  !field?.disallow?.includes(name) &&
  (!field?.allow?.length || field.allow.includes(name));
export const clone = clonePuckResolveData;
export const rejectZones = (data: Content) => {
  if (
    Object.values(data.zones ?? {}).some(
      (items) => !Array.isArray(items) || items.length
    )
  ) {
    throw new Error(
      "Populated legacy zones are unsupported. Migrate the layout before generation."
    );
  }
};

/** Shared value traversal used by extraction, indexing, slot handling and Id allocation. */
const authoredValue = (
  input: any,
  schema: z.ZodType,
  field: Fields[string] | undefined,
  path: string,
  onSlot: (
    items: SavedComponent[],
    path: string,
    field: NonNullable<Collection["field"]>
  ) => SavedComponent[]
): any => {
  if (input === undefined || input === null) {
    return input;
  }
  const node = unwrap(schema);
  if (field?.type === "slot") {
    if (!Array.isArray(input)) {
      throw new Error(`${path}: slot must be an array`);
    }
    return onSlot(input, path, field);
  }
  if (node instanceof z.ZodUnion) {
    const alternatives = node.options as z.ZodType[];
    const projected = alternatives.map((option) => {
      try {
        return {
          value: authoredValue(input, option, field, path, (items) => items),
        };
      } catch {
        return undefined;
      }
    });
    let selected = alternatives.findIndex(
      (option, index) =>
        projected[index] !== undefined &&
        option.safeParse(projected[index]!.value).success
    );
    if (selected < 0) {
      // Incomplete defaults can be filled by explicit overrides. Select their
      // structural branch without exposing undeclared properties to the model.
      selected = alternatives.findIndex((option) => {
        const candidate = unwrap(option);
        if (
          candidate instanceof z.ZodObject &&
          typeof input === "object" &&
          !Array.isArray(input)
        ) {
          return Object.entries(candidate.shape).every(([key, value]) => {
            const child = unwrap(value as z.ZodType);
            return (
              !["literal", "enum"].includes(child.def.type) ||
              !Object.hasOwn(input, key) ||
              child.safeParse(input[key]).success
            );
          });
        }
        return (
          (candidate instanceof z.ZodArray && Array.isArray(input)) ||
          candidate.def.type === typeof input
        );
      });
    }
    if (selected < 0) {
      throw new Error(
        `${path}: no authored union alternative matches the value`
      );
    }
    return authoredValue(input, alternatives[selected], field, path, onSlot);
  }
  if (node instanceof z.ZodObject) {
    if (typeof input !== "object" || Array.isArray(input)) {
      return clone(input);
    }
    const fields = field?.type === "object" ? field.objectFields : undefined;
    const catchall = node.def.catchall as z.ZodType | undefined;
    const keys =
      catchall && catchall.def.type !== "never"
        ? Object.keys(input)
        : Object.keys(node.shape);
    return Object.fromEntries(
      keys
        .filter((key) => Object.hasOwn(input, key) && input[key] !== undefined)
        .map((key) => [
          key,
          authoredValue(
            input[key],
            node.shape[key] ?? catchall!,
            fields?.[key],
            `${path}/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`,
            onSlot
          ),
        ])
    );
  }
  if (node instanceof z.ZodArray) {
    if (!Array.isArray(input)) {
      return clone(input);
    }
    return input.map((item: any, index: number) =>
      authoredValue(
        item,
        node.element as z.ZodType,
        field?.type === "array"
          ? { type: "object", objectFields: field.arrayFields }
          : undefined,
        `${path}/${index}`,
        onSlot
      )
    );
  }
  return clone(input);
};

/** Undeclared slots are system-owned and cannot enter the authored inventory. */
export const walkAuthored = (
  catalog: PuckGenerationCatalog,
  data: Content,
  onComponent: (item: InventoryItem) => void,
  options: {
    /** Visit each authored collection, including empty slots. */
    onCollection?: (collection: Collection) => void;
  } = {}
) => {
  rejectZones(data);
  const visitCollection = (collection: Collection) => {
    options.onCollection?.(collection);
    collection.items.forEach((component, index) => {
      if (
        !component ||
        typeof component.type !== "string" ||
        !component.props ||
        typeof component.props !== "object" ||
        Array.isArray(component.props)
      ) {
        throw new Error(`${collection.path}/${index}: invalid component`);
      }
      onComponent({ component, collection });
      const config = catalog.data.components[component.type];
      if (config?.generation) {
        authoredValue(
          slottedAuthoredProps(component, config),
          config.generation.props,
          { type: "object", objectFields: generationFields(config) },
          `${collection.path}/${index}/props`,
          (items, path, field) => {
            visitCollection({
              items,
              ownerId: component.props.id,
              path,
              field,
            });
            return items;
          }
        );
      }
      if (
        config?.generation?.slottedItemSource &&
        isLinkedSource(component.props)
      ) {
        visitCollection({
          items: manualBackup(component),
          ownerId: component.props.id,
          path: `${collection.path}/${index}/props/manualSlots/CardSlot`,
          field: { allow: [config.generation.slottedItemSource.cardType] },
        });
      }
    });
  };
  visitCollection({ items: data.content, path: "content" });
};

export type EditCollectionRef = {
  /** Null identifies the page-root collection. */
  ownerId: string | null;
  /** JSON pointer relative to the owner's props; null at the page root. */
  slotPath: string | null;
};

export type EditInventoryComponent = {
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

export type EditInventoryCollection = EditCollectionRef & {
  /** Saved component Ids in collection order. */
  componentIds: string[];
  /** Generation-enabled types permitted for insertion. */
  allowedInsertionTypes: string[];
  /** Slot type allowlist; an empty list allows all types. */
  allow?: string[];
  /** Component types forbidden by the slot. */
  disallow?: string[];
};

export type EditInventory = {
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

/** Collect authored identities and reject missing or duplicate Ids. */
export const collectAuthoredIds = (
  catalog: PuckGenerationCatalog,
  data: Content
) => {
  const ids = new Set<string>();
  walkAuthored(catalog, data, ({ component, collection }) => {
    const id = component.props.id;
    if (typeof id !== "string" || !id.trim()) {
      throw new Error(`${collection.path}: missing component Id`);
    }
    if (ids.has(id)) {
      throw new Error(`${collection.path}: duplicate component Id ${id}`);
    }
    ids.add(id);
  });
  return ids;
};

/** Project only declared authored values; never strip data by property name. */
export const extractAuthored = (
  catalog: PuckGenerationCatalog,
  data: Content,
  options: { includeIds?: boolean } = {}
) => {
  const component = (input: SavedComponent): SavedComponent => {
    const config = catalog.data.components[input.type];
    return {
      type: input.type,
      props: {
        ...(options.includeIds === false ? {} : { id: input.props.id }),
        ...(config?.generation
          ? authoredValue(
              slottedAuthoredProps(input, config),
              config.generation.props,
              { type: "object", objectFields: generationFields(config) },
              "props",
              (items) => items.map(component)
            )
          : {}),
        ...(config?.generation?.slottedItemSource &&
        isLinkedSource(input.props) &&
        options.includeIds !== false
          ? { manualSlots: { CardSlot: manualBackup(input).map(component) } }
          : {}),
      },
    };
  };
  return { content: data.content.map(component) };
};

export const validateAuthored = (
  catalog: PuckGenerationCatalog,
  data: Content
) => {
  const seenIds = collectAuthoredIds(catalog, data);
  walkAuthored(catalog, data, ({ component, collection }) => {
    const config = Object.hasOwn(catalog.data.components, component.type)
      ? catalog.data.components[component.type]
      : undefined;
    if (!config) {
      throw new Error(
        `${collection.path}: unknown component ${component.type}`
      );
    }
    if (
      !permitted(component.type, collection.field) ||
      (!collection.ownerId &&
        (config.nestedOnly ||
          (catalog.puckOptions.rootAllowedComponentIds &&
            !catalog.puckOptions.rootAllowedComponentIds.includes(
              component.type
            ))))
    ) {
      throw new Error(`${collection.path}: ${component.type} is not allowed`);
    }
    validateSlottedSource(component, config);
    validateLinkedCardStructure(component, config, catalog, seenIds);
    if (
      config.generation?.slottedItemSource &&
      !isLinkedSource(component.props) &&
      !isDeepEqual(
        extractAuthored(catalog, { content: component.props.slots.CardSlot }),
        extractAuthored(catalog, { content: manualBackup(component) })
      )
    ) {
      throw new Error(
        `${component.type} (${component.props.id}): invalid props/manualSlots/CardSlot`
      );
    }
    if (config.generation) {
      const projected = extractAuthored(catalog, { content: [component] })
        .content[0].props;
      delete projected.id;
      const result = config.generation.props.safeParse(projected);
      if (!result.success) {
        throw new Error(
          `${collection.path} (${component.type}, ${component.props.id}): ${result.error.issues.map((issue) => `props/${issue.path.join("/")}: ${issue.code}`).join(", ")}`
        );
      }
    }
  });
};

/** Report a bounded location, never authored values, when resolution changes content. */
export const assertAuthoredPreserved = (
  catalog: PuckGenerationCatalog,
  resolved: Content,
  candidate: Content
) => {
  validateAuthored(catalog, resolved);
  const compare = (
    expected: any,
    actual: any,
    path: string,
    owner?: SavedComponent
  ): void => {
    if (Object.is(expected, actual)) {
      return;
    }
    const context =
      expected && typeof expected.type === "string" && expected.props
        ? expected
        : owner;
    if (
      expected &&
      actual &&
      typeof expected === "object" &&
      typeof actual === "object" &&
      Array.isArray(expected) === Array.isArray(actual)
    ) {
      const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
      for (const key of keys) {
        if (Object.hasOwn(expected, key) !== Object.hasOwn(actual, key)) {
          throw new Error(
            `Resolution changed authored state at ${context?.type ?? "page"} (${context?.props.id ?? "root"}): ${path}/${key}`
          );
        }
        compare(expected[key], actual[key], `${path}/${key}`, context);
      }
      if (!Array.isArray(expected) || expected.length === actual.length) {
        return;
      }
    }
    throw new Error(
      `Resolution changed authored state at ${context?.type ?? "page"} (${context?.props.id ?? "root"}): ${path}`
    );
  };
  compare(
    extractAuthored(catalog, candidate),
    extractAuthored(catalog, resolved),
    ""
  );
};
