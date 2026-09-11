import { normalizeLocale } from "../normalizeLocale.ts";

/** An object mapping translation keys to the translated values. Allows sub-objects.   */
export type TranslationDictionary = {
  [key: string]: string | TranslationDictionary;
};

/** A function that loads one complete locale dictionary on request. */
export type TranslationLoader = () => Promise<TranslationDictionary>;

/** Maps normalized locales to complete, ready-to-install dictionaries. */
export type TranslationLoaders = Partial<Record<string, TranslationLoader>>;

/** The complete translation loaders used by a Section Library runtime. */
export type SectionLibraryTranslationLoaders = {
  platform: TranslationLoaders;
  page: TranslationLoaders;
};

const supportedRegionalLocales = ["en-GB", "zh-TW"];

export const normalizeTranslationLocale = (locale: string): string => {
  const normalizedLocale = normalizeLocale(locale);
  if (normalizedLocale.includes("zh-Hant")) {
    return "zh-TW";
  }
  return supportedRegionalLocales.includes(normalizedLocale)
    ? normalizedLocale
    : normalizedLocale.split("-")[0];
};

/** Loads a complete generated translation dictionary, falling back to English. */
export const loadTranslationDictionary = async (
  locale: string,
  loaders: TranslationLoaders
): Promise<TranslationDictionary> => {
  const normalizedLocale = normalizeTranslationLocale(locale);
  const loader = loaders[normalizedLocale];
  try {
    if (!loader) {
      throw new Error(`No translation resource for ${normalizedLocale}`);
    }
    return await loader();
  } catch (error) {
    if (normalizedLocale === "en") {
      console.error(
        `Error loading translations for locale ${locale}. No fallback available.`,
        error
      );
      return {};
    }
    console.error(
      `Error loading translations for locale ${locale}. Falling back to en.`,
      error
    );
    try {
      return (await loaders.en?.()) ?? {};
    } catch (fallbackError) {
      console.error(
        "Error loading translations for fallback locale en.",
        fallbackError
      );
      return {};
    }
  }
};

/** Represents a collision between the built-in (visual-editor) translations and repo (section library) translations. */
export type TranslationShapeCollision = {
  /** The translation key that has a conflict */
  path: string;
  /** The type of the built-in (visual-editor) value at this path. */
  builtInType: "object" | "string";
  /** The type of the repo (section library) value at this path. */
  repoType: "object" | "string";
};

/**
 * mergeTranslationDictionaries combines the built-in (visual-editor) translations
 * and repo (section library) translations using a deep merge.
 * If a value is provided in both places, the repo value takes precedence.
 * If there is a type conflict for a key (one source has an object and the other has a string),
 * then the repo value still takes precedence but onShapeCollision is invoked.
 */
export const mergeTranslationDictionaries = (
  /** The TranslationDictionary from the visual-editor library. */
  builtIn: TranslationDictionary,
  /** The TranslationDictionary from the section library repo. */
  repo: TranslationDictionary,
  /** A callback for when there is a type collision. */
  onShapeCollision?: (collision: TranslationShapeCollision) => void,
  /** Used for recursive merging. */
  parentPath = ""
): TranslationDictionary => {
  const merged: TranslationDictionary = { ...builtIn };

  for (const [key, repoValue] of Object.entries(repo)) {
    const builtInValue = builtIn[key];
    const keyPath = parentPath ? `${parentPath}.${key}` : key;

    if (builtInValue === undefined) {
      merged[key] = repoValue;
      continue;
    }

    const builtInIsDictionary = isDictionary(builtInValue);
    const repoIsDictionary = isDictionary(repoValue);
    if (builtInIsDictionary && repoIsDictionary) {
      merged[key] = mergeTranslationDictionaries(
        builtInValue,
        repoValue,
        onShapeCollision,
        keyPath
      );
      continue;
    }

    if (builtInIsDictionary !== repoIsDictionary) {
      onShapeCollision?.({
        path: keyPath,
        builtInType: builtInIsDictionary ? "object" : "string",
        repoType: repoIsDictionary ? "object" : "string",
      });
    }
    merged[key] = repoValue;
  }

  return merged;
};

const isDictionary = (
  value: string | TranslationDictionary
): value is TranslationDictionary => typeof value === "object";
