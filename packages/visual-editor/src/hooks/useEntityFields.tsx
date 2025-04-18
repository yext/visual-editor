import * as React from "react";
import {
  useReceiveMessage,
  TARGET_ORIGINS,
} from "../internal/hooks/useMessage.ts";
import { useState } from "react";
import { StreamFields, YextSchemaField } from "../types/entityFields.ts";

/**
 * Under the hood we receive a Stream for a template, but we expose
 * hooks with a more user-friendly name.
 */
export const usePlatformBridgeEntityFields = () => {
  const [entityFields, setEntityFields] = useState<StreamFields | null>(null);

  useReceiveMessage("getTemplateStream", TARGET_ORIGINS, (send, payload) => {
    setEntityFields({
      fields: payload.stream.schema.fields,
      displayNames: payload.apiNamesToDisplayNames,
    });
    send({
      status: "success",
      payload: { message: "templateStream received" },
    });
  });

  useReceiveMessage("getDevEntityFields", TARGET_ORIGINS, (send, payload) => {
    setEntityFields({ fields: assignDefinitions(payload) });
    send({
      status: "success",
      payload: { message: "getDevEntityFields received" },
    });
  });

  return entityFields;
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

const EntityFieldsContext = React.createContext<
  StreamFields | null | undefined
>(undefined);

const useEntityFields = () => {
  const context = React.useContext(EntityFieldsContext);
  // context === undefined means useEntityFields outside VisualEditorProvider
  // context === null means usePlatformBridgeEntityFields has not received a message yet
  if (context === undefined) {
    throw new Error("useEntityFields must be used within VisualEditorProvider");
  }

  return context;
};

export { useEntityFields, EntityFieldsContext };
