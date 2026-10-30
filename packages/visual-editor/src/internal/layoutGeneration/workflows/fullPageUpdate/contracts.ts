import { z } from "zod";

const id = z.string().trim().min(1);
export const fullPageUpdateAnchorSchema = z.union([
  z.strictObject({ position: z.enum(["start", "end"]) }),
  z.strictObject({ position: z.enum(["before", "after"]), componentId: id }),
]);
export const fullPageUpdateCollectionSchema = z.strictObject({
  ownerId: id.nullable(),
  slotPath: z.string().nullable(),
});

/** Materialized internal values. The model-facing component schemas are stricter. */
export const fullPageUpdateStepSchema = z.union([
  z.strictObject({ kind: z.literal("keep"), sectionId: id }),
  z.strictObject({ kind: z.literal("remove"), sectionId: id }),
  z.strictObject({
    kind: z.literal("reorder"),
    sectionId: id,
    anchor: fullPageUpdateAnchorSchema,
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
    collection: fullPageUpdateCollectionSchema,
    anchor: fullPageUpdateAnchorSchema,
    sections: z
      .array(z.strictObject({ type: id, props: z.record(z.string(), z.any()) }))
      .min(1),
  }),
]);
export type FullPageUpdateStep = z.infer<typeof fullPageUpdateStepSchema>;

export const fullPageUpdateResultSchema = z.union([
  z.strictObject({ action: z.literal("clarification"), question: id }),
  z.strictObject({
    action: z.literal("fullPageUpdate"),
    steps: z.array(fullPageUpdateStepSchema),
  }),
]);
export type FullPageUpdateResult = z.infer<typeof fullPageUpdateResultSchema>;
