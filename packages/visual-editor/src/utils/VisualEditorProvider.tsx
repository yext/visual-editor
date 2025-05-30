import React from "react";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { TailwindConfig } from "./themeResolver.ts";
import { StreamFields } from "../types/entityFields.ts";
import { TailwindConfigContext } from "../hooks/useTailwindConfig.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { i18n as I18nType } from "i18next";
import { I18nextProvider } from "react-i18next";
import { initI18n } from "./i18n.ts";

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

const VisualEditorProvider = <T,>({
  templateProps,
  entityFields,
  tailwindConfig,
  children,
}: VisualEditorProviderProps<T>) => {
  const queryClient = new QueryClient();
  const [i18nInstance, setI18nInstance] = React.useState<I18nType | null>(null);
  React.useEffect(() => {
    initI18n().then((i18n) => setI18nInstance(i18n));
  }, []);

  if (!i18nInstance) {
    return <div>Loading translations...</div>;
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
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
