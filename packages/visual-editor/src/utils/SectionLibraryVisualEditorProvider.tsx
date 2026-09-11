import React from "react";
import type { StreamFields } from "../types/entityFields.ts";
import {
  loadCombinedPageTranslations,
  loadCombinedPlatformTranslations,
} from "./i18n/loadCombinedTranslations.ts";
import {
  normalizeTranslationLocale,
  type SectionLibraryTranslationLoaders,
} from "./i18n/translationResources.ts";
import { useVisualEditorTranslations } from "./i18n/useVisualEditorTranslations.ts";
import type { TailwindConfig } from "./themeResolver.ts";
import { VisualEditorProviderCore } from "./VisualEditorProviderCore.tsx";

type SectionLibraryVisualEditorProviderProps<T> = {
  templateProps: T;
  translationLoaders?: SectionLibraryTranslationLoaders;
  entityFields?: StreamFields | null;
  tailwindConfig?: TailwindConfig;
  children: React.ReactNode;
};

const EMPTY_TRANSLATION_LOADERS: SectionLibraryTranslationLoaders = {
  platform: {},
  page: {},
};

export const SectionLibraryVisualEditorProvider = <
  T extends Record<string, any>,
>({
  templateProps,
  translationLoaders = EMPTY_TRANSLATION_LOADERS,
  entityFields,
  tailwindConfig,
  children,
}: SectionLibraryVisualEditorProviderProps<T>) => {
  const locale = templateProps?.document?.locale as string | undefined;
  const pageLoader = locale
    ? translationLoaders.page[normalizeTranslationLocale(locale)]
    : undefined;
  const translationRuntime = React.useMemo(
    () => ({
      loadPlatformTranslations: (nextLocale: string) =>
        loadCombinedPlatformTranslations(
          nextLocale,
          translationLoaders.platform
        ),
      loadPageTranslations: (nextLocale: string) =>
        loadCombinedPageTranslations(nextLocale, translationLoaders.page),
    }),
    [translationLoaders]
  );
  const { normalizedTemplateProps, translationsAreReady } =
    useVisualEditorTranslations({
      templateProps,
      translationRuntime,
      pageLoader,
      waitForTranslations: true,
    });

  return (
    <VisualEditorProviderCore
      templateProps={normalizedTemplateProps}
      entityFields={entityFields}
      tailwindConfig={tailwindConfig}
      translationRuntime={translationRuntime}
      renderChildren={translationsAreReady}
    >
      {children}
    </VisualEditorProviderCore>
  );
};
