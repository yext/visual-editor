import path from "node:path";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";
import type { TranslationDictionary } from "../../utils/i18n/translationResources.ts";

/** Load built-in (visual-editor) translations. */
export const readBuiltInTranslations = (
  resourceKind: "platform" | "page",
  locale: string
): TranslationDictionary | undefined => {
  const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
  for (let depth = 0; depth <= 5; depth++) {
    const localePath = path.join(
      moduleDirectory,
      ...Array(depth).fill(".."),
      "locales",
      resourceKind,
      locale,
      "visual-editor.json"
    );
    if (fs.existsSync(localePath)) {
      return JSON.parse(fs.readFileSync(localePath, "utf8"));
    }
  }
};
