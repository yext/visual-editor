import { z } from "zod";

const id = z.string().trim().min(1);
export const regenerationAnchorSchema = z.union([
  z.strictObject({ position: z.enum(["start", "end"]) }),
  z.strictObject({ position: z.enum(["before", "after"]), componentId: id }),
]);
export const regenerationCollectionSchema = z.strictObject({
  ownerId: id.nullable(),
  slotPath: z.string().nullable(),
});

/** Materialized internal values. The model-facing component schemas are stricter. */
export const regenerationStepSchema = z.union([
  z.strictObject({ kind: z.literal("keep"), sectionId: id }),
  z.strictObject({ kind: z.literal("remove"), sectionId: id }),
  z.strictObject({
    kind: z.literal("reorder"),
    sectionId: id,
    anchor: regenerationAnchorSchema,
  }),
  z.strictObject({
    kind: z.literal("replace"),
    sectionId: id,
    sections: z
      .array(z.strictObject({ type: id, props: z.record(z.string(), z.any()) }))
      .min(1),
  }),
  z.strictObject({
    kind: z.literal("insert"),
    collection: regenerationCollectionSchema,
    anchor: regenerationAnchorSchema,
    sections: z
      .array(z.strictObject({ type: id, props: z.record(z.string(), z.any()) }))
      .min(1),
  }),
]);
export type RegenerationStep = z.infer<typeof regenerationStepSchema>;

export const regenerationResultSchema = z.union([
  z.strictObject({ action: z.literal("clarification"), question: id }),
  z.strictObject({
    action: z.literal("regenerate"),
    steps: z.array(regenerationStepSchema),
  }),
]);
export type RegenerationResult = z.infer<typeof regenerationResultSchema>;
