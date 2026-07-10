import React from "react";
import { useAnalytics } from "@yext/pages-components";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { TailwindConfig } from "./themeResolver.ts";
import { StreamFields } from "../types/entityFields.ts";
import { TailwindConfigContext } from "../hooks/useTailwindConfig.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import {
  i18nComponentsInstance,
  loadComponentTranslations,
} from "./i18n/components.ts";
import { normalizeLocalesInObject } from "./normalizeLocale.ts";
import { ErrorProvider } from "../contexts/ErrorContext.tsx";

type AllOrNothing<T extends Record<string, any>> =
  | T
  | Partial<Record<keyof T, never>>;

type UniversalProps<T> = {
  templateProps: T;
  children: React.ReactNode;
};

type EditorProps = {
  entityFields: StreamFields | null;
  tailwindConfig: TailwindConfig;
};

type VisualEditorProviderProps<T> = UniversalProps<T> &
  AllOrNothing<EditorProps>;

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

// Use layout effect in the browser so the analytics global exists before CustomCodeSection runs injected scripts
// Fall back during SSR to avoid useLayoutEffect warnings.
const useBrowserLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const VisualEditorProvider = <T extends Record<string, any>>({
  templateProps,
  entityFields,
  tailwindConfig,
  children,
}: VisualEditorProviderProps<T>) => {
  const pagesAnalytics = useAnalytics();
  // Use useMemo to prevent creating a new QueryClient on every render
  // QueryClient maintains internal caches, so creating new instances unnecessarily
  // could lead to memory accumulation
  const queryClient = React.useMemo(() => new QueryClient(), []);
  const normalizedTemplateProps = React.useMemo(
    () => normalizeLocalesInObject(templateProps),
    [templateProps]
  );

  if (normalizedTemplateProps?.document?.locale) {
    loadComponentTranslations(
      normalizedTemplateProps.document.locale,
      normalizedTemplateProps?.translations
    );
    i18nComponentsInstance.changeLanguage(
      normalizedTemplateProps.document.locale
    );
  }

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
      <I18nextProvider i18n={i18nComponentsInstance}>
        <QueryClientProvider client={queryClient}>
          <TemplatePropsContext.Provider value={normalizedTemplateProps}>
            <EntityFieldsContext.Provider value={entityFields}>
              <TailwindConfigContext.Provider value={tailwindConfig}>
                {children}
              </TailwindConfigContext.Provider>
            </EntityFieldsContext.Provider>
          </TemplatePropsContext.Provider>
        </QueryClientProvider>
      </I18nextProvider>
    </ErrorProvider>
  );
};

export { VisualEditorProvider };
