import { z } from "zod";
import type { LayoutGenerationRequest } from "../editProtocol.ts";
import {
  sectionEditPlanSchema,
  sectionEditResultSchema,
  generationPreparationSchema,
} from "../editProtocolSchema.ts";

/** Distinguish repairable model output from failures that stop the turn. */
export class ChatGenerationError extends Error {
  constructor(
    message: string,
    /** Whether invalid output can be repaired once. */
    readonly retryable = false,
    /** Whether the failure must stop outstanding tasks. */
    readonly transport = false,
    /** Validation details for the repair request. */
    readonly feedback = message,
    readonly status?: number
  ) {
    super(message);
  }
}

const acceptedSchema = z.strictObject({
  type: z.literal("accepted"),
  text: z.string(),
  spec: z.strictObject({ content: z.array(z.any()) }).nullable(),
});
const preparedSchema = z.strictObject({
  type: z.literal("prepared"),
  preparation: generationPreparationSchema,
});
const planSchema = z.strictObject({
  type: z.literal("planned"),
  plan: sectionEditPlanSchema,
});
const resultSchema = z.strictObject({
  type: z.literal("section-result"),
  result: sectionEditResultSchema,
});
export type GenerationResult =
  | z.infer<typeof preparedSchema>
  | z.infer<typeof acceptedSchema>
  | z.infer<typeof planSchema>
  | z.infer<typeof resultSchema>;

export const parseGenerationResult = (
  event: unknown,
  mode: LayoutGenerationRequest["mode"]
): GenerationResult =>
  (mode === "prepare"
    ? preparedSchema
    : mode === "plan"
      ? planSchema
      : mode === "section"
        ? resultSchema
        : acceptedSchema
  ).parse(event);
