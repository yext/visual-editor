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
 * Checks if a value is an empty object (from z.any() or similar)
 */
function isEmptyObject(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}

/**
 * Cleans a JSON Schema to be compatible with Puck AI
 * - Removes $schema property (Puck AI doesn't need it)
 * - Converts empty additionalProperties: {} to additionalProperties: true
 * - Removes properties with empty object schemas {} (from z.any())
 */
function cleanSchemaForPuck(schema: unknown): JSONSchema {
  if (typeof schema !== "object" || schema === null) {
    return schema as JSONSchema;
  }

  const obj = schema as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip $schema property
    if (key === "$schema") {
      continue;
    }

    // Handle additionalProperties: {} -> additionalProperties: true
    if (key === "additionalProperties" && isEmptyObject(value)) {
      cleaned[key] = true;
      continue;
    }

    // Handle properties object - filter out empty object properties
    if (key === "properties" && typeof value === "object" && value !== null) {
      const props = value as Record<string, unknown>;
      const cleanedProps: Record<string, unknown> = {};

      for (const [propKey, propValue] of Object.entries(props)) {
        // Skip properties with empty object schemas (from z.any())
        if (isEmptyObject(propValue)) {
          continue;
        }
        cleanedProps[propKey] = cleanSchemaForPuck(propValue);
      }

      cleaned[key] = cleanedProps;
      continue;
    }

    // Handle required array - remove references to filtered out properties
    if (key === "required" && Array.isArray(value)) {
      // We'll handle this after properties are cleaned
      cleaned[key] = value;
      continue;
    }

    // Recursively clean nested objects
    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        cleaned[key] = value.map((item) => cleanSchemaForPuck(item));
      } else {
        cleaned[key] = cleanSchemaForPuck(value);
      }
    } else {
      cleaned[key] = value;
    }
  }

  // Update required array to only include properties that still exist
  if (cleaned.required && cleaned.properties) {
    const existingProps = Object.keys(
      cleaned.properties as Record<string, unknown>
    );
    cleaned.required = (cleaned.required as string[]).filter((prop) =>
      existingProps.includes(prop)
    );
    if ((cleaned.required as string[]).length === 0) {
      delete cleaned.required;
    }
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
