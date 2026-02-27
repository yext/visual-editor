const supportedRegionalLocales = new Set(["en-GB", "zh-TW"]);

/**
 * Maps an input locale to the locale folder used by translation assets.
 * Examples:
 * - "es-MX" => "es"
 * - "en-GB" => "en-GB"
 * - "zh-Hant-HK" => "zh-TW"
 *
 * @param locale - Input locale from platform or document context.
 * @returns Locale code that maps to an existing translations directory.
 */
export const resolveTranslationLocale = (locale: string): string => {
  if (!locale) {
    throw new Error("Locale is required to resolve translation locale.");
  }

  if (locale.startsWith("zh-Hant")) {
    return "zh-TW";
  }

  if (supportedRegionalLocales.has(locale)) {
    return locale;
  }

  return locale.split("-")[0];
};
