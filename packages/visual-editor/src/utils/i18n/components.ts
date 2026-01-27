import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { getTranslations } from "./getTranslations";
import { StreamDocument } from "../types/StreamDocument";
import { normalizeLocalesInObject } from "../normalizeLocale";

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
  streamDocument: StreamDocument
): Promise<Record<string, string> | Record<string, any>> => {
  if (!streamDocument?.locale) {
    return {};
  }

  return (
    (await getTranslations(
      normalizeLocalesInObject(streamDocument).locale,
      "components"
    )) || {}
  );
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
