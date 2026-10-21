// @vitest-environment node
import { creationCatalog } from "./creationFixtures.ts";
import { createHash } from "node:crypto";
import { slottedFixture } from "./slottedFixtures.ts";
import { expect, it } from "vitest";
import { compileEditPlanningSchema } from "../edits/sectionEditPlanningSchema.ts";
import { compileSectionEditSchema } from "../edits/compileSectionEditSchema.ts";
import { compileGenerationSchema } from "../full-generation/pageSchema.ts";
import { compileGenerationPreparation } from "../full-generation/preparation.ts";
import * as prompts from "../prompts.ts";
import { buildGenerationPrompt } from "../prompts.ts";
import { readFileSync } from "node:fs";
const expected = JSON.parse(
  readFileSync(
    new URL("./compatibilityBaselines.json", import.meta.url),
    "utf8"
  )
);

/** Captured before the refactor; hashes include prompt whitespace and schema property order. */
it("preserves authored prompts and representative provider schemas", () => {
  const catalog = creationCatalog();
  const data = {
    content: [
      {
        type: "MainContent",
        props: {
          id: "main",
          content: [
            { type: "Heading", props: { id: "heading", text: "Existing" } },
          ],
        },
      },
    ],
  };
  const task = {
    taskId: "task",
    sectionId: "heading",
    targetComponentIds: ["heading"],
    instructions: "Update heading",
    dependsOn: [],
    structuralOperations: [],
    generateContent: true,
    translationMode: "defaultOnly" as const,
  };
  const hash = (value: unknown) =>
    createHash("sha256")
      .update(typeof value === "string" ? value : JSON.stringify(value))
      .digest("hex");
  const actual = {
    prompts: Object.fromEntries(
      Object.entries(prompts)
        .filter(
          ([key, value]) => key in expected.prompts && typeof value === "string"
        )
        .map(([key, value]) => [key, hash(value)])
    ),
    creationPrompt: hash(
      buildGenerationPrompt(catalog, undefined, ["en", "fr"])
    ),
    slottedPrompt: hash(
      buildGenerationPrompt(slottedFixture().catalog, undefined, ["en", "fr"])
    ),
    preparation: hash(
      compileGenerationPreparation(slottedFixture().catalog, ["en", "fr"])
        .jsonSchema
    ),
    creation: hash(compileGenerationSchema(catalog, ["en", "fr"]).jsonSchema),
    slotted: hash(
      compileGenerationSchema(slottedFixture().catalog, ["en", "fr"]).jsonSchema
    ),
    planning: hash(
      compileEditPlanningSchema(catalog, ["en", "fr"], data, "heading")
        .jsonSchema
    ),
    section: hash(
      compileSectionEditSchema(catalog, ["en", "fr"], data, task).jsonSchema
    ),
  };
  expect(actual).toEqual(expected);
});
