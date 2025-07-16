import React from "react";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { TailwindConfig } from "./themeResolver.ts";
import { StreamFields } from "../types/entityFields.ts";
import { TailwindConfigContext } from "../hooks/useTailwindConfig.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { i18nComponentsInstance } from "./i18nComponents.ts";
import { normalizeLocalesInObject } from "./normalizeLocale.ts";

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

const VisualEditorProvider = <T extends Record<string, any>>({
  templateProps,
  entityFields,
  tailwindConfig,
  children,
}: VisualEditorProviderProps<T>) => {
  const queryClient = new QueryClient();
  templateProps = normalizeLocalesInObject(templateProps);

  if (templateProps?.document?.locale) {
    i18nComponentsInstance.changeLanguage(templateProps.document.locale);
  }

  return (
    <I18nextProvider i18n={i18nComponentsInstance}>
      <QueryClientProvider client={queryClient}>
        <TemplatePropsContext.Provider value={templateProps}>
          <EntityFieldsContext.Provider value={entityFields}>
            <TailwindConfigContext.Provider value={tailwindConfig}>
              {children}
            </TailwindConfigContext.Provider>
          </EntityFieldsContext.Provider>
        </TemplatePropsContext.Provider>
      </QueryClientProvider>
    </I18nextProvider>
  );
};

export { VisualEditorProvider };
