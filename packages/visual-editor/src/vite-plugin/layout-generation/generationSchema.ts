import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import {
  clone,
  extractAuthored,
  indexAuthored,
  permitted,
  unwrap,
  validateAuthored,
  walkAuthored,
  type Content,
  type SavedComponent,
} from "../../internal/generation/authored.ts";

type Node = {
  wire: z.ZodType;
  apply: (override: any, baseline: any, allowedIds: Set<string>) => any;
};

/** Compile complete authored contracts into required, closed keep/set/unset overrides. */
export const compileGenerationSchema = (
  catalog: PuckGenerationCatalog,
  locales: string[],
  currentData: Content = { content: [] },
  options: { allowRedesign?: boolean } = {}
) => {
  const baseline = clone(currentData);
  const inventory = indexAuthored(catalog, baseline);
  const components = catalog.data.components;
  const fail = (path: string, message: string): never => {
    throw new Error(`Generation schema at ${path}: ${message}`);
  };
  // Reuse the same Zod instances so native export emits shared $defs, rather
  // than multiplying mode properties and inventory enums by every prop/type.
  const keepMode = z.strictObject({ mode: z.literal("keep") });
  const unsetMode = z.strictObject({ mode: z.literal("unset") });
  const existingIds = [...inventory.items.keys()];
  const componentId = existingIds.length
    ? z.enum(existingIds as [string, ...string[]]).nullable()
    : z.null();
  const nodes = new Map<string, Node>();
  const propsNodes = new Map<string, Node>();
  const idsUsed = new Set<string>();
  const newId = () => {
    let id: string;
    do {
      id = `generated-${globalThis.crypto.randomUUID()}`;
    } while (inventory.items.has(id) || idsUsed.has(id));
    idsUsed.add(id);
    return id;
  };
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
  // Ordinary arrays are complete replacements. Optional members use explicit absence
  // envelopes because strict gateway objects cannot have optional properties.
  const completeValue = (
    schema: z.ZodType,
    path: string,
    field?: Fields[string],
    defaults?: any
  ): Node => {
    if (field?.type === "slot") return override(schema, path, field, defaults);
    checks(schema, path);
    const def = schema.def as any;
    if (["optional", "default", "prefault"].includes(def.type)) {
      const child = completeValue(def.innerType, path, field, defaults);
      return {
        wire: union([
          unsetMode,
          z.strictObject({ mode: z.literal("set"), value: child.wire }),
        ]),
        apply: (o, b, ids) =>
          o.mode === "unset" ? undefined : child.apply(o.value, b, ids),
      };
    }
    if (def.type === "nullable") {
      const child = completeValue(def.innerType, path, field, defaults);
      return {
        wire: child.wire.nullable(),
        apply: (o, b, ids) => (o === null ? null : child.apply(o, b, ids)),
      };
    }
    if (schema instanceof z.ZodObject) {
      const children = Object.fromEntries(
        Object.entries(shapeFor(schema, path)).map(([k, s]) => [
          k,
          completeValue(
            s,
            `${path}.${k}`,
            field?.type === "object" ? field.objectFields[k] : undefined,
            defaults?.[k]
          ),
        ])
      );
      return {
        wire: describe(
          z.strictObject(
            Object.fromEntries(
              Object.entries(children).map(([k, n]) => [k, n.wire])
            )
          ),
          schema
        ),
        apply: (o, b, ids) =>
          Object.fromEntries(
            Object.entries(children)
              .map(([k, n]) => [k, n.apply(o[k], b?.[k], ids)])
              .filter(([, v]) => v !== undefined)
          ),
      };
    }
    if (schema instanceof z.ZodArray) {
      const child = completeValue(
        schema.element as z.ZodType,
        `${path}[]`,
        field?.type === "array"
          ? { type: "object", objectFields: field.arrayFields }
          : undefined
      );
      return {
        wire: schema.clone({ ...schema.def, element: child.wire } as any),
        apply: (o, b, ids) =>
          o.map((v: any, index: number) => child.apply(v, b?.[index], ids)),
      };
    }
    if (schema instanceof z.ZodUnion) {
      const children = schema.options.map((s) =>
        completeValue(s as z.ZodType, path, field, defaults)
      );
      return {
        wire: union(children.map((n) => n.wire)),
        apply: (o, b, ids) =>
          children.find((n) => n.wire.safeParse(o).success)!.apply(o, b, ids),
      };
    }
    if (
      !["string", "number", "boolean", "literal", "enum", "null"].includes(
        def.type
      )
    )
      fail(path, `unsupported ${def.type} schema`);
    return { wire: schema, apply: (o) => clone(o) };
  };
  const override = (
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
      child = alternatives.length
        ? {
            wire: array.clone({
              ...array.def,
              element: union(alternatives.map((n) => n.wire)),
            } as any),
            apply: (o, b, ids) =>
              o.map((v: any) => {
                const templates = Array.isArray(defaults)
                  ? defaults.filter(
                      (item: SavedComponent) => item.type === v.type
                    )
                  : [];
                return element(v.type).apply(
                  v,
                  templates.length === 1 ? templates[0] : undefined,
                  ids
                );
              }),
          }
        : { wire: z.array(z.string()).max(0), apply: () => [] };
      if (!alternatives.length && !array.safeParse([]).success)
        fail(path, "required slot has no allowed component contracts");
    } else if (native instanceof z.ZodObject) {
      const children = Object.fromEntries(
        Object.entries(shapeFor(native, path)).map(([key, s]) => [
          key,
          override(
            s,
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
        apply: (o, b, ids) => {
          const result =
            b && typeof b === "object" && !Array.isArray(b) ? clone(b) : {};
          for (const [key, node] of Object.entries(children)) {
            const v = node.apply(o[key], result[key], ids);
            if (v === undefined) delete result[key];
            else result[key] = v;
          }
          return result;
        },
      };
    } else if (native instanceof z.ZodUnion) {
      const alternatives = native.options.map((option) =>
        override(option as z.ZodType, path, field, defaults)
      );
      const payloads = alternatives.map((node) => {
        const setMode = (node.wire as z.ZodUnion).options.find(
          (option) => (option as z.ZodObject).shape?.value
        ) as z.ZodObject;
        return setMode.shape.value;
      });
      child = {
        wire: union(payloads),
        apply: (o, b, ids) =>
          alternatives[
            payloads.findIndex((wire) => wire.safeParse(o).success)
          ].apply({ mode: "set", value: o }, b, ids),
      };
    } else child = completeValue(native, path, field, defaults);
    if (schema.safeParse(null).success)
      child = {
        ...child,
        wire: child.wire.nullable(),
        apply: ((apply) => (o, b, ids) =>
          o === null ? null : apply(o, b, ids))(child.apply),
      };
    child.wire = describe(child.wire, schema);
    const modes = [
      keepMode,
      z.strictObject({ mode: z.literal("set"), value: child.wire }),
    ];
    if (schema.safeParse(undefined).success) modes.push(unsetMode as any);
    return {
      wire: describe(union(modes), schema),
      apply: (o, b, ids) =>
        o.mode === "keep"
          ? clone(b)
          : o.mode === "unset"
            ? undefined
            : child.apply(o.value, b, ids),
    };
  };
  const element = (name: string): Node => {
    if (nodes.has(name)) return nodes.get(name)!;
    const config = components[name];
    if (!config?.generation) fail(name, "missing generation.props contract");
    let node: Node;
    const lazy: Node = {
      wire: z.lazy(() => node.wire),
      apply: (o, b, ids) => node.apply(o, b, ids),
    };
    nodes.set(name, lazy);
    if (
      Object.keys(config.generation!.props.shape).some((key) =>
        ["id", "puck", "readOnly"].includes(key)
      )
    )
      fail(name, "contract declares editor-owned metadata");
    const props = override(
      config.generation!.props,
      name,
      { type: "object", objectFields: config.fields ?? {} },
      config.defaultProps
    );
    // Component props are the required member overrides, without an enclosing mode.
    const members = (props.wire as z.ZodUnion).options.find(
      (o) => (o as z.ZodObject).shape?.value
    ) as z.ZodObject;
    propsNodes.set(name, {
      wire: members.shape.value,
      apply: (o, b, ids) => props.apply({ mode: "set", value: o }, b, ids),
    });
    node = {
      wire: z
        .strictObject({
          type: z.literal(name),
          id: componentId,
          props: members.shape.value,
        })
        .describe(config.description ?? name),
      apply: (o, template, allowedIds) => {
        let base: SavedComponent;
        if (o.id !== null) {
          const item = inventory.items.get(o.id);
          if (!item || !allowedIds.has(o.id) || item.component.type !== name)
            fail(name, `incorrectly reused component Id ${o.id}`);
          if (idsUsed.has(o.id))
            fail(name, `duplicate component reference ${o.id}`);
          idsUsed.add(o.id);
          base = clone(item!.component);
        } else {
          base = template
            ? clone(template)
            : { type: name, props: clone(config.defaultProps ?? {}) };
          base.type = name;
          // Default slot subtrees receive fresh identities, including hidden children.
          walkAuthored(catalog, { content: [base] }, ({ component }) => {
            component.props.id = newId();
          });
        }
        base.props = propsNodes
          .get(name)!
          .apply(o.props, base.props, allowedIds);
        return base;
      },
    };
    return lazy;
  };
  const rootNames = Object.keys(components).filter(
    (name) =>
      components[name].generation &&
      !components[name].nestedOnly &&
      (!catalog.puckOptions.rootAllowedComponentIds ||
        catalog.puckOptions.rootAllowedComponentIds.includes(name))
  );
  const rootNodes = rootNames.map(element);
  // Preflight every enabled registered contract, including hidden shared components.
  for (const name of Object.keys(components).filter(
    (name) => components[name].generation
  ))
    element(name);
  const targets = [...inventory.items.entries()]
    .filter(([, item]) => components[item.component.type]?.generation)
    .map(([id]) => id);
  const destinations = [...inventory.collections.keys()];
  const targetSchema = targets.length
    ? z.enum(targets as [string, ...string[]])
    : z.never();
  const destinationSchema = z.enum(destinations as [string, ...string[]]);
  const targetsByType = new Map<string, string[]>();
  for (const id of targets) {
    const type = inventory.items.get(id)!.component.type;
    const ids = targetsByType.get(type) ?? [];
    ids.push(id);
    targetsByType.set(type, ids);
  }
  const edits: z.ZodType[] = [...targetsByType.entries()].map(([type, ids]) =>
    z.strictObject({
      action: z.literal("update"),
      id: z.enum(ids as [string, ...string[]]),
      props: propsNodes.get(type)!.wire,
    })
  );
  if (targets.length)
    edits.push(
      z.strictObject({ action: z.literal("remove"), id: targetSchema }),
      z.strictObject({
        action: z.literal("move"),
        id: targetSchema,
        destination: destinationSchema,
        index: z.number().int().min(0),
      })
    );
  if (rootNodes.length)
    edits.push(
      z.strictObject({
        action: z.literal("insert"),
        destination: destinationSchema,
        index: z.number().int().min(0),
        component: union([...nodes.values()].map((node) => node.wire)),
      })
    );
  const outcomes: z.ZodType[] = [
    z.strictObject({
      action: z.literal("clarification"),
      question: z.string().min(1),
    }),
  ];
  if (edits.length)
    outcomes.push(
      z.strictObject({
        action: z.literal("edit"),
        operations: z.array(union(edits)).min(1).max(100),
      })
    );
  const emptyPage = [...inventory.items.values()].every(
    (item) => item.component.type === "MainContent"
  );
  if ((emptyPage || options.allowRedesign) && rootNodes.length)
    outcomes.push(
      z.strictObject({
        action: z.literal(emptyPage ? "create" : "redesign"),
        content: z.array(union(rootNodes.map((node) => node.wire))).min(1),
      })
    );
  const responseSchema = z.strictObject({
    text: z.string(),
    result: union(outcomes),
  });
  let jsonSchema: Record<string, any>;
  try {
    jsonSchema = z.toJSONSchema(responseSchema, { io: "input", reused: "ref" });
  } catch (error) {
    return fail("response", String(error));
  }
  normalizeReferenceAnnotations(jsonSchema);
  assertStrictSchema(jsonSchema);
  // Hidden contracts may not be reachable from a currently populated collection;
  // still reject any unsupported JSON Schema before calling the gateway.
  for (const node of nodes.values()) {
    const schema = z.toJSONSchema(z.strictObject({ component: node.wire }), {
      io: "input",
      reused: "ref",
    }) as Record<string, any>;
    normalizeReferenceAnnotations(schema);
    assertStrictSchema(schema);
  }
  const materialize = (
    response: any
  ): { text: string; spec: Content | null } => {
    const parsed = responseSchema.parse(response) as any;
    idsUsed.clear();
    const result = parsed.result;
    if (result.action === "clarification")
      return {
        text: [parsed.text, result.question].filter(Boolean).join("\n\n"),
        spec: null,
      };
    let candidate = clone(baseline);
    if (result.action === "create" || result.action === "redesign") {
      candidate.content = result.content.map((o: any) =>
        element(o.type).apply(o, undefined, new Set(inventory.items.keys()))
      );
    } else {
      const operations: any[] = result.operations;
      const touched = new Set<string>();
      const changing = operations.filter((o) => o.id);
      for (const op of changing) {
        const item = inventory.items.get(op.id)!;
        if (touched.has(op.id))
          fail("operations", `conflicting target ${op.id}`);
        touched.add(op.id);
        if (changing.some((other) => item.ancestors.includes(other.id)))
          fail("operations", "conflicting ancestor/descendant operations");
      }
      for (const op of operations.filter((o) => o.destination)) {
        const dest = inventory.collections.get(op.destination)!;
        const owner = dest.ownerId
          ? inventory.items.get(dest.ownerId)
          : undefined;
        const lineage = owner ? [...owner.ancestors, dest.ownerId!] : [];
        if (changing.some((other) => lineage.includes(other.id)))
          fail(
            "operations",
            "destination is inside a changed target or creates a cycle"
          );
      }
      const work = indexAuthored(catalog, candidate);
      for (const op of changing.filter(
        (o) => o.action === "remove" || o.action === "move"
      )) {
        const item = work.items.get(op.id)!;
        item.collection.items.splice(
          item.collection.items.indexOf(item.component),
          1
        );
      }
      for (const op of operations) {
        if (op.action === "update") {
          const item = work.items.get(op.id)!;
          const allowed = new Set(
            [...inventory.items.entries()]
              .filter(([id, i]) => id === op.id || i.ancestors.includes(op.id))
              .map(([id]) => id)
          );
          // The enclosing update owns the existing reference; only descendants may be reused in slots.
          idsUsed.add(op.id);
          item.component.props = propsNodes
            .get(item.component.type)!
            .apply(op.props, item.component.props, allowed);
        } else if (op.action === "insert" || op.action === "move") {
          const dest = work.collections.get(op.destination)!;
          if (op.index > dest.items.length)
            fail("operations", "destination index is out of bounds");
          const component =
            op.action === "move"
              ? work.items.get(op.id)!.component
              : element(op.component.type).apply(
                  op.component,
                  undefined,
                  new Set()
                );
          dest.items.splice(op.index, 0, component);
        }
      }
    }
    validateAuthored(catalog, candidate);
    return { text: parsed.text, spec: { content: candidate.content } };
  };
  return {
    jsonSchema,
    isBlankPage: emptyPage,
    availableComponentNames: [...nodes.keys()].sort(),
    context: extractAuthored(catalog, baseline),
    inventory: { targets, destinations },
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
