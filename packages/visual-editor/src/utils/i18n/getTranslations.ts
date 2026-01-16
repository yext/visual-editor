const supportedRegionalLocales = ["en-GB", "zh-TW"];

/**
 * Dynamically imports the translation file for the given locale.
 */
export const getTranslations = async (
  locale: string,
  instance: "platform" | "components",
  isRetry = false
): Promise<Record<string, string>> => {
  if (!locale) {
    return {};
  }

  let strippedLocale = locale;
  if (!supportedRegionalLocales.includes(locale)) {
    strippedLocale = locale.split("-")[0];
  }
  if (locale.includes("zh-Hant")) {
    strippedLocale = "zh-TW";
  }

  console.log("importing", instance, "translations for locale", strippedLocale);
  try {
    const module = await import(
      `../../../locales/${instance}/${strippedLocale}/visual-editor.json`
    );
    return module.default;
  } catch (e) {
    if (isRetry || strippedLocale === "en") {
      console.error(
        `Error loading ${instance} translations for locale`,
        locale,
        e,
        "No fallback available."
      );
      return {};
    }
    console.error(
      `Error loading ${instance} translations for locale`,
      locale,
      e,
      "Falling back to en."
    );
    return getTranslations("en", instance, true);
  }
};
