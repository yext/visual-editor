import { z } from "zod";
import { compactGenerationSchema } from "./compactGenerationSchema.ts";
import { isDeepEqual } from "../../utils/deepEqual.ts";

/** Export only schemas supported by the gateway's strict-output contract. */
export const exportGenerationSchema = (
  schema: z.ZodType,
  metadata?: z.core.$ZodRegistry<Record<string, any>>,
  io: "input" | "output" = "input"
): Record<string, any> => {
  let jsonSchema: Record<string, any>;
  try {
    jsonSchema = z.toJSONSchema(schema, {
      io,
      reused: "ref",
      metadata,
    });
  } catch (error) {
    throw new Error(`Generation schema at response: ${String(error)}`);
  }
  normalizeReferenceSiblings(jsonSchema);
  jsonSchema = compactGenerationSchema(jsonSchema);
  assertStrictSchema(jsonSchema);
  return jsonSchema;
};
/** Preserve Zod's annotations and narrowed constraints without reference siblings. */
const normalizeReferenceSiblings = (schema: Record<string, any>) => {
  const enumKeys = new Set(["$ref", "type", "enum", "description", "title"]);
  const resolveEnum = (
    node: Record<string, any>,
    active = new Set<string>()
  ): Record<string, any> | undefined => {
    if (Object.keys(node).some((key) => !enumKeys.has(key))) return;
    if (!node.$ref) return node.enum ? { ...node } : undefined;
    if (!node.$ref.startsWith("#/$defs/") || active.has(node.$ref)) return;
    const name = node.$ref
      .slice("#/$defs/".length)
      .replaceAll("~1", "/")
      .replaceAll("~0", "~");
    const target = schema.$defs?.[name];
    if (!target) return;
    const resolved = resolveEnum(target, new Set([...active, node.$ref]));
    if (
      !resolved ||
      (node.type && resolved.type && !isDeepEqual(node.type, resolved.type))
    ) {
      return;
    }
    const result = { ...resolved, ...node };
    delete result.$ref;
    if (node.enum) {
      result.enum = node.enum.filter((value: unknown) =>
        resolved.enum.some((allowed: unknown) => isDeepEqual(value, allowed))
      );
      if (!result.enum.length) {
        throw new Error(
          "Generation schema: referenced enum constraints have no common values"
        );
      }
    }
    return result;
  };
  const visit = (node: Record<string, any>) => {
    if (node.$ref) {
      const resolvedEnum = resolveEnum(node);
      if (resolvedEnum) {
        // The provider rejects enum constraints combined with a reference anyOf.
        // Flatten enum aliases before compaction, preserving their intersection.
        delete node.$ref;
        Object.assign(node, resolvedEnum);
      } else if (
        Object.keys(node).some((key) => key !== "$ref") &&
        Object.keys(node).every((key) =>
          ["$ref", "description", "title"].includes(key)
        )
      ) {
        const reference = node.$ref;
        delete node.$ref;
        node.anyOf = [{ $ref: reference }];
      }
    }
    for (const child of Object.values(node.properties ?? {}))
      visit(child as Record<string, any>);
    for (const child of Object.values(node.$defs ?? {}))
      visit(child as Record<string, any>);
    for (const child of node.anyOf ?? []) visit(child);
    if (node.items) {
      visit(node.items);
    }
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
    if (node.$ref && Object.keys(node).some((key) => key !== "$ref")) {
      throw new Error(
        `Generation schema at ${path}: reference siblings are unsupported`
      );
    }
    for (const key of Object.keys(node))
      if (!allowed.has(key)) {
        throw new Error(
          `Generation schema at ${path}: unsupported keyword ${key}`
        );
      }
    if (!node.type && !node.anyOf && !node.$ref) {
      throw new Error(
        `Generation schema at ${path}: unconstrained values are unsupported`
      );
    }
    if (node.format && !formats.has(node.format)) {
      throw new Error(
        `Generation schema at ${path}: unsupported format ${node.format}`
      );
    }
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
    if (values.length > 250 && stringLength > 15_000) {
      throw new Error(
        `Generation schema at ${path}: enum strings exceed the strict-output limit`
      );
    }
    if (
      node.type === "object" &&
      (node.additionalProperties !== false ||
        Object.keys(node.properties ?? {}).some(
          (key) => !node.required?.includes(key)
        ))
    ) {
      throw new Error(
        `Generation schema at ${path}: objects must be closed with all properties required`
      );
    }
    for (const [key, child] of Object.entries(node.properties ?? {}))
      visit(child, `${path}.${key}`);
    for (const [key, child] of Object.entries(node.$defs ?? {}))
      visit(child, `${path}.$defs.${key}`);
    for (const child of node.anyOf ?? []) visit(child, path);
    if (node.items) {
      visit(node.items, `${path}[]`);
    }
  };
  visit(schema, "response");
  if (propertyCount > 5_000 || enumCount > 1_000 || nameLength > 120_000) {
    throw new Error(
      `Generation schema exceeds strict-output limits: ${propertyCount}/5000 properties, ${enumCount}/1000 enum values, ${nameLength}/120000 name characters`
    );
  }
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
      if (!target) {
        throw new Error(
          `Generation schema at ${path}: unresolved reference ${node.$ref}`
        );
      }
      return;
    }
    const next = level + (node.type === "object" ? 1 : 0);
    if (next > 10) {
      throw new Error(
        `Generation schema at ${path}: object nesting exceeds 10 levels`
      );
    }
    for (const [key, child] of Object.entries(node.properties ?? {}))
      depth(child, `${path}.${key}`, next);
    for (const child of node.anyOf ?? []) depth(child, path, next);
    if (node.items) {
      depth(node.items, `${path}[]`, next);
    }
  };
  depth(schema, "response", 0);
  for (const [name, definition] of Object.entries(schema.$defs ?? {}))
    depth(definition, `response.$defs.${name}`, 0);
};
