import * as React from "react";
import {
  useReceiveMessage,
  TARGET_ORIGINS,
} from "../internal/hooks/useMessage.ts";
import { StreamFields, YextSchemaField } from "../types/entityFields.ts";
import { isDeepEqual } from "../utils/deepEqual.ts";
import { DevLogger } from "../utils/devLogger.ts";

const devLogger = new DevLogger();

/**
 * Under the hood we receive a Stream for a template, but we expose
 * hooks with a more user-friendly name.
 */
export const usePlatformBridgeEntityFields = () => {
  const [entityFields, setEntityFields] = React.useState<StreamFields | null>(
    null
  );

  useReceiveMessage("getTemplateStream", TARGET_ORIGINS, (send, payload) => {
    const receivedValues = normalizeStreamFields(
      payload.stream.schema.fields,
      payload.apiNamesToDisplayNames
    );

    devLogger.logData("ENTITY_FIELDS", receivedValues);

    if (!isDeepEqual(receivedValues, entityFields)) {
      setEntityFields(receivedValues);
    }

    send({
      status: "success",
      payload: { message: "templateStream received" },
    });
  });

  useReceiveMessage("getDevEntityFields", TARGET_ORIGINS, (send, payload) => {
    const receivedValues = normalizeStreamFields(assignDefinitions(payload));
    devLogger.logData("ENTITY_FIELDS", receivedValues);
    setEntityFields(receivedValues);
    send({
      status: "success",
      payload: { message: "getDevEntityFields received" },
    });
  });

  return entityFields;
};

const normalizeStreamFields = (
  fields: YextSchemaField[],
  displayNames: Record<string, string> = {}
): StreamFields => {
  const normalizedDisplayNames = { ...displayNames };
  const normalizedFields = fields.map((field) =>
    normalizeField(field, normalizedDisplayNames)
  );

  return {
    fields: normalizedFields,
    displayNames: normalizedDisplayNames,
  };
};

const normalizeField = (
  field: YextSchemaField,
  displayNames: Record<string, string>,
  parentFieldName?: string
): YextSchemaField => {
  const fieldName = parentFieldName
    ? `${parentFieldName}.${field.name}`
    : field.name;
  const displayName = displayNames[fieldName] ?? field.displayName;

  if (displayName) {
    displayNames[fieldName] = displayName;
  }

  return {
    ...field,
    ...(displayName ? { displayName } : {}),
    children: field.children?.fields
      ? {
          fields: field.children.fields.map((childField) =>
            normalizeField(childField, displayNames, fieldName)
          ),
        }
      : field.children,
  };
};

const assignDefinitions = (entityFields: any): YextSchemaField[] => {
  return entityFields.map((field: any) => {
    return {
      name: field.name,
      displayName: field.displayName,
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
