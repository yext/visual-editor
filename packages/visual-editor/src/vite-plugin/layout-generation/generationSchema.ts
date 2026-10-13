import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import type { GeneratedContent } from "../../local-editor/types.ts";
import { generatedContentShape } from "./generationValidation.ts";

type ObjectValue = Record<string, any>;
type Codec = {
  wire: z.ZodType;
  encode: (value: any) => any;
  decode: (value: any) => any;
};
type SlotField = { allow?: string[]; disallow?: string[] };

/** Compile native saved props into a closed, component-aware gateway response. */
export const compileGenerationSchema = (
  catalog: PuckGenerationCatalog,
  locales: string[],
  currentData?: GeneratedContent
) => {
  const components = catalog.data.components;
  const localeKeys = [...new Set(locales)].sort();
  const fail = (path: string, message: string): never => {
    throw new Error(`Generation schema at ${path}: ${message}`);
  };
  const kind = (schema: z.ZodType): string => schema.def.type;
  const structuralChecks = (schema: z.ZodType) =>
    ((schema.def as any).checks ?? []).filter(
      (check: any) => check._zod.def.check !== "custom"
    );
  const unwrap = (schema: z.ZodType): z.ZodType => {
    const def = schema.def as any;
    return ["optional", "nullable", "default", "prefault"].includes(def.type)
      ? unwrap(def.innerType)
      : schema;
  };
  const isLocalizedValue = (schema: z.ZodType): boolean => {
    const unwrapped = unwrap(schema);
    if (kind(unwrapped) === "string") return true;
    if (unwrapped instanceof z.ZodUnion)
      return unwrapped.def.options.every((option) =>
        isLocalizedValue(option as z.ZodType)
      );
    if (!(unwrapped instanceof z.ZodObject)) return false;
    const keys = Object.keys(unwrapped.shape);
    const catchall = unwrapped.def.catchall as z.ZodType | undefined;
    return (
      keys.length === 2 &&
      keys.includes("html") &&
      keys.includes("json") &&
      kind(unwrap(unwrapped.shape.html)) === "string" &&
      kind(unwrap(unwrapped.shape.json)) === "string" &&
      (!catchall || kind(catchall) === "never")
    );
  };
  const describe = (wire: z.ZodType, original: z.ZodType) =>
    original.description ? wire.describe(original.description) : wire;
  const union = (nodes: Codec[], path: string): Codec => {
    if (!nodes.length) return fail(path, "no allowed component alternatives");
    return {
      wire:
        nodes.length === 1 ? nodes[0].wire : z.union(nodes.map((n) => n.wire)),
      encode: (value) => {
        for (const node of nodes) {
          const encoded = node.encode(value);
          if (node.wire.safeParse(encoded).success) return encoded;
        }
        return value;
      },
      decode: (value) => {
        const node = nodes.find((node) => node.wire.safeParse(value).success);
        return node ? node.decode(value) : value;
      },
    };
  };
  const permitted = (name: string, field?: SlotField) =>
    !field?.disallow?.includes(name) &&
    (!field?.allow?.length || field.allow.includes(name));
  const rootNames = Object.keys(components).filter(
    (name) =>
      !components[name].nestedOnly &&
      (!catalog.puckOptions.rootAllowedComponentIds ||
        catalog.puckOptions.rootAllowedComponentIds.includes(name))
  );
  const elementNodes = new Map<string, Codec>();
  const availableComponentNames = new Set<string>();
  const metadata = new Map<string, Map<string, ObjectValue>>();

  const object = (
    schema: z.ZodObject,
    path: string,
    fields?: Fields
  ): Codec => {
    const shape: Record<string, Codec> = {};
    for (const [key, child] of Object.entries(schema.shape)) {
      if (["__proto__", "prototype", "constructor"].includes(key))
        fail(`${path}.${key}`, "reserved property name");
      shape[key] = value(child as z.ZodType, `${path}.${key}`, fields?.[key]);
    }
    const catchall = schema.def.catchall as z.ZodType | undefined;
    if (catchall && kind(catchall) !== "never") {
      const localized =
        schema.shape.defaultValue &&
        isLocalizedValue(schema.shape.defaultValue) &&
        isLocalizedValue(catchall) &&
        (!schema.shape.hasLocalizedValue ||
          (kind(unwrap(schema.shape.hasLocalizedValue)) === "literal" &&
            (unwrap(schema.shape.hasLocalizedValue).def as any).values
              .length === 1 &&
            (unwrap(schema.shape.hasLocalizedValue).def as any).values[0] ===
              "true"));
      if (!localized)
        fail(path, "open-ended objects are unsupported; declare fixed keys");
      if (!localeKeys.length)
        fail(path, "localized values require selected-layout locales");
      for (const locale of localeKeys) {
        if (
          !locale.trim() ||
          ["__proto__", "prototype", "constructor"].includes(locale)
        )
          fail(path, `invalid locale key ${locale}`);
        if (Object.hasOwn(shape, locale))
          fail(path, `locale collides with property ${locale}`);
        shape[locale] = value(catchall.optional(), `${path}.${locale}`);
      }
    }
    const map = (input: any, direction: "encode" | "decode") => {
      if (!input || typeof input !== "object" || Array.isArray(input))
        return input;
      // Retain unknown keys so strict parsing rejects them instead of losing saved data.
      const output: ObjectValue = { ...input };
      for (const [key, node] of Object.entries(shape)) {
        const converted = node[direction](input[key]);
        if (converted === undefined) delete output[key];
        else
          Object.defineProperty(output, key, {
            value: converted,
            enumerable: true,
            configurable: true,
            writable: true,
          });
      }
      return output;
    };
    return {
      wire: describe(
        z.strictObject(
          Object.fromEntries(
            Object.entries(shape).map(([key, node]) => [key, node.wire])
          )
        ),
        schema
      ),
      encode: (input) => map(input, "encode"),
      decode: (input) => map(input, "decode"),
    };
  };

  const element = (name: string, path: string, inline?: z.ZodObject): Codec => {
    if (!Object.hasOwn(components, name))
      return fail(path, `unknown component ${name}`);
    const component = components[name];
    availableComponentNames.add(name);
    if (!inline && name !== "MainContent" && !component.hasFormalProps)
      return fail(
        path,
        `${name} needs formalProps or a complete inline slot schema`
      );
    if (!inline && elementNodes.has(name)) return elementNodes.get(name)!;
    let node: Codec;
    const lazy: Codec = {
      wire: z.lazy(() => node.wire),
      encode: (input) => node.encode(input),
      decode: (input) => node.decode(input),
    };
    if (!inline) elementNodes.set(name, lazy);
    const props = object(
      (inline ?? component.props).safeExtend({
        id: z.string().regex(/\S/, "Component ID must not be empty"),
      }),
      `${path}.${name}.props`,
      component.fields
    );
    const shape = z.strictObject({ type: z.literal(name), props: props.wire });
    node = {
      wire: component.description
        ? shape.describe(component.description)
        : shape,
      encode: (input) => {
        if (!input || typeof input !== "object") return input;
        const { readOnly: _readOnly, ...saved } = input;
        return { ...saved, props: props.encode(input.props) };
      },
      decode: (input) => {
        const saved = { ...input, props: props.decode(input.props) };
        const flags = metadata.get(name)?.get(saved.props?.id);
        return flags ? { ...saved, readOnly: structuredClone(flags) } : saved;
      },
    };
    return lazy;
  };

  const slot = (schema: z.ZodType, field: SlotField, path: string): Codec => {
    if (kind(schema) !== "array")
      return fail(path, "slot schema must be an array");
    const item = unwrap((schema.def as any).element);
    const alternatives: z.ZodType[] =
      kind(item) === "union" ? (item.def as any).options : [item];
    const nodes: Codec[] = [];
    for (const alternative of alternatives) {
      if (["any", "unknown"].includes(kind(alternative))) {
        for (const name of Object.keys(components).filter((name) =>
          permitted(name, field)
        ))
          nodes.push(element(name, path));
      } else {
        if (
          !(alternative instanceof z.ZodObject) ||
          !alternative.shape.type ||
          !alternative.shape.props ||
          kind(alternative.shape.type) !== "literal" ||
          !(unwrap(alternative.shape.props) instanceof z.ZodObject)
        )
          return fail(
            path,
            "inline slots require literal component types and object props"
          );
        const extra = Object.keys(alternative.shape).find(
          (key) => !["type", "props", "readOnly"].includes(key)
        );
        if (extra)
          return fail(
            `${path}.${extra}`,
            "unsupported component envelope property"
          );
        if (
          alternative.shape.readOnly &&
          !alternative.shape.readOnly.safeParse(undefined).success
        )
          return fail(
            `${path}.readOnly`,
            "editor-owned metadata must be optional"
          );
        for (const name of (alternative.shape.type.def as any).values) {
          if (typeof name !== "string")
            fail(path, "component type must be a string");
          if (permitted(name, field))
            nodes.push(
              element(
                name,
                path,
                unwrap(alternative.shape.props) as z.ZodObject
              )
            );
        }
      }
    }
    if (!nodes.length && !schema.safeParse([]).success)
      return fail(
        path,
        "slot has no allowed components and its schema rejects an empty array"
      );
    if (!nodes.length)
      return {
        wire: z.array(z.string()).max(0).describe("This slot must be empty."),
        encode: (input) => input,
        decode: (input) => input,
      };
    const child = union(nodes, path);
    return {
      wire: describe(
        (schema as z.ZodArray).clone({
          ...(schema as z.ZodArray).def,
          checks: structuralChecks(schema),
          element: child.wire,
        }),
        schema
      ),
      encode: (input) =>
        Array.isArray(input) ? input.map(child.encode) : input,
      decode: (input) => input.map(child.decode),
    };
  };

  const value = (
    schema: z.ZodType,
    path: string,
    field?: Fields[string]
  ): Codec => {
    const def = schema.def as any;
    if (["optional", "default", "prefault"].includes(def.type)) {
      const inner = value(def.innerType, path, field);
      const nullable = def.innerType.safeParse(null).success;
      return {
        wire: describe(inner.wire.nullable(), schema),
        encode: (input) => (input === undefined ? null : inner.encode(input)),
        decode: (input) =>
          input === null && !nullable ? undefined : inner.decode(input),
      };
    }
    if (def.type === "nullable") {
      const inner = value(def.innerType, path, field);
      return {
        wire: describe(inner.wire.nullable(), schema),
        encode: (input) => (input === null ? null : inner.encode(input)),
        decode: (input) => (input === null ? null : inner.decode(input)),
      };
    }
    if (field?.type === "slot") return slot(schema, field, path);
    if (schema instanceof z.ZodObject)
      return object(
        schema,
        path,
        field?.type === "object" ? field.objectFields : undefined
      );
    if (def.type === "array") {
      const child = value(
        def.element,
        `${path}[]`,
        field?.type === "array"
          ? { type: "object", objectFields: field.arrayFields }
          : undefined
      );
      return {
        wire: describe(
          schema.clone({
            ...def,
            checks: structuralChecks(schema),
            element: child.wire,
          }),
          schema
        ),
        encode: (input) =>
          Array.isArray(input) ? input.map(child.encode) : input,
        decode: (input) => input.map(child.decode),
      };
    }
    if (def.type === "union") {
      const node = union(
        def.options.map((option: z.ZodType) => value(option, path, field)),
        path
      );
      return { ...node, wire: describe(node.wire, schema) };
    }
    if (
      !["string", "number", "boolean", "literal", "enum", "null"].includes(
        def.type
      )
    )
      return fail(
        path,
        `unsupported ${def.type} schema; provide serializable, constrained props`
      );
    return { wire: schema, encode: (input) => input, decode: (input) => input };
  };

  const root = union(
    rootNames.map((name) => element(name, "content")),
    "content"
  );
  const contentCodec: Codec = {
    wire: z.strictObject({ content: z.array(root.wire) }),
    encode: (data) => ({ ...data, content: data.content.map(root.encode) }),
    decode: (data) => ({ content: data.content.map(root.decode) }),
  };
  const responseSchema = z.strictObject({
    text: z.string(),
    spec: contentCodec.wire.nullable(),
  });
  let jsonSchema: Record<string, any>;
  try {
    jsonSchema = z.toJSONSchema(responseSchema, { io: "input", reused: "ref" });
  } catch (error) {
    return fail(
      "response",
      error instanceof Error ? error.message : String(error)
    );
  }
  normalizeReferenceAnnotations(jsonSchema);
  assertStrictSchema(jsonSchema);

  if (currentData) {
    const result = contentCodec.wire.safeParse(
      contentCodec.encode(currentData)
    );
    if (!result.success)
      fail(
        "currentData",
        `saved content cannot be represented: ${result.error.message}`
      );
    stripGenerationMetadata(catalog, currentData, (input) => {
      if (!input.readOnly) return;
      const byId = metadata.get(input.type) ?? new Map();
      byId.set(input.props.id, input.readOnly);
      metadata.set(input.type, byId);
    });
  }
  return {
    jsonSchema,
    availableComponentNames: [...availableComponentNames].sort(),
    stripMetadata: (data: GeneratedContent) =>
      stripGenerationMetadata(catalog, data),
    normalizeContent: (data: unknown): GeneratedContent => {
      const parsed = contentCodec.wire.parse(data);
      return generatedContentShape.parse(
        contentCodec.decode(parsed)
      ) as GeneratedContent;
    },
    validateContent: (data: unknown): void => {
      contentCodec.wire.parse(contentCodec.encode(data));
    },
    parseResponse: (
      text: string
    ): { text: string; spec: GeneratedContent | null } => {
      const response = responseSchema.parse(JSON.parse(text));
      return {
        text: response.text,
        spec:
          response.spec === null
            ? null
            : (contentCodec.decode(response.spec) as GeneratedContent),
      };
    },
  };
};

/** Only component envelopes in declared slots contain editor-owned metadata. */
export const stripGenerationMetadata = (
  catalog: PuckGenerationCatalog,
  data: GeneratedContent,
  visit: (component: ObjectValue) => void = () => {}
): GeneratedContent => {
  const props = (input: ObjectValue, fields?: Fields): ObjectValue => {
    const output = { ...input };
    for (const [key, field] of Object.entries(fields ?? {})) {
      const child = input[key];
      if (field.type === "slot" && Array.isArray(child))
        output[key] = child.map(component);
      else if (field.type === "object" && child && typeof child === "object")
        output[key] = props(child, field.objectFields);
      else if (field.type === "array" && Array.isArray(child))
        output[key] = child.map((item) =>
          item && typeof item === "object"
            ? props(item, field.arrayFields)
            : item
        );
    }
    return output;
  };
  const component = (input: ObjectValue) => {
    visit(input);
    const { readOnly: _readOnly, ...saved } = input;
    return {
      ...saved,
      props: props(input.props, catalog.data.components[input.type]?.fields),
    };
  };
  return { content: data.content.map(component) } as GeneratedContent;
};

/** The gateway forbids reference siblings, including Zod's contextual descriptions. */
const normalizeReferenceAnnotations = (schema: Record<string, any>) => {
  const visit = (node: Record<string, any>) => {
    if (
      node.$ref &&
      (node.description !== undefined || node.title !== undefined)
    ) {
      const reference = node.$ref;
      const siblings = Object.keys(node).filter((key) => key !== "$ref");
      if (siblings.every((key) => key === "description" || key === "title")) {
        delete node.$ref;
        node.anyOf = [{ $ref: reference }];
      }
    }
    for (const child of Object.values(node.properties ?? {}))
      visit(child as Record<string, any>);
    for (const child of Object.values(node.$defs ?? {}))
      visit(child as Record<string, any>);
    for (const child of node.anyOf ?? []) visit(child);
    if (node.items) visit(node.items);
  };
  visit(schema);
};

/** Validate the supported strict-output subset instead of weakening unsupported schemas. */
const assertStrictSchema = (schema: Record<string, any>) => {
  let propertyCount = 0;
  let enumCount = 0;
  let nameLength = 0;
  const formats = new Set([
    "date-time",
    "time",
    "date",
    "duration",
    "email",
    "hostname",
    "ipv4",
    "ipv6",
    "uuid",
  ]);
  const allowed = new Set([
    "$schema",
    "$defs",
    "$ref",
    "type",
    "properties",
    "required",
    "additionalProperties",
    "items",
    "anyOf",
    "enum",
    "const",
    "description",
    "title",
    "pattern",
    "format",
    "minLength",
    "maxLength",
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "multipleOf",
    "minItems",
    "maxItems",
  ]);
  const visit = (node: any, path: string) => {
    if (node.$ref && Object.keys(node).some((key) => key !== "$ref"))
      throw new Error(
        `Generation schema at ${path}: reference siblings are unsupported`
      );
    for (const key of Object.keys(node))
      if (!allowed.has(key))
        throw new Error(
          `Generation schema at ${path}: unsupported keyword ${key}`
        );
    if (!node.type && !node.anyOf && !node.$ref)
      throw new Error(
        `Generation schema at ${path}: unconstrained values are unsupported`
      );
    if (node.format && !formats.has(node.format))
      throw new Error(
        `Generation schema at ${path}: unsupported format ${node.format}`
      );
    propertyCount += Object.keys(node.properties ?? {}).length;
    nameLength +=
      Object.keys(node.properties ?? {}).join("").length +
      Object.keys(node.$defs ?? {}).join("").length;
    const values = [
      ...(node.enum ?? []),
      ...(node.const !== undefined ? [node.const] : []),
    ];
    enumCount += node.enum?.length ?? 0;
    const stringLength = values
      .filter((value) => typeof value === "string")
      .join("").length;
    nameLength += stringLength;
    if (values.length > 250 && stringLength > 15_000)
      throw new Error(
        `Generation schema at ${path}: enum strings exceed the strict-output limit`
      );
    if (
      node.type === "object" &&
      (node.additionalProperties !== false ||
        Object.keys(node.properties ?? {}).some(
          (key) => !node.required?.includes(key)
        ))
    )
      throw new Error(
        `Generation schema at ${path}: objects must be closed with all properties required`
      );
    for (const [key, child] of Object.entries(node.properties ?? {}))
      visit(child, `${path}.${key}`);
    for (const [key, child] of Object.entries(node.$defs ?? {}))
      visit(child, `${path}.$defs.${key}`);
    for (const child of node.anyOf ?? []) visit(child, path);
    if (node.items) visit(node.items, `${path}[]`);
  };
  visit(schema, "response");
  if (propertyCount > 5_000 || enumCount > 1_000 || nameLength > 120_000)
    throw new Error(
      "Generation schema exceeds strict-output property, enum, or name-size limits"
    );
  // The provider limits inline schema nesting, not the expanded output tree.
  // Check the root and each definition separately; expanding refs rejects valid
  // deep layouts and would make the provider's recursive-schema support impossible.
  const depth = (node: any, path: string, level: number) => {
    if (node.$ref) {
      const target =
        node.$ref === "#"
          ? schema
          : schema.$defs?.[
              node.$ref
                .replace(/^#\/\$defs\//, "")
                .replaceAll("~1", "/")
                .replaceAll("~0", "~")
            ];
      if (!target)
        throw new Error(
          `Generation schema at ${path}: unresolved reference ${node.$ref}`
        );
      return;
    }
    const next = level + (node.type === "object" ? 1 : 0);
    if (next > 10)
      throw new Error(
        `Generation schema at ${path}: object nesting exceeds 10 levels`
      );
    for (const [key, child] of Object.entries(node.properties ?? {}))
      depth(child, `${path}.${key}`, next);
    for (const child of node.anyOf ?? []) depth(child, path, next);
    if (node.items) depth(node.items, `${path}[]`, next);
  };
  depth(schema, "response", 0);
  for (const [name, definition] of Object.entries(schema.$defs ?? {}))
    depth(definition, `response.$defs.${name}`, 0);
};
