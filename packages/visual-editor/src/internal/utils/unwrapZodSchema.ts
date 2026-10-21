import type { z } from "zod";

export function unwrapZodSchema(schema: z.ZodType): z.ZodType;
export function unwrapZodSchema(
  schema: z.ZodType | undefined
): z.ZodType | undefined;
export function unwrapZodSchema(
  schema: z.ZodType | undefined
): z.ZodType | undefined {
  if (!schema) {
    return undefined;
  }

  const def = schema.def as { type: string; innerType?: z.ZodType };

  return ["optional", "nullable", "default", "prefault"].includes(def.type)
    ? unwrapZodSchema(def.innerType)
    : schema;
}
