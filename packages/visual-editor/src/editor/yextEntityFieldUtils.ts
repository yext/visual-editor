import {
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";
import { StreamFields, YextSchemaField } from "../types/entityFields.ts";
import { resolveField } from "../utils/resolveYextEntityField.ts";
import { type StreamDocument } from "../utils/types/StreamDocument.ts";
import { getTopLevelLinkedEntitySourceFields } from "../utils/linkedEntityFieldUtils.ts";
import {
  getListSourceRootFields,
  type MappedSourceFieldFilter,
} from "../utils/cardSlots/mappedSource.ts";

/** Represents data that can either be from the Yext Knowledge Graph or statically defined */
export type YextEntityField<T> = {
  /** The api name of the Yext field */
  field: string;
  /** The static value of the field */
  constantValue: T;
  /** Whether to use the Yext field or the constant value */
  constantValueEnabled?: boolean;
  /** Whether the field can be translated or not. */
  disallowTranslation?: boolean;
};

/**
 * Merges duplicate schema fields by API name, preferring entries that include
 * display names or nested children.
 */
const dedupeFieldsByName = (fields: YextSchemaField[]): YextSchemaField[] => {
  const fieldsByName = new Map<string, YextSchemaField>();

  fields.forEach((field) => {
    const existingField = fieldsByName.get(field.name);
    if (
      !existingField ||
      (!!field.displayName && !existingField.displayName) ||
      (!!field.children?.fields?.length &&
        !existingField.children?.fields?.length)
    ) {
      fieldsByName.set(field.name, field);
    }
  });

  return Array.from(fieldsByName.values());
};

/**
 * Sorts fields by their display label so selector options render in a stable,
 * user-friendly order.
 */
const sortFields = (fields: YextSchemaField[]): YextSchemaField[] => {
  return fields.sort((entityFieldA, entityFieldB) => {
    const nameA = (entityFieldA.displayName ?? entityFieldA.name).toUpperCase();
    const nameB = (entityFieldB.displayName ?? entityFieldB.name).toUpperCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });
};

/**
 * Looks up the best known display name for a field path from the flattened
 * `ENTITY_FIELDS` display-name map, falling back to suffix paths when the
 * scoped path is not present directly.
 */
const getMappedDisplayName = (
  fieldPath: string,
  entityFields: StreamFields | null
): string | undefined => {
  const exactDisplayName = entityFields?.displayNames?.[fieldPath];
  if (exactDisplayName) {
    return exactDisplayName;
  }

  const fieldPathSegments = fieldPath.split(".");
  for (let index = 1; index < fieldPathSegments.length; index += 1) {
    const suffixPath = fieldPathSegments.slice(index).join(".");
    const suffixDisplayName = entityFields?.displayNames?.[suffixPath];
    if (suffixDisplayName) {
      return suffixDisplayName;
    }
  }

  return undefined;
};

/**
 * Builds the display label for a field path by walking the schema tree and
 * combining each segment's display name.
 */
export const getEntityFieldDisplayName = (
  fieldPath: string | undefined,
  entityFields: StreamFields | null
): string | undefined => {
  if (!fieldPath) {
    return undefined;
  }

  const fieldPathSegments = fieldPath.split(".");
  const displayNameSegments: string[] = [];
  let currentFields = entityFields?.fields ?? [];
  let currentPath = "";
  let currentDisplayName = "";

  for (const segment of fieldPathSegments) {
    currentPath = currentPath ? `${currentPath}.${segment}` : segment;
    const matchingField = currentFields.find((field) => field.name === segment);
    if (!matchingField) {
      return displayNameSegments.length
        ? displayNameSegments.join(" > ")
        : undefined;
    }

    const mappedDisplayName = getMappedDisplayName(currentPath, entityFields);
    const nextSegmentDisplayName = mappedDisplayName
      ? currentDisplayName &&
        mappedDisplayName.startsWith(`${currentDisplayName} > `)
        ? mappedDisplayName.slice(currentDisplayName.length + 3)
        : (mappedDisplayName.split(" > ").at(-1) ?? mappedDisplayName)
      : (matchingField.displayName?.split(" > ").at(-1) ?? matchingField.name);

    displayNameSegments.push(nextSegmentDisplayName);
    currentDisplayName = mappedDisplayName ?? displayNameSegments.join(" > ");
    currentFields = matchingField.children?.fields ?? [];
  }

  return displayNameSegments.join(" > ");
};

/**
 * Resolves the display label for a field that is stored relative to a scoped
 * source selection.
 *
 * 1. Rebuild the full field path from the scoped source and relative value.
 * 2. Resolve the exact full-path display name from `ENTITY_FIELDS` or schema.
 * 3. Trim the scoped source prefix so the rendered label matches the stored
 *    relative field value.
 */
export const getScopedEntityFieldDisplayName = (
  sourceField: string | undefined,
  relativeFieldPath: string | undefined,
  entityFields: StreamFields | null
): string | undefined => {
  if (!relativeFieldPath) {
    return undefined;
  }

  if (!sourceField) {
    return getEntityFieldDisplayName(relativeFieldPath, entityFields);
  }

  const fullFieldPath = `${sourceField}.${relativeFieldPath}`;
  const fullDisplayName = getEntityFieldDisplayName(
    fullFieldPath,
    entityFields
  );
  const rootDisplayName = getEntityFieldDisplayName(sourceField, entityFields);
  const rootPrefix = rootDisplayName ? `${rootDisplayName} > ` : undefined;

  if (!fullDisplayName) {
    return relativeFieldPath;
  }

  return rootPrefix && fullDisplayName.startsWith(rootPrefix)
    ? fullDisplayName.slice(rootPrefix.length)
    : fullDisplayName;
};

/**
 * Returns whether a resolved mapped-source root is compatible with linked-item
 * source selection: undefined, null, arrays, and object values are all valid.
 */
const isMappedListSourceValue = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  Array.isArray(value) ||
  (!!value && typeof value === "object");

const hasListSourceValueInDocument = (
  streamDocument: StreamDocument,
  fieldName: string
): boolean => {
  const resolvedValue = resolveField<unknown>(streamDocument, fieldName).value;
  return (
    resolvedValue === undefined ||
    resolvedValue === null ||
    Array.isArray(resolvedValue)
  );
};

/**
 * Resolves one schema field definition from a dotted field path.
 */
const getSchemaFieldAtPath = (
  entityFields: StreamFields | null,
  fieldPath: string
): YextSchemaField | undefined => {
  const fieldPathSegments = fieldPath.split(".");
  let currentFields = entityFields?.fields ?? [];
  let matchingField: YextSchemaField | undefined;

  for (const segment of fieldPathSegments) {
    matchingField = currentFields.find((field) => field.name === segment);
    if (!matchingField) {
      return undefined;
    }

    currentFields = matchingField.children?.fields ?? [];
  }

  return matchingField;
};

/**
 * Returns the nested schema subtree for one selected source field so descendant
 * pickers can operate relative to that item's shape.
 */
const getSubdocumentStreamFields = (
  entityFields: StreamFields | null,
  fieldPath: string
): StreamFields | null => {
  const schemaField = getSchemaFieldAtPath(entityFields, fieldPath);
  const fields = schemaField?.children?.fields;
  return fields?.length
    ? {
        fields,
        displayNames: entityFields?.displayNames,
      }
    : null;
};

/**
 * Returns whether a schema field represents a linked entity reference.
 */
const isLinkedEntityDefinition = (
  field: YextSchemaField | undefined
): boolean =>
  field?.definition.typeRegistryId === "type.entity_reference" ||
  field?.definition.type.documentType === "DOCUMENT_TYPE_ENTITY";

/**
 * Detects whether a scoped descendant path passes through another linked
 * entity reference, which would otherwise leak unrelated nested fields into the
 * current picker scope.
 */
const hasNestedLinkedEntityAncestor = (
  scopedStreamFields: StreamFields,
  relativeFieldPath: string
): boolean => {
  const pathSegments = relativeFieldPath.split(".");
  let currentFields = scopedStreamFields.fields;

  for (const segment of pathSegments.slice(0, -1)) {
    const matchingField = currentFields.find((field) => field.name === segment);
    if (!matchingField) {
      return false;
    }
    if (isLinkedEntityDefinition(matchingField)) {
      return true;
    }
    currentFields = matchingField.children?.fields ?? [];
  }

  return false;
};

/**
 * Returns selector fields relative to a selected source item, removing nested
 * linked-entity descendants and trimming the repeated root label from each
 * option.
 */
const getScopedFieldsForSelector = (
  entityFields: StreamFields | null,
  sourceField: string,
  filter: RenderEntityFieldFilter<any>
): YextSchemaField[] => {
  const scopedStreamFields = getSubdocumentStreamFields(
    entityFields,
    sourceField
  );
  if (!scopedStreamFields) {
    return [];
  }

  const rootDisplayName = getEntityFieldDisplayName(sourceField, entityFields);
  const rootPrefix = rootDisplayName ? `${rootDisplayName} > ` : undefined;

  return sortFields(
    dedupeFieldsByName(
      getFilteredEntityFields(scopedStreamFields, filter)
        .filter(
          (field) =>
            !hasNestedLinkedEntityAncestor(scopedStreamFields, field.name)
        )
        .map((field) => {
          const displayName =
            getEntityFieldDisplayName(
              `${sourceField}.${field.name}`,
              entityFields
            ) ??
            field.displayName ??
            field.name;

          return {
            ...field,
            displayName:
              rootPrefix && displayName.startsWith(rootPrefix)
                ? displayName.slice(rootPrefix.length)
                : displayName,
          };
        })
    )
  );
};

/**
 * Returns the schema fields that should appear in an entity field selector.
 *
 * 1. Scope to a selected source item when `sourceField` is provided.
 * 2. For item-source and mapped-source pickers, restrict roots to fields that
 *    can satisfy the required descendant type sets. `itemSourceTypes` takes
 *    precedence over `mappedSourceTypes` when both are present.
 * 3. Filter incompatible resolved values out when a stream document is
 *    available.
 * 4. Fall back to normal entity-field filtering for standard field selectors.
 */
export const getFieldsForSelector = (
  entityFields: StreamFields | null,
  filter: MappedSourceFieldFilter<any>,
  streamDocument?: StreamDocument,
  sourceField?: string
): YextSchemaField[] => {
  if (sourceField) {
    return getScopedFieldsForSelector(entityFields, sourceField, filter);
  }

  const requiredDescendantTypes =
    filter.itemSourceTypes ?? filter.mappedSourceTypes;

  const hasRequiredDescendants = (field: YextSchemaField): boolean => {
    if (!requiredDescendantTypes?.length) {
      return true;
    }

    const availableFields = getFilteredEntityFields(
      { fields: [field], displayNames: entityFields?.displayNames },
      {
        descendantsOf: field.name,
      }
    );

    return requiredDescendantTypes.every((requiredTypes) => {
      const matchingFieldIndex = availableFields.findIndex(
        (availableField) =>
          getFilteredEntityFields(
            { fields: [availableField] },
            {
              allowList: [availableField.name],
              types: requiredTypes,
            }
          ).length > 0
      );

      if (matchingFieldIndex < 0) {
        return false;
      }

      availableFields.splice(matchingFieldIndex, 1);
      return true;
    });
  };

  if (filter.itemSourceTypes?.length) {
    return sortFields(
      dedupeFieldsByName(
        getListSourceRootFields(entityFields)
          .map((field) => ({
            ...field,
            displayName:
              getEntityFieldDisplayName(field.name, entityFields) ??
              field.displayName ??
              field.name,
          }))
          .filter(hasRequiredDescendants)
          .filter((field) =>
            !streamDocument
              ? true
              : hasListSourceValueInDocument(streamDocument, field.name)
          )
      )
    );
  }

  if (filter.mappedSourceTypes?.length) {
    const validLinkedEntityRootFields = getTopLevelLinkedEntitySourceFields(
      entityFields
    )
      .map((field) => ({
        ...field,
        displayName:
          getEntityFieldDisplayName(field.name, entityFields) ??
          field.displayName ??
          field.name,
      }))
      .filter(hasRequiredDescendants)
      .filter((field) =>
        !streamDocument
          ? true
          : isMappedListSourceValue(
              resolveField<unknown>(streamDocument, field.name).value
            )
      );
    const validListRootFields = getListSourceRootFields(entityFields)
      .map((field) => ({
        ...field,
        displayName:
          getEntityFieldDisplayName(field.name, entityFields) ??
          field.displayName ??
          field.name,
      }))
      .filter(hasRequiredDescendants)
      .filter((field) =>
        !streamDocument
          ? true
          : hasListSourceValueInDocument(streamDocument, field.name)
      );

    return sortFields(
      dedupeFieldsByName([
        ...validLinkedEntityRootFields,
        ...validListRootFields,
      ])
    );
  }

  let filteredEntityFields = getFilteredEntityFields(entityFields, filter);

  if (filter.directChildrenOf && filteredEntityFields.length === 0) {
    filteredEntityFields = getFilteredEntityFields(entityFields, {
      allowList: [filter.directChildrenOf],
      types: filter.types,
      includeListsOnly: true,
    } satisfies RenderEntityFieldFilter<any>);
  }

  return sortFields(
    dedupeFieldsByName(
      filteredEntityFields.map((field) => ({
        ...field,
        displayName:
          getEntityFieldDisplayName(field.name, entityFields) ??
          field.displayName ??
          field.name,
      }))
    )
  );
};
