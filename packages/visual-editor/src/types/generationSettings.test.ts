// @vitest-environment node
import { expect, it } from "vitest";
import { testGenerationSettings } from "../internal/layoutGeneration/testing/promptFixtures.ts";
import { generationSettingsSchema } from "./generationSettings.ts";

it.each([
  undefined,
  { attemptTimeoutMs: 100 },
  { ...testGenerationSettings, attemptTimeoutMs: 0 },
  { ...testGenerationSettings, attemptTimeoutMs: 2_147_483_648 },
  {
    ...testGenerationSettings,
    maxOutputTokens: { ...testGenerationSettings.maxOutputTokens, page: 0 },
  },
  {
    ...testGenerationSettings,
    maxOutputTokens: { ...testGenerationSettings.maxOutputTokens, plan: 1.5 },
  },
  {
    ...testGenerationSettings,
    maxOutputTokens: {
      ...testGenerationSettings.maxOutputTokens,
      prepare: Infinity,
    },
  },
])(
  "rejects missing, incomplete or invalid platform generation settings",
  (value) => {
    expect(generationSettingsSchema.safeParse(value).success).toBe(false);
  }
);
