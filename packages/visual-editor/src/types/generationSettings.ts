import { z } from "zod";

const outputTokenBudget = z.number().int().positive();

/** Generation limits supplied by ALPHA, independently of prompt wording. */
export const generationSettingsSchema = z.strictObject({
  /** Maximum duration of one model attempt, in milliseconds. */
  attemptTimeoutMs: z.number().int().positive().max(2_147_483_647),
  maxOutputTokens: z.strictObject({
    /** Shared output allowance for fresh creation and whole-page updates. */
    page: outputTokenBudget,
    /** Output allowance for translation decisions and explicit card counts. */
    prepare: outputTokenBudget,
    /** Output allowance for planning edits to an existing page. */
    plan: outputTokenBudget,
    /** Output allowance for executing one planned section task. */
    section: outputTokenBudget,
  }),
});

export type GenerationSettings = z.infer<typeof generationSettingsSchema>;
