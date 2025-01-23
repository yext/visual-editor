import React from "react";
import { DocumentContext } from "../hooks/useDocument.tsx";
import { EntityFieldsContext } from "../hooks/useEntityFields.tsx";
import { TailwindConfig } from "./themeResolver.ts";
import { YextSchemaField } from "../types/entityFields.ts";
import { TailwindConfigContext } from "../hooks/useTailwindConfig.tsx";

type AllOrNothing<T extends Record<string, any>> =
  | T
  | Partial<Record<keyof T, never>>;

type UniversalProps<T> = {
  document: T;
  children: React.ReactNode;
};

type EditorProps = {
  entityFields: YextSchemaField[];
  tailwindConfig: TailwindConfig;
};

type VisualEditorProviderProps<T> = UniversalProps<T> &
  AllOrNothing<EditorProps>;

const VisualEditorProvider = <T,>({
  document,
  entityFields,
  tailwindConfig,
  children,
}: VisualEditorProviderProps<T>) => {
  return (
    <DocumentContext.Provider value={document}>
      <EntityFieldsContext.Provider value={entityFields}>
        <TailwindConfigContext.Provider value={tailwindConfig}>
          {children}
        </TailwindConfigContext.Provider>
      </EntityFieldsContext.Provider>
    </DocumentContext.Provider>
  );
};

export { VisualEditorProvider };
