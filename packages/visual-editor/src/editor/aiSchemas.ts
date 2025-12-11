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
 * Gets the appropriate JSON Schema for a YextEntityField based on the filter types
 */
export function getSchemaForYextEntityField(
  filter: RenderEntityFieldFilter<any>
): JSONSchema | undefined {
  const types = filter.types || [];

  // Handle type.string (TranslatableString)
  if (types.includes("type.string") && !filter.includeListsOnly) {
    return z.toJSONSchema(
      yextEntityFieldTranslatableStringSchema
    ) as JSONSchema;
  }

  // Handle type.image
  if (types.includes("type.image")) {
    return z.toJSONSchema(yextEntityFieldImageSchema) as JSONSchema;
  }

  // Handle type.cta
  if (types.includes("type.cta")) {
    return z.toJSONSchema(yextEntityFieldCTASchema) as JSONSchema;
  }

  // For other types, return undefined (no schema available yet)
  // This can be extended as needed
  return undefined;
}
