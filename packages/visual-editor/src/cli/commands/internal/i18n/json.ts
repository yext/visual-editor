import fs from "node:fs/promises";
import path from "node:path";

export type FlatTranslations = Record<string, string>;
export interface TranslationObject {
  [key: string]: string | TranslationObject;
}

const createFlatTranslations = (): FlatTranslations =>
  Object.create(null) as FlatTranslations;

const createTranslationObject = (): TranslationObject =>
  Object.create(null) as TranslationObject;

const validateObject = (
  value: unknown,
  filePath: string
): TranslationObject => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected a JSON object in ${filePath}.`);
  }

  for (const [key, child] of Object.entries(value)) {
    if (typeof child === "string") {
      continue;
    }
    if (!child || typeof child !== "object" || Array.isArray(child)) {
      throw new Error(
        `Expected translation "${key}" in ${filePath} to be a string or object.`
      );
    }
    validateObject(child, filePath);
  }
  return value as TranslationObject;
};

/** Loads a translation JSON object and rejects malformed or non-string values. */
export const loadTranslationJson = async (
  filePath: string,
  options: { allowMissing?: boolean } = {}
): Promise<TranslationObject> => {
  let source: string;
  try {
    source = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === "ENOENT" &&
      options.allowMissing
    ) {
      return {};
    }
    throw new Error(`Could not read ${filePath}: ${(error as Error).message}`);
  }

  try {
    return validateObject(JSON.parse(source) as unknown, filePath);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Malformed JSON in ${filePath}: ${error.message}`);
    }
    throw error;
  }
};

export const flattenTranslations = (
  value: TranslationObject,
  prefix = ""
): FlatTranslations => {
  const result = createFlatTranslations();
  for (const [key, child] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "string") {
      result[fullKey] = child;
    } else {
      Object.assign(result, flattenTranslations(child, fullKey));
    }
  }
  return result;
};

/** Loads and flattens a translation file for key-oriented workflows. */
export const loadFlatTranslations = async (
  filePath: string,
  options: { allowMissing?: boolean } = {}
): Promise<FlatTranslations> =>
  flattenTranslations(await loadTranslationJson(filePath, options));

export const unflattenTranslations = (
  translations: FlatTranslations
): TranslationObject => {
  const result = createTranslationObject();
  for (const key of Object.keys(translations).sort()) {
    const segments = key.split(".");
    let cursor = result;
    for (const [index, segment] of segments.entries()) {
      if (index === segments.length - 1) {
        cursor[segment] = translations[key];
      } else {
        const child = cursor[segment];
        if (!child || typeof child === "string") {
          cursor[segment] = createTranslationObject();
        }
        cursor = cursor[segment] as TranslationObject;
      }
    }
  }
  return result;
};

export const saveTranslations = async (
  filePath: string,
  translations: FlatTranslations
): Promise<void> => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(
    filePath,
    `${JSON.stringify(unflattenTranslations(translations), null, 2)}\n`,
    "utf8"
  );
};

export const translationPath = (
  rootDir: string,
  kind: "platform" | "page",
  locale: string
): string =>
  path.join(rootDir, "src", "library", "i18n", kind, `${locale}.json`);
