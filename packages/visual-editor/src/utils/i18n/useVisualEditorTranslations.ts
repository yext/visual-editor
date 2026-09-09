import React from "react";
import { normalizeLocalesInObject } from "../normalizeLocale.ts";
import { i18nPageInstance, VISUAL_EDITOR_NAMESPACE } from "./i18nInstances.ts";
import type { TranslationRuntimeContextValue } from "./TranslationRuntimeContext.tsx";
import type {
  TranslationDictionary,
  TranslationLoader,
} from "./translationResources.ts";

type UseVisualEditorTranslationsOptions<T> = {
  templateProps: T;
  translationRuntime: TranslationRuntimeContextValue;
  pageLoader?: TranslationLoader;
  waitForTranslations?: boolean;
};

export const useVisualEditorTranslations = <T extends Record<string, any>>({
  templateProps,
  translationRuntime,
  pageLoader,
  waitForTranslations = false,
}: UseVisualEditorTranslationsOptions<T>) => {
  const normalizedTemplateProps = React.useMemo(
    () => normalizeLocalesInObject(templateProps),
    [templateProps]
  );
  const locale = normalizedTemplateProps?.document?.locale as
    | string
    | undefined;
  const translations = normalizedTemplateProps?.translations as
    | TranslationDictionary
    | undefined;
  const [loadedResource, setLoadedResource] = React.useState<{
    locale: string;
    loader?: TranslationLoader;
  }>();

  if (locale && translations) {
    i18nPageInstance.addResourceBundle(
      locale,
      VISUAL_EDITOR_NAMESPACE,
      translations,
      true,
      true
    );
    void i18nPageInstance.changeLanguage(locale);
  }

  React.useEffect(() => {
    if (!locale || translations) {
      return;
    }
    let isCurrent = true;
    void translationRuntime.loadPageTranslations(locale).then(async () => {
      if (!isCurrent) {
        return;
      }
      await i18nPageInstance.changeLanguage(locale);
      if (isCurrent && waitForTranslations) {
        setLoadedResource({ locale, loader: pageLoader });
      }
    });
    return () => {
      isCurrent = false;
    };
  }, [
    pageLoader,
    locale,
    translationRuntime,
    translations,
    waitForTranslations,
  ]);

  const translationsAreReady =
    !waitForTranslations ||
    !locale ||
    !!translations ||
    (loadedResource?.locale === locale && loadedResource.loader === pageLoader);

  return {
    normalizedTemplateProps,
    translationsAreReady,
  };
};
