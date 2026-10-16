import { z } from "zod";
import type { NewEditComponent } from "./editProtocol.ts";

const id = z.string().trim().min(1);
const collectionSchema = z.strictObject({
  ownerId: id.nullable(),
  slotPath: z.string().nullable(),
});
const anchorSchema = z.union([
  z.strictObject({ position: z.enum(["start", "end"]) }),
  z.strictObject({ position: z.enum(["before", "after"]), componentId: id }),
]);
const insertPlanSchema = z.strictObject({
  kind: z.literal("insert"),
  insertionKey: id,
  componentType: id,
  collection: collectionSchema,
  anchor: anchorSchema,
});
const removeSchema = z.strictObject({
  kind: z.literal("remove"),
  componentId: id,
});
const reorderSchema = z.strictObject({
  kind: z.literal("reorder"),
  componentId: id,
  anchor: anchorSchema,
});
export const sectionEditTaskSchema = z.strictObject({
  taskId: id,
  sectionId: id,
  targetComponentIds: z.array(id),
  instructions: z.string(),
  description: z.string().trim().min(1).optional(),
  structuralOperations: z.array(
    z.union([insertPlanSchema, removeSchema, reorderSchema])
  ),
  dependsOn: z.array(id),
  generateContent: z.boolean().optional(),
});
const newComponentSchema: z.ZodType<NewEditComponent> = z.lazy(() =>
  z.strictObject({
    type: id,
    authoredValues: z.record(z.string(), z.json()),
    unsetPaths: z.array(z.string()).optional(),
    slots: z.array(
      z.strictObject({
        slotPath: z.string(),
        components: z.array(newComponentSchema),
      })
    ),
  })
);
export const sectionEditResultSchema = z.strictObject({
  taskId: id,
  sectionId: id,
  operations: z.array(
    z.union([
      z.strictObject({
        kind: z.literal("update"),
        componentId: id,
        changes: z
          .array(
            z.union([
              z.strictObject({
                kind: z.literal("set"),
                path: z.string(),
                value: z.json(),
              }),
              z.strictObject({ kind: z.literal("unset"), path: z.string() }),
            ])
          )
          .min(1),
      }),
      z.strictObject({
        kind: z.literal("insert"),
        insertionKey: id,
        collection: collectionSchema,
        anchor: anchorSchema,
        component: newComponentSchema,
      }),
      removeSchema,
      reorderSchema,
    ])
  ),
});

/** Validate the browser envelope before scheduling tasks from the planner. */
export const sectionEditPlanSchema = z
  .strictObject({
    intent: z.enum([
      "content",
      "globalStyle",
      "mixed",
      "conversation",
      "clarification",
    ]),
    text: z.string(),
    clarification: z.string().trim().min(1).nullable(),
    globalStyleGuidance: z.string().trim().min(1).nullable(),
    sharedIntent: z.string(),
    tasks: z.array(sectionEditTaskSchema),
  })
  .superRefine((plan, context) => {
    const hasTasks = plan.tasks.length > 0;
    const edits = plan.intent === "content" || plan.intent === "mixed";
    const style = plan.intent === "globalStyle" || plan.intent === "mixed";
    const clarification = plan.intent === "clarification";
    if (
      edits !== hasTasks ||
      style !== (plan.globalStyleGuidance !== null) ||
      clarification !== (plan.clarification !== null)
    ) {
      context.addIssue({
        code: "custom",
        message: "Plan intent does not match its tasks.",
      });
    }
  });
