import path from "node:path";
import type { CliIo } from "../../../command.ts";
import { loadFlatTranslations, translationPath } from "./json.ts";
import { expandKeysForLocale, findSourceValue } from "./plurals.ts";

export type MissingTranslation = {
  locale: string;
  key: string;
  source: string;
  filePath: string;
};

/** Finds every required empty or absent platform translation. */
export const findMissingPlatformTranslations = async (
  rootDir: string,
  locales: string[]
): Promise<MissingTranslation[]> => {
  const englishPath = translationPath(rootDir, "platform", "en");
  const english = await loadFlatTranslations(englishPath);
  const missing: MissingTranslation[] = [];

  for (const locale of locales) {
    const filePath = translationPath(rootDir, "platform", locale);
    const localized = await loadFlatTranslations(filePath, {
      allowMissing: true,
    });
    const required = expandKeysForLocale(Object.keys(english), locale);
    for (const key of new Set([...required, ...Object.keys(localized)])) {
      if ((localized[key] ?? "").trim() !== "") {
        continue;
      }
      missing.push({
        locale,
        key,
        source: findSourceValue(key, english) ?? "",
        filePath,
      });
    }
  }
  return missing;
};

/** Prints missing platform translations to the cli. */
export const renderMissingPlatformTranslations = (
  rootDir: string,
  missing: MissingTranslation[],
  io: CliIo,
  destination: "stdout" | "stderr" = "stdout"
): void => {
  if (missing.length === 0) {
    io[destination].write("All platform translations are complete.\n");
    return;
  }

  io[destination].write(`Missing ${missing.length} platform translation(s):\n`);
  for (const entry of missing) {
    const relativePath = path.relative(rootDir, entry.filePath);
    io[destination].write(
      `- ${relativePath}:1 [${entry.locale}] ${entry.key}${entry.source ? ` = ${JSON.stringify(entry.source)}` : ""}\n`
    );
  }
};

export const assertPlatformTranslationsComplete = async (
  rootDir: string,
  io: CliIo,
  locales: string[]
): Promise<void> => {
  const missing = await findMissingPlatformTranslations(rootDir, locales);
  if (missing.length === 0) {
    return;
  }
  renderMissingPlatformTranslations(rootDir, missing, io, "stderr");
  throw new Error(
    `${missing.length} platform translation(s) are missing. Run "yextve i18n prepare" before finalizing.`
  );
};
