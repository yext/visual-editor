import { z } from "zod";
import { canonicalWidthOptions } from "../selectorOptions.ts";
import type { YextFieldDefinition } from "../../fields/fields.ts";
import { inferGenerationSchema } from "../../internal/layoutGeneration/schema/inferGenerationSchema.ts";
import {
  normalizeGenerationFields,
  validateSingleChildSlots,
} from "../../internal/layoutGeneration/schema/normalizeGenerationFields.ts";

/** Saved width values, independent of theme state or a mounted editor. */
export const widthZodSchema = z.enum(
  canonicalWidthOptions.map(({ value }) => value)
);

/** Preserve canonical guidance and append each instruction line at most once. */
export function appendSchemaInstructions<T extends z.ZodType>(
  schema: T,
  instructions?: string
): T {
  const lines = [schema.description, instructions]
    .filter((value): value is string => !!value)
    .flatMap((value) => value.split("\n"));
  return lines.length
    ? schema.describe([...new Set(lines)].join("\n"))
    : schema;
}

/**
 * Infer an authored contract for a custom editor's native backing field.
 * No renderers, editor state, option callbacks or catalog construction are used.
 * Unsupported or excluded fields throw instead of returning a partial contract.
 * Slot child contracts still require a catalog during generation compilation.
 */
export const inferFieldZodSchema = (
  field: YextFieldDefinition,
  options: { defaultValue?: unknown } = {}
): z.ZodType => {
  const fields = normalizeGenerationFields({ value: field });
  validateSingleChildSlots("Field", fields, false);
  const omissions: Parameters<typeof inferGenerationSchema>[4] = [];
  const schema = inferGenerationSchema(
    "Field",
    fields,
    { value: options.defaultValue },
    undefined,
    omissions
  ).shape.value as z.ZodType | undefined;

  if (!schema || omissions.length) {
    throw new Error(
      `Cannot infer generation schema: ${omissions.map(({ path, reason }) => `${path}: ${reason}`).join("; ") || "field is excluded"}`
    );
  }
  return schema;
};
