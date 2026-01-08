import i18next from "i18next";
import { initReactI18next } from "react-i18next";

const NAMESPACE = "visual-editor";

export const i18nComponentsInstance = i18next.createInstance();

i18nComponentsInstance.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  ns: [NAMESPACE],
  defaultNS: NAMESPACE,
  interpolation: { escapeValue: false },
  partialBundledLanguages: true,
  resources: {},
});

export interface TemplateProps {
  document?: {
    locale?: string;
  };
  translations?: Record<string, string> | Record<string, any>;
  [key: string]: any;
}

/**
 * Dynamically adds translations to the templateProps object. To be used
 * by consumers of visual-editor in transformProps of a template.
 */
export const injectTranslations = async (
  templateProps: TemplateProps
): Promise<TemplateProps> => {
  if (!templateProps?.document?.locale) {
    return templateProps;
  }

  const translations =
    (await getTranslations(templateProps?.document?.locale)) || {};

  return {
    ...templateProps,
    translations,
  };
};

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
      `../../../locales/components/${locale}/visual-editor.json`
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
 * Loads translations into the i18n instance for the given locale. If
 * translations are provided they will be used directly, otherwise they
 * will be dynamically imported.
 */
export const loadComponentTranslations = async (
  locale: string,
  translations?: Record<string, string>
) => {
  if (i18nComponentsInstance.hasResourceBundle(locale, NAMESPACE)) {
    return;
  }

  const translationsToInject = translations || (await getTranslations(locale));

  if (translationsToInject && Object.keys(translationsToInject).length > 0) {
    i18nComponentsInstance.addResourceBundle(
      locale,
      NAMESPACE,
      translationsToInject
    );
  }
};
