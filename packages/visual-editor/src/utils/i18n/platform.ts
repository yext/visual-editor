import i18next, { TOptions } from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { applyI18nFallbacks, defaultI18nFallbacks } from "./fallbacks.ts";

const NAMESPACE = "visual-editor";

export const i18nPlatformInstance = i18next.createInstance();

i18nPlatformInstance.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  ns: [NAMESPACE],
  defaultNS: NAMESPACE,
  interpolation: { escapeValue: false },
  nsSeparator: false,
  resources: {},
});

/**
 * Dynamically imports the translation file for the given locale.
 */
const getTranslations = async (
  locale: string,
  isRetry = false
): Promise<Record<string, string>> => {
  if (!locale) {
    return {};
  }

  try {
    const module = await import(
      `../../../locales/platform/${locale}/visual-editor.json`
    );
    return module.default;
  } catch (e) {
    if (isRetry || locale === "en") {
      console.error(
        "Error loading translations for locale",
        locale,
        e,
        "No fallback available."
      );
      return {};
    }
    console.error(
      "Error loading translations for locale",
      locale,
      e,
      "Falling back to en."
    );
    return getTranslations("en", true);
  }
};

/**
 * Loads translations into the i18n instance for the given locale.
 */
export const loadPlatformTranslations = async (locale: string) => {
  if (i18nPlatformInstance.hasResourceBundle(locale, NAMESPACE)) {
    return;
  }

  let strippedLocale = locale;
  if (strippedLocale !== "en-GB" && strippedLocale !== "zh-TW") {
    strippedLocale = strippedLocale.split("-")[0];
  }

  const translationsToInject = await getTranslations(strippedLocale);
  applyI18nFallbacks(translationsToInject, defaultI18nFallbacks);

  if (translationsToInject && Object.keys(translationsToInject).length > 0) {
    i18nPlatformInstance.addResourceBundle(
      strippedLocale,
      NAMESPACE,
      translationsToInject
    );
  }
};

export const usePlatformTranslation = () => {
  return useTranslation(NAMESPACE, { i18n: i18nPlatformInstance });
};

export type MsgString = string & { __brand: "i18nPlatform" };

/**
 * msg marks strings for translation in config JSON such
 * as Puck fields or the theme config. The TOptions are
 * stringified in the config and dynamically replaced
 * upon render.
 */
export const msg = (
  key: string,
  defaultValue: string,
  options?: TOptions
): MsgString => {
  return JSON.stringify({ key, defaultValue, options }) as MsgString;
};

/**
 * pt translates strings based on the platform i18n. It can
 * operate as a normal TFunction or handle configurations that
 * have been stringified by msg.
 */
export const pt = (
  keyOrEncodedValue: string | MsgString,
  optionsOrDefault?: string | TOptions,
  options?: TOptions
): string => {
  const t = i18nPlatformInstance.t;

  if (!Array.isArray(keyOrEncodedValue)) {
    try {
      const translationOptions = JSON.parse(keyOrEncodedValue);
      return t(translationOptions.key, translationOptions.defaultValue, {
        ...translationOptions.options,
        returnObjects: false,
      }) as string;
    } catch {
      // continue
    }
  }

  if (
    keyOrEncodedValue &&
    optionsOrDefault &&
    options &&
    typeof optionsOrDefault === "string"
  ) {
    return t(keyOrEncodedValue, optionsOrDefault, options);
  } else if (
    keyOrEncodedValue &&
    optionsOrDefault &&
    typeof optionsOrDefault === "string"
  ) {
    return t(keyOrEncodedValue, optionsOrDefault);
  } else if (
    keyOrEncodedValue &&
    optionsOrDefault &&
    typeof optionsOrDefault === "object"
  ) {
    return t(keyOrEncodedValue, optionsOrDefault);
  } else {
    return t(keyOrEncodedValue);
  }
};
