import fs from "node:fs/promises";
import path from "node:path";
import type { I18nextToolkitConfig } from "i18next-cli";

export type TranslationKind = "platform" | "page";

const sourcePattern = "src/library/**/*.{ts,tsx,js,jsx}";
const ignoredPatterns = [
  "src/library/.generated/**",
  "src/library/**/.generated/**",
  "src/library/**/__screenshots__/**",
  "src/library/**/screenshots/**",
];

const resolvePatterns = (rootDir: string, patterns: string[]): string[] =>
  patterns.map((pattern) => path.join(rootDir, pattern));

const isCanonicalLocale = (locale: string): boolean => {
  try {
    return Intl.getCanonicalLocales(locale)[0] === locale;
  } catch {
    return false;
  }
};

/** Reads the library.json locale scope so i18n only touches requested languages. */
export const loadLibraryLocales = async (
  rootDir: string
): Promise<string[]> => {
  const filePath = path.join(rootDir, "src", "library", "library.json");
  let metadata: unknown;
  try {
    metadata = JSON.parse(await fs.readFile(filePath, "utf8")) as unknown;
  } catch (error) {
    throw new Error(
      `Could not read valid JSON from ${filePath}: ${(error as Error).message}`
    );
  }
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error(`${filePath} must contain a JSON object.`);
  }

  const locales = (metadata as Record<string, unknown>).locales;
  if (
    !Array.isArray(locales) ||
    locales.some((locale) => typeof locale !== "string")
  ) {
    throw new Error(`The "locales" key in ${filePath} must be a string array.`);
  }
  const invalidLocale = locales.find((locale) => !isCanonicalLocale(locale));
  if (invalidLocale !== undefined) {
    throw new Error(
      `Invalid locale ${JSON.stringify(invalidLocale)} in ${filePath}. Use canonical locale formatting such as "en-GB".`
    );
  }
  if (!locales.includes("en")) {
    throw new Error(
      `The "locales" key in ${filePath} must include "en" as the source locale.`
    );
  }
  return locales;
};

/** Creates the fixed Section Library i18next configuration for one resource. */
export const createI18nConfig = (
  rootDir: string,
  kind: TranslationKind,
  locales: string[]
): I18nextToolkitConfig => ({
  locales,
  extract: {
    input: path.join(rootDir, sourcePattern),
    ignore: resolvePatterns(rootDir, ignoredPatterns),
    output: path.join(
      rootDir,
      "src",
      "library",
      "i18n",
      kind,
      "{{language}}.json"
    ),
    defaultNS: false,
    contextSeparator: "_",
    pluralSeparator: "_",
    interpolationPrefix: "{{",
    interpolationSuffix: "}}",
    functions:
      kind === "platform"
        ? ["t", "*.t", "i18next.t", "pt", "msg"]
        : ["t", "*.t", "i18next.t"],
    primaryLanguage: "en",
    defaultValue: "",
    sort: true,
    indentation: 2,
    removeUnusedKeys: true,
  },
  lint: {
    ignore: resolvePatterns(rootDir, ignoredPatterns),
  },
});
