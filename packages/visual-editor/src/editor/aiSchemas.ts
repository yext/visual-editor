import { z } from "zod/v4";
import { RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";

/**
 * JSON Schema type compatible with Puck AI plugin
 * Based on the JSONSchema type from @puckeditor/plugin-ai
 */
type JSONSchema = {
  [k: string]: unknown;
  type?:
    | "object"
    | "array"
    | "string"
    | "number"
    | "boolean"
    | "null"
    | "integer";
  properties?: Record<string, JSONSchema>;
  required?: string[];
  const?: string | number | boolean | null;
  enum?: Array<string | number | boolean | null>;
  anyOf?: JSONSchema[];
  additionalProperties?: boolean | JSONSchema;
};

/**
 * Zod schema for TranslatableString constant value
 * Represents a localized string with hasLocalizedValue flag
 */
const translatableStringConstantValueSchema = z
  .object({
    hasLocalizedValue: z.literal("true"),
  })
  .passthrough(); // Allow additional locale keys (en, es, fr, etc.)

/**
 * Zod schema for YextEntityField<TranslatableString>
 * Used when filter.types includes "type.string"
 */
export const yextEntityFieldTranslatableStringSchema = z.object({
  field: z.string(),
  constantValue: translatableStringConstantValueSchema,
  constantValueEnabled: z.literal(true),
});

/**
 * Zod schema for AssetImageType constant value
 * Based on AssetImageType from types/images.ts
 */
const assetImageTypeConstantValueSchema = z.object({
  url: z.string(),
  height: z.number(),
  width: z.number(),
  alternateText: z
    .union([
      z.string(),
      z
        .object({
          hasLocalizedValue: z.literal("true"),
        })
        .passthrough(),
    ])
    .optional(),
  assetImage: z.any().optional(), // Complex nested type, allow any
});

/**
 * Zod schema for YextEntityField<AssetImageType>
 * Used when filter.types includes "type.image"
 */
export const yextEntityFieldImageSchema = z.object({
  field: z.string(),
  constantValue: assetImageTypeConstantValueSchema,
  constantValueEnabled: z.literal(true),
});

/**
 * Zod schema for TranslatableCTA constant value
 * Based on TranslatableCTA from types/types.ts
 */
const translatableCTAConstantValueSchema = z.object({
  label: translatableStringConstantValueSchema,
  link: translatableStringConstantValueSchema,
  linkType: z
    .enum([
      "URL",
      "EMAIL",
      "PHONE",
      "CLICK_TO_WEBSITE",
      "DRIVING_DIRECTIONS",
      "OTHER",
    ])
    .optional(),
});

/**
 * Zod schema for YextEntityField<TranslatableCTA>
 * Used when filter.types includes "type.cta"
 */
export const yextEntityFieldCTASchema = z.object({
  field: z.string(),
  constantValue: translatableCTAConstantValueSchema,
  constantValueEnabled: z.literal(true),
});

/**
 * Cleans up a JSON Schema to ensure compatibility with Puck AI
 * - Removes $schema property (Puck AI doesn't need it)
 * - Converts additionalProperties: {} to additionalProperties: true for passthrough objects
 * - Handles empty object properties (z.any() results in {})
 */
function cleanSchemaForPuck(schema: unknown): JSONSchema {
  if (typeof schema !== "object" || schema === null) {
    return schema as JSONSchema;
  }

  const cleaned = { ...schema } as Record<string, unknown>;

  // Remove $schema property
  delete cleaned.$schema;

  // Recursively clean nested objects
  if (cleaned.properties && typeof cleaned.properties === "object") {
    const props = cleaned.properties as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) {
      // Handle empty object properties (from z.any()) - convert to allow any type
      if (
        typeof value === "object" &&
        value !== null &&
        Object.keys(value).length === 0
      ) {
        props[key] = {};
      } else {
        props[key] = cleanSchemaForPuck(value);
      }
    }
  }

  if (cleaned.anyOf && Array.isArray(cleaned.anyOf)) {
    cleaned.anyOf = cleaned.anyOf.map((item) => cleanSchemaForPuck(item));
  }

  // Fix additionalProperties: {} to additionalProperties: true for passthrough
  if (
    cleaned.additionalProperties &&
    typeof cleaned.additionalProperties === "object" &&
    !Array.isArray(cleaned.additionalProperties) &&
    Object.keys(cleaned.additionalProperties).length === 0
  ) {
    cleaned.additionalProperties = true;
  }

  return cleaned as JSONSchema;
}

/**
 * Gets the appropriate JSON Schema for a YextEntityField based on the filter types
 */
export function getSchemaForYextEntityField(
  filter: RenderEntityFieldFilter<any>
): JSONSchema | undefined {
  const types = filter.types || [];

  let rawSchema: unknown;

  // Handle type.string (TranslatableString)
  if (types.includes("type.string") && !filter.includeListsOnly) {
    rawSchema = z.toJSONSchema(yextEntityFieldTranslatableStringSchema);
  }
  // Handle type.image
  else if (types.includes("type.image")) {
    rawSchema = z.toJSONSchema(yextEntityFieldImageSchema);
  }
  // Handle type.cta
  else if (types.includes("type.cta")) {
    rawSchema = z.toJSONSchema(yextEntityFieldCTASchema);
  }
  // For other types, return undefined (no schema available yet)
  else {
    return undefined;
  }

  // Clean the schema for Puck AI compatibility
  return cleanSchemaForPuck(rawSchema);
}
