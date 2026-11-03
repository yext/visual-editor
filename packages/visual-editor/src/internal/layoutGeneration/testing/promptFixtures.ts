import { generationSettingsSchema } from "../../../types/generationSettings.ts";
import { generationPromptBundleSchema } from "../../../types/generationPrompts.ts";

const pageTemplate = (mode: string) => `${mode}
COMPONENT_NAMES {{componentNames}}
LOCALES {{locales}}
{{recommendedSections}}
{{listGuidance}}
COMPONENT_DATA
{{componentDescriptions}}`;

/** Synthetic instructions test editor wiring independently of ALPHA's prompt wording. */
export const testPrompts = generationPromptBundleSchema.parse({
  contractVersion: 1,
  prompts: {
    prepare: "PREPARE",
    create: pageTemplate("CREATE"),
    fullPageUpdate: pageTemplate("FULL_PAGE_UPDATE"),
    plan: "PLAN",
    section: "SECTION",
  },
  context: {
    createLists: "CREATE_LISTS",
    fullPageUpdateLists: "FULL_PAGE_UPDATE_LISTS",
    createRecommendations: "CREATE_RECOMMENDATIONS {{sectionIds}}",
    fullPageUpdateRecommendations:
      "FULL_PAGE_UPDATE_RECOMMENDATIONS {{sectionIds}}",
  },
});

export const readTestPromptComponents = (instructions: string) =>
  JSON.parse(instructions.split("\nCOMPONENT_DATA\n")[1]);

/** Synthetic settings shared by tests; custom-limit tests override these explicitly. */
export const testGenerationSettings = generationSettingsSchema.parse({
  attemptTimeoutMs: 300_000,
  maxOutputTokens: {
    page: 128_000,
    prepare: 2_048,
    plan: 16_384,
    section: 32_768,
  },
});
