// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { testPrompts } from "../../internal/layoutGeneration/testing/promptFixtures.ts";
import { loadLocalGenerationPrompts } from "./prompts.ts";

let rootDir: string;
beforeEach(() => {
  rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "local-generation-prompts-"));
});
afterEach(() => {
  fs.rmSync(rootDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

it.each([
  { name: "a missing configuration path", filePath: undefined },
  { name: "a missing file", filePath: "missing.ts" },
  {
    name: "invalid TypeScript",
    filePath: "invalid.ts",
    source: "export const = ;",
  },
  {
    name: "a missing export",
    filePath: "missing-export.ts",
    source: "export const other = {};",
  },
  {
    name: "an incompatible bundle",
    filePath: "incompatible.ts",
    source: `export const generationPrompts = ${JSON.stringify({ ...testPrompts, contractVersion: 999 })};`,
  },
])("disables generation for $name", async ({ filePath, source }) => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  if (filePath && source) {
    fs.writeFileSync(path.join(rootDir, filePath), source);
  }
  expect(await loadLocalGenerationPrompts(rootDir, filePath)).toBeNull();
  expect(error.mock.calls[0][0]).toContain("localEditor.generationPromptsPath");
});

it("loads a configured TypeScript bundle with a type-only package import", async () => {
  const source = `import type { GenerationPromptBundle } from "@yext/visual-editor";
export const generationPrompts = ${JSON.stringify(testPrompts)} satisfies GenerationPromptBundle;`;
  const target = path.join(rootDir, "custom.ts");
  fs.writeFileSync(target, source);
  expect(await loadLocalGenerationPrompts(rootDir, "custom.ts")).toEqual(
    testPrompts
  );
});

it("loads the bundle directly from an ALPHA checkout outside the Vite root using absolute or relative paths", async () => {
  const alphaDir = path.join(rootDir, "alpha");
  const viteRoot = path.join(rootDir, "section-library");
  fs.mkdirSync(alphaDir, { recursive: true });
  fs.mkdirSync(viteRoot);
  const target = path.join(alphaDir, "generationPrompts.ts");
  fs.writeFileSync(
    target,
    `export const generationPrompts = ${JSON.stringify(testPrompts)};`
  );
  expect(await loadLocalGenerationPrompts(viteRoot, target)).toEqual(
    testPrompts
  );
  expect(
    await loadLocalGenerationPrompts(viteRoot, "../alpha/generationPrompts.ts")
  ).toEqual(testPrompts);
});
