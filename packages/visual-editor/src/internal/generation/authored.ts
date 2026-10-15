import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import { clonePuckResolveData } from "../utils/clonePuckResolveData.ts";
import type { PuckGenerationCatalog } from "../../vite-plugin/layout-generation/puckGenerationCatalog.ts";

export type SavedComponent = {
  type: string;
  props: Record<string, any>;
  [key: string]: any;
};
export type Content = {
  content: SavedComponent[];
  zones?: Record<string, unknown[]>;
};
export type Collection = {
  items: SavedComponent[];
  ownerId?: string;
  path: string;
  field?: { allow?: string[]; disallow?: string[] };
};
export type InventoryItem = {
  component: SavedComponent;
  collection: Collection;
  ancestors: string[];
};
export const unwrap = (schema: z.ZodType): z.ZodType => {
  const def = schema.def as any;
  return ["optional", "nullable", "default", "prefault"].includes(def.type)
    ? unwrap(def.innerType)
    : schema;
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
  )
    throw new Error(
      "Populated legacy zones are unsupported. Migrate the layout before generation."
    );
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
  if (input === undefined || input === null) return input;
  const node = unwrap(schema);
  if (field?.type === "slot") {
    if (!Array.isArray(input))
      throw new Error(`${path}: slot must be an array`);
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
    if (selected < 0)
      throw new Error(
        `${path}: no authored union alternative matches the value`
      );
    return authoredValue(input, alternatives[selected], field, path, onSlot);
  }
  if (node instanceof z.ZodObject) {
    if (typeof input !== "object" || Array.isArray(input)) return clone(input);
    const fields = field?.type === "object" ? field.objectFields : undefined;
    const catchall = node.def.catchall as z.ZodType | undefined;
    const keys =
      catchall && catchall.def.type !== "never"
        ? Object.keys(input)
        : Object.keys(node.shape);
    return Object.fromEntries(
      keys
        .filter((key) => Object.hasOwn(input, key))
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
    if (!Array.isArray(input)) return clone(input);
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
  onCollection: (collection: Collection) => void = () => {}
) => {
  rejectZones(data);
  const visitCollection = (collection: Collection, ancestors: string[]) => {
    onCollection(collection);
    collection.items.forEach((component, index) => {
      if (
        !component ||
        typeof component.type !== "string" ||
        !component.props ||
        typeof component.props !== "object" ||
        Array.isArray(component.props)
      )
        throw new Error(`${collection.path}/${index}: invalid component`);
      onComponent({ component, collection, ancestors });
      const config = catalog.data.components[component.type];
      if (config?.generation)
        authoredValue(
          component.props,
          config.generation.props,
          { type: "object", objectFields: config.fields ?? {} },
          `${collection.path}/${index}/props`,
          (items, path, field) => {
            visitCollection(
              { items, ownerId: component.props.id, path, field },
              [...ancestors, component.props.id]
            );
            return items;
          }
        );
    });
  };
  visitCollection({ items: data.content, path: "content" }, []);
};

export const indexAuthored = (
  catalog: PuckGenerationCatalog,
  data: Content
) => {
  const items = new Map<string, InventoryItem>();
  const collections = new Map<string, Collection>();
  walkAuthored(
    catalog,
    data,
    (item) => {
      const id = item.component.props.id;
      if (typeof id !== "string" || !id.trim())
        throw new Error(`${item.collection.path}: missing component Id`);
      if (items.has(id))
        throw new Error(
          `${item.collection.path}: duplicate component Id ${id}`
        );
      items.set(id, item);
    },
    (collection) => collections.set(collection.path, collection)
  );
  return { items, collections };
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
              input.props,
              config.generation.props,
              { type: "object", objectFields: config.fields ?? {} },
              "props",
              (items) => items.map(component)
            )
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
  indexAuthored(catalog, data);
  walkAuthored(catalog, data, ({ component, collection }) => {
    const config = Object.hasOwn(catalog.data.components, component.type)
      ? catalog.data.components[component.type]
      : undefined;
    if (!config)
      throw new Error(
        `${collection.path}: unknown component ${component.type}`
      );
    if (
      !permitted(component.type, collection.field) ||
      (!collection.ownerId &&
        (config.nestedOnly ||
          (catalog.puckOptions.rootAllowedComponentIds &&
            !catalog.puckOptions.rootAllowedComponentIds.includes(
              component.type
            ))))
    )
      throw new Error(`${collection.path}: ${component.type} is not allowed`);
    if (config.generation) {
      const projected = extractAuthored(catalog, { content: [component] })
        .content[0].props;
      delete projected.id;
      const result = config.generation.props.safeParse(projected);
      if (!result.success)
        throw new Error(
          `${collection.path} (${component.type}, ${component.props.id}): ${result.error.message}`
        );
    }
  });
};
