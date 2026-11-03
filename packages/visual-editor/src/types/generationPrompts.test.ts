// @vitest-environment node
import { expect, it } from "vitest";
import { testPrompts } from "../internal/layoutGeneration/testing/promptFixtures.ts";
import { renderPrompt } from "../internal/layoutGeneration/prompts.ts";
import { generationPromptBundleSchema } from "./generationPrompts.ts";

it.each([
  undefined,
  {
    ...testPrompts,
    prompts: { ...testPrompts.prompts, unknownWorkflow: "Unknown prompt" },
  },
  {
    ...testPrompts,
    prompts: {
      ...testPrompts.prompts,
      fullPageUpdate: undefined,
    },
  },
  { ...testPrompts, contractVersion: 2 },
  { ...testPrompts, prompts: { ...testPrompts.prompts, section: undefined } },
  { ...testPrompts, prompts: { ...testPrompts.prompts, prepare: " " } },
  {
    ...testPrompts,
    prompts: {
      ...testPrompts.prompts,
      create: testPrompts.prompts.create.replace("{{locales}}", ""),
    },
  },
  { ...testPrompts, prompts: { ...testPrompts.prompts, plan: "{{unknown}}" } },
  {
    ...testPrompts,
    context: {
      ...testPrompts.context,
      createRecommendations: "{{#each sectionIds}}",
    },
  },
])("rejects missing, incompatible, or malformed bundles", (value) => {
  expect(generationPromptBundleSchema.safeParse(value).success).toBe(false);
});

it("performs a single literal substitution without executing or expanding supplied context", () => {
  expect(renderPrompt("Context: {{value}}", { value: "{{another}} $&" })).toBe(
    "Context: {{another}} $&"
  );
  expect(() => renderPrompt("{{missing}}", {})).toThrow(
    "Unknown prompt placeholder"
  );
});
