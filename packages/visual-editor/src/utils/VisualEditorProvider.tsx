import React from "react";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { TailwindConfig } from "./themeResolver.ts";
import { StreamFields } from "../types/entityFields.ts";
import { TailwindConfigContext } from "../hooks/useTailwindConfig.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

  return (
    <QueryClientProvider client={queryClient}>
      <TemplatePropsContext.Provider value={templateProps}>
        <EntityFieldsContext.Provider value={entityFields}>
          <TailwindConfigContext.Provider value={tailwindConfig}>
            {children}
          </TailwindConfigContext.Provider>
        </EntityFieldsContext.Provider>
      </TemplatePropsContext.Provider>
    </QueryClientProvider>
  );
};

export { VisualEditorProvider };
