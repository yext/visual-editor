import { z } from "zod";
import type { Fields } from "@puckeditor/core";
import { unwrapZodSchema as unwrap } from "../utils/unwrapZodSchema.ts";
import { clone, permitted, type SavedComponent } from "./authored.ts";
import {
  generationFields,
  preflightSlottedItemSource,
  isLinkedSource,
} from "./slottedItemSource.ts";
import type { PuckGenerationCatalog } from "../../utils/generationCatalog.ts";
import { localizedTextSchema } from "./localizedText.ts";
import { exportGenerationSchema } from "./strictGenerationSchema.ts";

type SchemaNode = {
  /** The strict model-facing schema. */
  wire: z.ZodType;
  /** Apply authored values to library defaults. */
  apply: (value: any, defaults: any) => any;
};

/** Share strict authored contracts while keeping fresh-generation defaults unchanged. */
export const createGenerationSchemaCompiler = (
  catalog: PuckGenerationCatalog,
  locales: string[],
  mode: "create" | "insert" = "create"
) => {
  const components = catalog.data.components;
  const explicitCardLists = new WeakSet<SavedComponent>();
  for (const [name, config] of Object.entries(components))
    preflightSlottedItemSource(name, config, catalog);
  const fail = (path: string, message: string): never => {
    throw new Error(`Generation schema at ${path}: ${message}`);
  };
  const defaultMarker = z.strictObject({ $default: z.literal(true) });
  const unsetMarker = z.strictObject({ $unset: z.literal(true) });
  const nodes = new Map<string, SchemaNode>();
  // Component boundaries must remain references even when a child occurs once.
  // Otherwise valid nested cards can exceed the provider's inline depth limit.
  const schemaMetadata = z.registry<Record<string, any>>();
  const getMetadata = schemaMetadata.get.bind(schemaMetadata);
  schemaMetadata.get = (schema) =>
    getMetadata(schema) ?? z.globalRegistry.get(schema);
  let componentSchemaId = 0;
  const union = (schemas: z.ZodType[]): z.ZodType =>
    schemas.length === 1 ? schemas[0] : z.union(schemas);
  const describe = (wire: z.ZodType, original: z.ZodType) =>
    original.description ? wire.describe(original.description) : wire;
  const checks = (schema: z.ZodType, path: string) => {
    if (
      ((schema.def as any).checks ?? []).some(
        (check: any) => check._zod.def.check === "custom"
      )
    ) {
      fail(
        path,
        "custom refinements cannot be represented by strict JSON Schema"
      );
    }
    const def = schema.def as any;
    if (["optional", "nullable", "default", "prefault"].includes(def.type)) {
      checks(def.innerType, path);
    }
  };
  const shapeFor = (
    schema: z.ZodObject,
    path: string
  ): Record<string, z.ZodType> => {
    checks(schema, path);
    const shape: Record<string, z.ZodType> = { ...schema.shape };
    const catchall = schema.def.catchall as z.ZodType | undefined;
    if (catchall && catchall.def.type !== "never") {
      if (!shape.defaultValue || !locales.length) {
        fail(
          path,
          "open-ended objects require a localized defaultValue and layout locales"
        );
      }
      if (!localizedTextSchema(schema, locales)) {
        fail(path, "only localized catchalls are supported");
      }
      for (const locale of new Set(locales)) {
        if (
          !locale.trim() ||
          [
            "__proto__",
            "constructor",
            "prototype",
            "defaultValue",
            "hasLocalizedValue",
          ].includes(locale)
        ) {
          fail(path, `invalid locale ${locale}`);
        }
        shape[locale] ??= catchall.optional();
      }
    }
    for (const key of Object.keys(shape))
      if (["__proto__", "constructor", "prototype"].includes(key)) {
        fail(path, `reserved property ${key}`);
      }
    return shape;
  };
  const value = (
    schema: z.ZodType,
    path: string,
    field?: Fields[string],
    defaults?: any,
    markers = true
  ): SchemaNode => {
    checks(schema, path);
    const native = unwrap(schema);
    let child: SchemaNode;
    if (field?.type === "slot") {
      if (!(native instanceof z.ZodArray)) {
        fail(path, "slot must have an array schema");
      }
      const array = native as z.ZodArray;
      if (
        !["unknown", "any"].includes(
          unwrap(array.element as z.ZodType).def.type
        )
      ) {
        fail(
          path,
          "slot items must defer to registered component contracts (use z.unknown())"
        );
      }
      const alternatives = Object.keys(components)
        .filter(
          (name) =>
            components[name].generation &&
            permitted(name, field) &&
            (mode === "create" ||
              (name !== "MainContent" &&
                components[name].permissions?.insert !== false))
        )
        .map(element);
      if (!alternatives.length && !array.safeParse([]).success) {
        fail(path, "required slot has no allowed component contracts");
      }
      child = {
        wire: alternatives.length
          ? array.clone({
              ...array.def,
              element: union(alternatives.map((node) => node.wire)),
            } as any)
          : z.array(z.string()).max(0),
        apply: (input, baseline) =>
          input.map((item: any) => {
            const templates = Array.isArray(baseline)
              ? baseline.filter(
                  (template: SavedComponent) => template.type === item.type
                )
              : [];
            return element(item.type).apply(
              item,
              mode === "create" && templates.length === 1
                ? templates[0]
                : undefined
            );
          }),
      };
    } else if (native instanceof z.ZodObject) {
      const children = Object.fromEntries(
        Object.entries(shapeFor(native, path)).map(([key, schema]) => [
          key,
          value(
            schema,
            `${path}.${key}`,
            field?.type === "object" ? field.objectFields[key] : undefined,
            defaults?.[key]
          ),
        ])
      );
      child = {
        wire: z.strictObject(
          Object.fromEntries(
            Object.entries(children).map(([key, node]) => [key, node.wire])
          )
        ),
        apply: (input, baseline) => {
          const result =
            baseline && typeof baseline === "object" && !Array.isArray(baseline)
              ? clone(baseline)
              : {};
          for (const [key, node] of Object.entries(children)) {
            const resultValue = node.apply(input[key], result[key]);
            if (resultValue === undefined) {
              delete result[key];
            } else {
              result[key] = resultValue;
            }
          }
          return result;
        },
      };
    } else if (native instanceof z.ZodArray) {
      const item = value(
        native.element as z.ZodType,
        `${path}[]`,
        field?.type === "array"
          ? { type: "object", objectFields: field.arrayFields }
          : undefined,
        undefined,
        mode === "create"
      );
      child = {
        wire: native.clone({ ...native.def, element: item.wire } as any),
        apply: (input, baseline) =>
          input.map((v: any, index: number) =>
            item.apply(v, mode === "create" ? baseline?.[index] : undefined)
          ),
      };
    } else if (native instanceof z.ZodUnion) {
      const alternatives = native.options.map((schema) =>
        value(schema as z.ZodType, path, field, defaults)
      );
      child = {
        wire: union(alternatives.map((node) => node.wire)),
        apply: (input, baseline) =>
          alternatives
            .find((node) => node.wire.safeParse(input).success)!
            .apply(input, baseline),
      };
    } else {
      if ((native.def as any).coerce) {
        fail(path, "coercion cannot be represented by a strict wire schema");
      }
      if (
        !["string", "number", "boolean", "literal", "enum", "null"].includes(
          native.def.type
        )
      ) {
        fail(path, `unsupported ${native.def.type} schema`);
      }
      child = { wire: native, apply: (input) => clone(input) };
    }
    if (schema.safeParse(null).success && native.def.type !== "null") {
      const inner = child;
      child = {
        wire: inner.wire.nullable(),
        apply: (input, baseline) =>
          input === null ? null : inner.apply(input, baseline),
      };
    }
    if (!markers) {
      return { ...child, wire: describe(child.wire, schema) };
    }
    const parsedDefault = schema.safeParse(undefined);
    const fallback = parsedDefault.success ? parsedDefault.data : undefined;
    const modes = [child.wire];
    const hasDefault = defaults !== undefined || fallback !== undefined;
    if (hasDefault) {
      modes.push(defaultMarker);
    }
    if (parsedDefault.success) {
      modes.push(unsetMarker);
    }
    return {
      wire: describe(union(modes), schema),
      apply: (input, baseline) => {
        if (hasDefault && defaultMarker.safeParse(input).success) {
          const selected = baseline === undefined ? fallback : baseline;
          if (selected === undefined) {
            fail(path, "no default is available");
          }
          return clone(selected);
        }
        if (parsedDefault.success && unsetMarker.safeParse(input).success) {
          return undefined;
        }
        return child.apply(input, baseline === undefined ? fallback : baseline);
      },
    };
  };
  const element = (name: string): SchemaNode => {
    if (nodes.has(name)) {
      return nodes.get(name)!;
    }
    const config = components[name];
    if (!config?.generation) {
      fail(name, "missing generation.props contract");
    }
    let node: SchemaNode;
    const lazy: SchemaNode = {
      wire: z.lazy(() => node.wire),
      apply: (input, baseline) => node.apply(input, baseline),
    };
    nodes.set(name, lazy);
    if (
      Object.keys(config.generation!.props.shape).some((key) =>
        ["id", "puck", "readOnly"].includes(key)
      )
    ) {
      fail(name, "contract declares editor-owned metadata");
    }
    const props = value(
      config.generation!.props,
      name,
      { type: "object", objectFields: generationFields(config) },
      config.defaultProps
    );
    // Props themselves are always an authored object; markers apply to its fields.
    const propsWire =
      props.wire instanceof z.ZodUnion
        ? (props.wire.options[0] as z.ZodType)
        : props.wire;
    node = {
      wire: z.strictObject({ type: z.literal(name), props: propsWire }),
      apply: (input, template) => {
        const base = template
          ? clone(template)
          : { type: name, props: clone(config.defaultProps ?? {}) };
        base.props = props.apply(input.props, base.props);
        if (
          config.generation?.slottedItemSource &&
          !isLinkedSource(base.props) &&
          Object.values(input.props.data?.mappings ?? {}).some(
            (mapping: any) => mapping?.constantValueEnabled === true
          )
        ) {
          fail(
            name,
            "Manual card content belongs in slots.CardSlot child components, not data.mappings. Mappings configure entity-linked cards and do not create manual cards."
          );
        }
        if (Array.isArray(input.props.slots?.CardSlot)) {
          explicitCardLists.add(base);
        }
        return base;
      },
    };
    schemaMetadata.add(node.wire, { id: `component${componentSchemaId++}` });
    return lazy;
  };
  const exportSchema = (schema: z.ZodType) =>
    // Wire schemas contain closed objects and explicit required values, with
    // defaults/optionals replaced by markers and transforms/coercion rejected.
    // Input and output contracts are identical. Output export avoids Zod's
    // repeated transform scans over the entire nested component graph.
    exportGenerationSchema(schema, schemaMetadata, "output");
  return {
    element,
    value,
    shapeFor,
    checks,
    union,
    exportSchema,
    nodes,
    explicitCardLists,
  };
};
