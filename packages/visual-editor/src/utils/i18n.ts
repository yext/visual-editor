import i18next from "i18next";

const fallbackT = (key: string) => key;

/**
 * i18n is a helper function that uses i18next if it is initialized,
 * but just returns the original string otherwise.
 *
 * If translation is missing or empty, returns the original string to preserve capitalization.
 *
 * @param key translation key
 */
export const i18n = (key: string): string => {
  try {
    if (!i18next.isInitialized) {
      return fallbackT(key);
    }

    return i18next.t(key) || fallbackT(key);
  } catch {
    return fallbackT(key);
  }
};
