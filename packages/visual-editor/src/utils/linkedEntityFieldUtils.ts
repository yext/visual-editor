import {
  type StreamFields,
  type YextFieldDefinition,
  type YextSchemaField,
} from "../types/entityFields.ts";

const isLinkedEntityDefinition = (
  definition: YextFieldDefinition | undefined
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
