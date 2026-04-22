import {
  StreamFields,
  YextSchemaField,
  type YextFieldDefinition,
} from "../types/entityFields.ts";

export type LinkedEntitySchema = {
  displayName: string;
  fields: YextSchemaField[];
};

/**
 * Maps each linked entity reference field API name to the schema of the
 * entity that reference points to.
 */
export type LinkedEntitySchemas = Record<string, LinkedEntitySchema>;

/**
 * Builds a synthetic {@link StreamFields} object from linked entity schemas so
 * the existing field filtering pipeline can treat linked entity fields the same
 * way as primary entity schema fields.
 */
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
        definition: createLinkedEntityRootDefinition(referenceFieldName),
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

/**
 * Returns true when the provided field path starts at a linked entity
 * reference field exposed by the linked entity schema payload.
 */
export const isLinkedEntityFieldPath = (
  fieldPath: string | undefined,
  linkedEntitySchemas?: LinkedEntitySchemas
): boolean => {
  if (!fieldPath || !linkedEntitySchemas) {
    return false;
  }

  const [referenceFieldName] = fieldPath.split(".");
  return Object.hasOwn(linkedEntitySchemas, referenceFieldName);
};

/**
 * Creates a minimal synthetic schema field for a linked entity reference root.
 * The root intentionally does not advertise a scalar type so only its children
 * are presented for normal single-value field selection.
 */
const createLinkedEntityRootDefinition = (
  referenceFieldName: string
): YextFieldDefinition => {
  return {
    name: referenceFieldName,
    type: {},
  };
};
