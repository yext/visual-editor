import { z } from "zod";

/** Literal substitutions only: no expressions, helpers, loops, or recursive expansion. */
const template = (tokens: string[] = []) => {
  const required = tokens
    .map((token) => `(?=[\\s\\S]*\\{\\{${token}\\}\\})`)
    .join("");
  const substitution = tokens.length
    ? `|\\{\\{(?:${tokens.join("|")})\\}\\}`
    : "";
  return z
    .string()
    .min(1)
    .regex(
      new RegExp(
        `^(?=[\\s\\S]*\\S)${required}(?:(?!\\{\\{)[\\s\\S]${substitution})*$`
      ),
      `Use exactly the documented placeholders: ${tokens.join(", ") || "none"}.`
    );
};

const pageTemplate = () =>
  template([
    "componentNames",
    "locales",
    "componentDescriptions",
    "recommendedSections",
    "listGuidance",
  ]);

/** Contract version changes when keys or substitutions change. */
export const generationPromptBundleSchema = z.strictObject({
  contractVersion: z.literal(1),
  prompts: z.strictObject({
    prepare: template(),
    create: pageTemplate(),
    fullPageUpdate: pageTemplate(),
    plan: template(),
    section: template(),
  }),
  context: z.strictObject({
    createLists: template(),
    fullPageUpdateLists: template(),
    createRecommendations: template(["sectionIds"]),
    fullPageUpdateRecommendations: template(["sectionIds"]),
  }),
});

export type GenerationPromptBundle = z.infer<
  typeof generationPromptBundleSchema
>;
