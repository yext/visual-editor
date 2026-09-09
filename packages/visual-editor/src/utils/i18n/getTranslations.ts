import {
  normalizeTranslationLocale,
  type TranslationDictionary,
} from "./translationResources.ts";

/**
 * Dynamically imports the translation file for the given locale.
 */
export const getTranslations = async (
  locale: string,
  resourceKind: "platform" | "page",
  isRetry = false
): Promise<TranslationDictionary> => {
  if (!locale) {
    return {};
  }

  const strippedLocale = normalizeTranslationLocale(locale);

  try {
    const module = await import(
      `../../../locales/${resourceKind}/${strippedLocale}/visual-editor.json`
    );
    return module.default as TranslationDictionary;
  } catch (e) {
    if (isRetry || strippedLocale === "en") {
      console.error(
        `Error loading ${resourceKind} translations for locale`,
        locale,
        e,
        "No fallback available."
      );
      return {};
    }
    console.error(
      `Error loading ${resourceKind} translations for locale`,
      locale,
      e,
      "Falling back to en."
    );
    return getTranslations("en", resourceKind, true);
  }
};
