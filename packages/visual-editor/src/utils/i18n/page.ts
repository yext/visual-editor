import { getTranslations } from "./getTranslations.ts";
import { StreamDocument } from "../types/StreamDocument.ts";
import { normalizeLocalesInObject } from "../normalizeLocale.ts";
import type { TranslationDictionary } from "./translationResources.ts";
import { i18nPageInstance, VISUAL_EDITOR_NAMESPACE } from "./i18nInstances.ts";

export { i18nPageInstance } from "./i18nInstances.ts";

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
): Promise<TranslationDictionary> => {
  if (!streamDocument?.locale) {
    return {};
  }

  return (
    (await getTranslations(
      normalizeLocalesInObject(streamDocument).locale,
      "page"
    )) || {}
  );
};

/**
 * Loads Visual Editor translations into the i18n instance for the given locale. If
 * translations are provided they will be used directly, otherwise they
 * will be dynamically imported.
 */
export const loadVEPageTranslations = async (
  locale: string,
  translations?: TranslationDictionary
) => {
  if (
    i18nPageInstance.hasResourceBundle(locale, VISUAL_EDITOR_NAMESPACE) &&
    !translations
  ) {
    return;
  }

  const translationsToInject =
    translations || (await getTranslations(locale, "page"));

  if (translationsToInject && Object.keys(translationsToInject).length > 0) {
    i18nPageInstance.addResourceBundle(
      locale,
      VISUAL_EDITOR_NAMESPACE,
      translationsToInject,
      true,
      true
    );
  }
};
