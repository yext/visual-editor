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
 * Receives entity field metadata from the platform bridge and exposes it as a
 * normalized `StreamFields` value for the editor.
 *
 * 1. Listen for the full template stream payload in platform editing mode.
 * 2. Listen for the lightweight development payload used outside platform.
 * 3. Normalize nested field display names into one shared `displayNames` map.
 * 4. Store the latest field tree for consumers such as entity pickers and
 *    linked item-source editors.
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

/**
 * Normalizes the raw platform field tree into the `StreamFields` shape used
 * throughout the editor, preserving nested display names by full field path.
 */
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

/**
 * Walks one schema field and its descendants, copying inherited display names
 * into both the field objects and the flattened `displayNames` lookup.
 */
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

/**
 * Adapts the development-only entity field payload into the schema shape used
 * by the rest of the Visual Editor field-filtering pipeline.
 */
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

/**
 * Returns the current template's entity field metadata from
 * `VisualEditorProvider`.
 */
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
