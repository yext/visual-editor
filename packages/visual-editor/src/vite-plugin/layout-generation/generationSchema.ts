import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import { compactGenerationSchema } from "./compactGenerationSchema.ts";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import {
  clone,
  extractAuthored,
  permitted,
  rejectZones,
  unwrap,
  validateAuthored,
  walkAuthored,
  type Content,
  type SavedComponent,
} from "../../internal/generation/authored.ts";

import {
  generationFields,
  preflightSlottedItemSource,
  prepareSlottedSource,
  finalizeSlottedSource,
} from "../../internal/generation/slottedItemSource.ts";

type Node = {
  wire: z.ZodType;
  apply: (value: any, defaults: any) => any;
};

/** Only an empty page or a single empty MainContent scaffold can be generated. */
export const isBlankGenerationPage = (data: Content): boolean =>
  !Object.values(data.zones ?? {}).some(
    (items) => !Array.isArray(items) || items.length
  ) &&
  (data.content.length === 0 ||
    (data.content.length === 1 &&
      data.content[0]?.type === "MainContent" &&
      Array.isArray(data.content[0].props?.content) &&
      data.content[0].props.content.length === 0));

/** Compile creation contracts without editing operations or model-authored identities. */
export const compileGenerationSchema = (
  catalog: PuckGenerationCatalog,
  locales: string[],
  currentData: Content = { content: [] }
) => {
  rejectZones(currentData);
  if (!isBlankGenerationPage(currentData))
    throw new Error(
      "Generation requires a blank page. Clear the layout before generating a new page."
    );
  const components = catalog.data.components;
  const explicitCardLists = new WeakSet<SavedComponent>();
  for (const [name, config] of Object.entries(components))
    preflightSlottedItemSource(name, config, catalog);
  const fail = (path: string, message: string): never => {
    throw new Error(`Generation schema at ${path}: ${message}`);
  };
  const defaultMarker = z.strictObject({ $default: z.literal(true) });
  const unsetMarker = z.strictObject({ $unset: z.literal(true) });
  const nodes = new Map<string, Node>();
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
    )
      fail(
        path,
        "custom refinements cannot be represented by strict JSON Schema"
      );
    const def = schema.def as any;
    if (["optional", "nullable", "default", "prefault"].includes(def.type))
      checks(def.innerType, path);
  };
  const shapeFor = (
    schema: z.ZodObject,
    path: string
  ): Record<string, z.ZodType> => {
    checks(schema, path);
    const shape: Record<string, z.ZodType> = { ...schema.shape };
    const catchall = schema.def.catchall as z.ZodType | undefined;
    if (catchall && catchall.def.type !== "never") {
      if (!shape.defaultValue || !locales.length)
        fail(
          path,
          "open-ended objects require a localized defaultValue and layout locales"
        );
      const localized = (s: z.ZodType): boolean => {
        const n = unwrap(s);
        return (
          n instanceof z.ZodString ||
          (n instanceof z.ZodUnion &&
            n.options.every((o) => localized(o as z.ZodType))) ||
          (n instanceof z.ZodObject &&
            Object.keys(n.shape).sort().join(",") === "html,json" &&
            unwrap(n.shape.html) instanceof z.ZodString &&
            unwrap(n.shape.json) instanceof z.ZodString)
        );
      };
      if (!localized(shape.defaultValue) || !localized(catchall))
        fail(path, "only localized catchalls are supported");
      for (const locale of new Set(locales)) {
        if (
          !locale.trim() ||
          Object.hasOwn(shape, locale) ||
          ["__proto__", "constructor", "prototype"].includes(locale)
        )
          fail(path, `invalid locale ${locale}`);
        shape[locale] = catchall.optional();
      }
    }
    for (const key of Object.keys(shape))
      if (["__proto__", "constructor", "prototype"].includes(key))
        fail(path, `reserved property ${key}`);
    return shape;
  };
  const value = (
    schema: z.ZodType,
    path: string,
    field?: Fields[string],
    defaults?: any
  ): Node => {
    checks(schema, path);
    const native = unwrap(schema);
    let child: Node;
    if (field?.type === "slot") {
      if (!(native instanceof z.ZodArray))
        fail(path, "slot must have an array schema");
      const array = native as z.ZodArray;
      if (
        !["unknown", "any"].includes(
          unwrap(array.element as z.ZodType).def.type
        )
      )
        fail(
          path,
          "slot items must defer to registered component contracts (use z.unknown())"
        );
      const alternatives = Object.keys(components)
        .filter((name) => components[name].generation && permitted(name, field))
        .map(element);
      if (!alternatives.length && !array.safeParse([]).success)
        fail(path, "required slot has no allowed component contracts");
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
              templates.length === 1 ? templates[0] : undefined
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
            if (resultValue === undefined) delete result[key];
            else result[key] = resultValue;
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
          : undefined
      );
      child = {
        wire: native.clone({ ...native.def, element: item.wire } as any),
        apply: (input, baseline) =>
          input.map((v: any, index: number) =>
            item.apply(v, baseline?.[index])
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
      if (
        !["string", "number", "boolean", "literal", "enum", "null"].includes(
          native.def.type
        )
      )
        fail(path, `unsupported ${native.def.type} schema`);
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
    const parsedDefault = schema.safeParse(undefined);
    const fallback = parsedDefault.success ? parsedDefault.data : undefined;
    const modes = [child.wire];
    const hasDefault = defaults !== undefined || fallback !== undefined;
    if (hasDefault) modes.push(defaultMarker);
    if (parsedDefault.success) modes.push(unsetMarker);
    return {
      wire: describe(union(modes), schema),
      apply: (input, baseline) => {
        if (hasDefault && defaultMarker.safeParse(input).success) {
          const selected = baseline === undefined ? fallback : baseline;
          if (selected === undefined) fail(path, "no default is available");
          return clone(selected);
        }
        if (parsedDefault.success && unsetMarker.safeParse(input).success)
          return undefined;
        return child.apply(input, baseline === undefined ? fallback : baseline);
      },
    };
  };
  const element = (name: string): Node => {
    if (nodes.has(name)) return nodes.get(name)!;
    const config = components[name];
    if (!config?.generation) fail(name, "missing generation.props contract");
    let node: Node;
    const lazy: Node = {
      wire: z.lazy(() => node.wire),
      apply: (input, baseline) => node.apply(input, baseline),
    };
    nodes.set(name, lazy);
    if (
      Object.keys(config.generation!.props.shape).some((key) =>
        ["id", "puck", "readOnly"].includes(key)
      )
    )
      fail(name, "contract declares editor-owned metadata");
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
        if (Array.isArray(input.props.slots?.CardSlot))
          explicitCardLists.add(base);
        return base;
      },
    };
    schemaMetadata.add(node.wire, { id: `component${componentSchemaId++}` });
    return lazy;
  };
  const rootNodes = Object.keys(components)
    .filter(
      (name) =>
        components[name].generation &&
        !components[name].nestedOnly &&
        (!catalog.puckOptions.rootAllowedComponentIds ||
          catalog.puckOptions.rootAllowedComponentIds.includes(name))
    )
    .map(element);
  const availableComponentNames = [...nodes.keys()].sort();
  const outcomes: z.ZodType[] = [
    z.strictObject({
      action: z.literal("clarification"),
      question: z.string().min(1),
    }),
  ];
  if (rootNodes.length)
    outcomes.push(
      z.strictObject({
        action: z.literal("create"),
        content: z.array(union(rootNodes.map((node) => node.wire))).min(1),
      })
    );
  const responseSchema = z.strictObject({
    text: z.string(),
    result: union(outcomes),
  });
  const exportSchema = (schema: z.ZodType) => {
    let jsonSchema: Record<string, any>;
    try {
      jsonSchema = z.toJSONSchema(schema, {
        io: "input",
        reused: "ref",
        metadata: schemaMetadata,
      });
    } catch (error) {
      return fail("response", String(error));
    }
    normalizeReferenceAnnotations(jsonSchema);
    jsonSchema = compactGenerationSchema(jsonSchema);
    assertStrictSchema(jsonSchema);
    return jsonSchema;
  };
  const jsonSchema = exportSchema(responseSchema);
  // Preflight all registered contracts separately: unreachable components must
  // remain valid without inflating the request schema or prompt inventory.
  for (const [name, config] of Object.entries(components)) {
    if (config.generation)
      exportSchema(z.strictObject({ component: element(name).wire }));
  }
  const materialize = (
    response: any
  ): { text: string; spec: Content | null } => {
    const parsed = responseSchema.parse(response) as any;
    if (parsed.result.action === "clarification")
      return {
        text: [parsed.text, parsed.result.question]
          .filter(Boolean)
          .join("\n\n"),
        spec: null,
      };
    const candidate = {
      content: parsed.result.content.map((input: any) =>
        element(input.type).apply(input, undefined)
      ),
    };
    // Prepare defaults while descending so every newly created card is visited.
    walkAuthored(catalog, candidate, ({ component }) => {
      prepareSlottedSource(
        component,
        components[component.type],
        explicitCardLists.has(component)
      );
      component.props.id = `generated-${globalThis.crypto.randomUUID()}`;
    });
    // Parent-first finalization applies the helper's child identity convention.
    // Mirror copies must be taken after descendants have also finalized their references.
    const sources: SavedComponent[] = [];
    walkAuthored(catalog, candidate, ({ component }) => {
      if (components[component.type]?.generation?.slottedItemSource) {
        finalizeSlottedSource(component, components[component.type]);
        sources.push(component);
      }
    });
    for (const component of sources.reverse())
      finalizeSlottedSource(component, components[component.type]);
    validateAuthored(catalog, candidate);
    return { text: parsed.text, spec: candidate };
  };
  return {
    jsonSchema,
    isBlankPage: true,
    availableComponentNames,
    context: extractAuthored(catalog, currentData),
    materialize,
    parseResponse: (text: string) => materialize(JSON.parse(text)),
  };
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
      `Generation schema exceeds strict-output limits: ${propertyCount}/5000 properties, ${enumCount}/1000 enum values, ${nameLength}/120000 name characters`
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
