import {
  generationSettingsSchema,
  type GenerationSettings,
} from "../../types/generationSettings.ts";
import type { LocalEditorOptions } from "../local-editor/types.ts";

/** Defaults belong only to the local test harness; the platform supplies all settings. */
const defaultLocalGenerationSettings: GenerationSettings = {
  attemptTimeoutMs: 300_000,
  maxOutputTokens: {
    page: 128_000,
    prepare: 2_048,
    plan: 16_384,
    section: 32_768,
  },
};

export const resolveLocalGenerationSettings = (
  overrides?: LocalEditorOptions["generationSettings"]
): GenerationSettings | null => {
  const parsed = generationSettingsSchema.safeParse({
    attemptTimeoutMs:
      overrides?.attemptTimeoutMs ??
      defaultLocalGenerationSettings.attemptTimeoutMs,
    maxOutputTokens: {
      page:
        overrides?.maxOutputTokens?.page ??
        defaultLocalGenerationSettings.maxOutputTokens.page,
      prepare:
        overrides?.maxOutputTokens?.prepare ??
        defaultLocalGenerationSettings.maxOutputTokens.prepare,
      plan:
        overrides?.maxOutputTokens?.plan ??
        defaultLocalGenerationSettings.maxOutputTokens.plan,
      section:
        overrides?.maxOutputTokens?.section ??
        defaultLocalGenerationSettings.maxOutputTokens.section,
    },
  });
  if (!parsed.success) {
    console.error(
      "AI page generation disabled: localEditor.generationSettings must contain positive integer limits.",
      parsed.error
    );
    return null;
  }
  return parsed.data;
};
