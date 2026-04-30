import {
  type StreamFields,
  type YextFieldDefinition,
  type YextSchemaField,
} from "../types/entityFields.ts";

export type LinkedEntitySchema = {
  displayName: string;
  fields: YextSchemaField[];
};

export type LinkedEntitySchemas = Record<string, LinkedEntitySchema>;

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

export const buildLinkedEntityStreamFields = (
  linkedEntitySchemas?: LinkedEntitySchemas
): StreamFields | null => {
  if (!linkedEntitySchemas) {
    return null;
  }

  const fields: YextSchemaField[] = [];
  const displayNames: Record<string, string> = {};

  Object.entries(linkedEntitySchemas).forEach(
    ([referenceFieldName, linkedEntitySchema]) => {
      displayNames[referenceFieldName] = linkedEntitySchema.displayName;
      fields.push({
        name: referenceFieldName,
        definition: {
          name: referenceFieldName,
          type: {},
        },
        children: {
          fields: linkedEntitySchema.fields,
        },
        displayName: linkedEntitySchema.displayName,
      });

      populateLinkedEntityDisplayNames(
        displayNames,
        linkedEntitySchema.fields,
        referenceFieldName,
        linkedEntitySchema.displayName
      );
    }
  );

  return { fields, displayNames };
};

const populateLinkedEntityDisplayNames = (
  displayNames: Record<string, string>,
  fields: YextSchemaField[],
  parentFieldName: string,
  parentDisplayName: string
) => {
  fields.forEach((field) => {
    const fieldName = `${parentFieldName}.${field.name}`;
    const fieldDisplayName = field.displayName ?? field.name;
    displayNames[fieldName] = `${parentDisplayName} > ${fieldDisplayName}`;

    if (field.children?.fields?.length) {
      populateLinkedEntityDisplayNames(
        displayNames,
        field.children.fields,
        fieldName,
        displayNames[fieldName]
      );
    }
  });
};

export const isLinkedEntityFieldPath = (
  fieldPath: string | undefined,
  linkedEntitySchemas?: LinkedEntitySchemas
): boolean => {
  if (!fieldPath || !linkedEntitySchemas) {
    return false;
  }

  return Object.hasOwn(linkedEntitySchemas, fieldPath.split(".")[0]);
};
