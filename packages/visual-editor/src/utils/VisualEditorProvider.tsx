import React from "react";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { TailwindConfig } from "./themeResolver.ts";
import { YextSchemaField } from "../types/entityFields.ts";
import { TailwindConfigContext } from "../hooks/useTailwindConfig.tsx";

type AllOrNothing<T extends Record<string, any>> =
  | T
  | Partial<Record<keyof T, never>>;

type UniversalProps<T> = {
  templateProps: T;
  children: React.ReactNode;
};

type EditorProps = {
  entityFields: YextSchemaField[] | null;
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
  return (
    <TemplatePropsContext.Provider value={templateProps}>
      <EntityFieldsContext.Provider value={entityFields}>
        <TailwindConfigContext.Provider value={tailwindConfig}>
          {children}
        </TailwindConfigContext.Provider>
      </EntityFieldsContext.Provider>
    </TemplatePropsContext.Provider>
  );
};

export { VisualEditorProvider };
