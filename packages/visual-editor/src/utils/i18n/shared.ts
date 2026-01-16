/**
 * Strips the region code from a locale string,
 * except for "en-GB" and "zh-TW", which we have specific translations for.
 */
export const stripLocaleRegion = (locale: string): string => {
  if (locale !== "en-GB" && locale !== "zh-TW") {
    return locale.split("-")[0];
  }
  return locale;
};
