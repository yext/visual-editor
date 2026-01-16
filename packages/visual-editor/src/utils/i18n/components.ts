import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { getTranslations } from "./getTranslations";

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

  console.log(
    "getting translations for locale",
    templateProps?.document?.locale
  );
  const translations =
    (await getTranslations(templateProps?.document?.locale, "components")) ||
    {};

  return {
    ...templateProps,
    translations,
  };
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
  console.log("loading translations for locale", locale);
  if (i18nComponentsInstance.hasResourceBundle(locale, NAMESPACE)) {
    return;
  }

  const translationsToInject =
    translations || (await getTranslations(locale, "components"));

  if (translationsToInject && Object.keys(translationsToInject).length > 0) {
    i18nComponentsInstance.addResourceBundle(
      locale,
      NAMESPACE,
      translationsToInject
    );
  }
};
