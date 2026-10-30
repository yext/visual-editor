import path from "node:path";
import { pathToFileURL } from "node:url";
import { generationPromptBundleSchema } from "../../types/generationPrompts.ts";

/** Read once at server startup. The local harness deliberately has no refresh/cache machinery. */
export const loadLocalGenerationPrompts = async (
  rootDir: string,
  filePath?: string
) => {
  if (!filePath?.trim()) {
    console.error(
      "AI page generation disabled: set localEditor.generationPromptsPath to the TypeScript prompt bundle in your ALPHA checkout and restart the dev server."
    );
    return null;
  }
  try {
    const { tsImport } = await import("tsx/esm/api");
    const imported = await tsImport(
      pathToFileURL(path.resolve(rootDir, filePath)).href,
      import.meta.url
    );
    // tsx may wrap CommonJS exports when the section library has no ESM package type.
    const bundle =
      imported.generationPrompts ?? imported.default?.generationPrompts;
    return generationPromptBundleSchema.parse(bundle);
  } catch (error) {
    console.error(
      `AI page generation disabled: unable to load ${filePath}. Check localEditor.generationPromptsPath and restart the dev server.`,
      error
    );
    return null;
  }
};
