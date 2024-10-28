import * as React from "react";
import {
  useReceiveMessage,
  TARGET_ORIGINS,
} from "../internal/hooks/useMessage.ts";
import { useState } from "react";
import { YextSchemaField } from "../internal/types/entityFields.ts";

/**
 * Under the hood we receive a Stream for a template, but we expose
 * hooks with a more user-friendly name.
 */
export const usePlatformBridgeEntityFields = () => {
  const [entityFields, setEntityFields] = useState<any>(undefined);

  useReceiveMessage("getTemplateStream", TARGET_ORIGINS, (send, payload) => {
    setEntityFields(payload.stream.schema.fields);
    send({
      status: "success",
      payload: { message: "templateStream received" },
    });
  });

  useReceiveMessage("getDevEntityFields", TARGET_ORIGINS, (send, payload) => {
    setEntityFields(assignDefinitions(payload));
    send({
      status: "success",
      payload: { message: "getDevEntityFields received" },
    });
  });

  return entityFields as YextSchemaField[];
};

const assignDefinitions = (entityFields: any): YextSchemaField[] => {
  return entityFields.map((field: any) => {
    return {
      name: field.name,
      definition: {
        name: field.name,
        typeName: field.typeName,
        type: field.type,
        registryId: field.registryId,
        typeRegistryId: field.typeRegistryId,
        isList: field.isList,
      },
      children: field.children
        ? { fields: assignDefinitions(field.children) }
        : {},
    };
  });
};

const EntityFieldsContext = React.createContext<YextSchemaField[] | undefined>(
  undefined
);

type EntityFieldsProviderProps = {
  entityFields: YextSchemaField[];
  children: React.ReactNode;
};

export const EntityFieldsProvider = ({
  entityFields,
  children,
}: EntityFieldsProviderProps) => {
  return (
    <EntityFieldsContext.Provider value={entityFields}>
      {children}
    </EntityFieldsContext.Provider>
  );
};

export const useEntityFields = () => {
  const context = React.useContext(EntityFieldsContext);
  if (!context) {
    throw new Error("useEntityFields must be used within a DocumentProvider");
  }

  return context;
};
