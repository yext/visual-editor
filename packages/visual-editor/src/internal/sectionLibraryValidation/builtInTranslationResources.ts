import path from "node:path";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";
import type { TranslationDictionary } from "../../utils/i18n/translationResources.ts";

/** Load built-in (visual-editor) translations. */
export const readBuiltInTranslations = (
  resourceKind: "platform" | "page",
  locale: string
): TranslationDictionary | undefined => {
  const currentModuleDirectory = path.dirname(fileURLToPath(import.meta.url));

  let localeDirectory: string;
  if (
    currentModuleDirectory.endsWith(
      path.join("src", "internal", "sectionLibraryValidation")
    )
  ) {
    // Running directly in visual-editor repo
    localeDirectory = path.resolve(
      currentModuleDirectory,
      "..",
      "..",
      "..",
      "locales"
    );
  } else if (path.basename(path.dirname(currentModuleDirectory)) === "dist") {
    // Running in bundled CLI and Vite plugin under dist/cli and dist/plugin.
    localeDirectory = path.resolve(currentModuleDirectory, "..", "locales");
  } else {
    throw new Error(
      `Cannot determine the built-in translation location from ${currentModuleDirectory}`
    );
  }

  const localePath = path.join(
    localeDirectory,
    resourceKind,
    locale,
    "visual-editor.json"
  );
  if (fs.existsSync(localePath)) {
    return JSON.parse(fs.readFileSync(localePath, "utf8"));
  }
};
