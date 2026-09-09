import React from "react";
import { useAnalytics } from "@yext/pages-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { ErrorProvider } from "../contexts/ErrorContext.tsx";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { TailwindConfigContext } from "../hooks/useTailwindConfig.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import type { StreamFields } from "../types/entityFields.ts";
import { i18nPageInstance } from "./i18n/i18nInstances.ts";
import type { TailwindConfig } from "./themeResolver.ts";
import {
  TranslationRuntimeContext,
  type TranslationRuntimeContextValue,
} from "./i18n/TranslationRuntimeContext.tsx";

type AnalyticsTrackProps = Parameters<
  NonNullable<ReturnType<typeof useAnalytics>>["track"]
>[0];

type YextCustomCodeAnalytics = {
  track: (request: AnalyticsTrackProps) => void;
};

declare global {
  interface Window {
    YextCustomCodeAnalytics?: YextCustomCodeAnalytics;
  }
}

const useBrowserLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

type VisualEditorProviderCoreProps<T> = {
  templateProps: T;
  entityFields?: StreamFields | null;
  tailwindConfig?: TailwindConfig;
  translationRuntime: TranslationRuntimeContextValue;
  renderChildren: boolean;
  children: React.ReactNode;
};

// Keep the shared provider scaffolding translation-agnostic so the Section
// Library provider can reuse it without importing VisualEditorProvider's
// built-in translation loaders.
export const VisualEditorProviderCore = <T extends Record<string, any>>({
  templateProps,
  entityFields,
  tailwindConfig,
  translationRuntime,
  renderChildren,
  children,
}: VisualEditorProviderCoreProps<T>) => {
  const pagesAnalytics = useAnalytics();
  const queryClient = React.useMemo(() => new QueryClient(), []);

  useBrowserLayoutEffect(() => {
    window.YextCustomCodeAnalytics = {
      track: (request) => {
        pagesAnalytics?.track(request);
      },
    };
    return () => {
      delete window.YextCustomCodeAnalytics;
    };
  }, [pagesAnalytics]);

  return (
    <ErrorProvider>
      <I18nextProvider i18n={i18nPageInstance}>
        <QueryClientProvider client={queryClient}>
          <TemplatePropsContext.Provider value={templateProps}>
            <EntityFieldsContext.Provider value={entityFields}>
              <TailwindConfigContext.Provider value={tailwindConfig}>
                <TranslationRuntimeContext.Provider value={translationRuntime}>
                  {renderChildren ? children : null}
                </TranslationRuntimeContext.Provider>
              </TailwindConfigContext.Provider>
            </EntityFieldsContext.Provider>
          </TemplatePropsContext.Provider>
        </QueryClientProvider>
      </I18nextProvider>
    </ErrorProvider>
  );
};
