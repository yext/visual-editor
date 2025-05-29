import { useTranslation as useRealTranslation } from "react-i18next";

const fallbackT = (key: string) => key;

/**
 * i18n is a helper function that uses i18next if it is initialized,
 * but just returns the original string otherwise.
 *
 * If translation is missing or empty, returns the original string to preserve capitalization.
 *
 * @param key translation key
 */
export const i18n = (key: string) => {
  try {
    const { t } = useRealTranslation() || {};
    if (typeof t === "function") {
      const translation = t(key);
      // Return translation if valid, else return original key
      if (translation) {
        return translation;
      }
    }
    return fallbackT(key);
  } catch {
    return fallbackT(key);
  }
};
