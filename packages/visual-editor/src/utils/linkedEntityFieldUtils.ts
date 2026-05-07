import {
  type StreamFields,
  type YextSchemaField,
  type YextSchemaFieldDefinition,
} from "../types/entityFields.ts";

export const isLinkedEntityDefinition = (
  definition: YextSchemaFieldDefinition | undefined
): boolean =>
  definition?.typeRegistryId === "type.entity_reference" ||
  definition?.type?.documentType === "DOCUMENT_TYPE_ENTITY";

export const getTopLevelLinkedEntitySourceFields = (
  entityFields: StreamFields | null
): YextSchemaField[] =>
  (entityFields?.fields ?? []).filter((field) =>
    isLinkedEntityDefinition(field.definition)
  );

export const isTopLevelLinkedEntityField = (
  fieldPath: string | undefined,
  entityFields: StreamFields | null
): boolean => {
  if (!fieldPath || fieldPath.includes(".")) {
    return false;
  }

  return getTopLevelLinkedEntitySourceFields(entityFields).some(
    (field) => field.name === fieldPath
  );
};

export const isLinkedEntityFieldPath = (
  fieldPath: string | undefined,
  entityFields: StreamFields | null
): boolean => {
  if (!fieldPath) {
    return false;
  }

  return isTopLevelLinkedEntityField(fieldPath.split(".")[0], entityFields);
};
