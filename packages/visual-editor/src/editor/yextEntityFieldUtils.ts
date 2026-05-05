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

const sortFields = (fields: YextSchemaField[]): YextSchemaField[] => {
  return fields.sort((entityFieldA, entityFieldB) => {
    const nameA = (entityFieldA.displayName ?? entityFieldA.name).toUpperCase();
    const nameB = (entityFieldB.displayName ?? entityFieldB.name).toUpperCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });
};

export const getEntityFieldDisplayName = (
  fieldPath: string | undefined,
  entityFields: StreamFields | null
): string | undefined => {
  if (!fieldPath) {
    return undefined;
  }

  const displayNameFromMap = entityFields?.displayNames?.[fieldPath];
  if (displayNameFromMap) {
    return displayNameFromMap;
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

    const mappedDisplayName = entityFields?.displayNames?.[currentPath];
    const nextSegmentDisplayName = mappedDisplayName
      ? currentDisplayName &&
        mappedDisplayName.startsWith(`${currentDisplayName} > `)
        ? mappedDisplayName.slice(currentDisplayName.length + 3)
        : (mappedDisplayName.split(" > ").at(-1) ?? mappedDisplayName)
      : (matchingField.displayName ?? matchingField.name);

    displayNameSegments.push(nextSegmentDisplayName);
    currentDisplayName = mappedDisplayName ?? displayNameSegments.join(" > ");
    currentFields = matchingField.children?.fields ?? [];
  }

  return displayNameSegments.join(" > ");
};

const isMappedListSourceValue = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  Array.isArray(value) ||
  (!!value && typeof value === "object");

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

const isLinkedEntityDefinition = (
  field: YextSchemaField | undefined
): boolean =>
  field?.definition.typeRegistryId === "type.entity_reference" ||
  field?.definition.type.documentType === "DOCUMENT_TYPE_ENTITY";

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

const getScopedFieldsForSelector = (
  entityFields: StreamFields | null,
  sourceField: string,
  filter: RenderEntityFieldFilter<any>,
  streamDocument?: StreamDocument
): YextSchemaField[] => {
  const scopedStreamFields = getSubdocumentStreamFields(
    entityFields,
    sourceField
  );
  if (!scopedStreamFields) {
    return [];
  }

  const resolvedDescendantFieldPaths = getResolvedDescendantFieldPaths(
    streamDocument,
    sourceField,
    true
  );
  const rootDisplayName = getEntityFieldDisplayName(sourceField, entityFields);
  const rootPrefix = rootDisplayName ? `${rootDisplayName} > ` : undefined;

  return sortFields(
    dedupeFieldsByName(
      (resolvedDescendantFieldPaths
        ? getFilteredEntityFields(scopedStreamFields, filter).filter(
            (field) =>
              !hasNestedLinkedEntityAncestor(scopedStreamFields, field.name) &&
              resolvedDescendantFieldPaths.has(field.name)
          )
        : getFilteredEntityFields(scopedStreamFields, filter).filter(
            (field) =>
              !hasNestedLinkedEntityAncestor(scopedStreamFields, field.name)
          )
      ).map((field) => {
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

export const getFieldsForSelector = (
  entityFields: StreamFields | null,
  filter: MappedSourceFieldFilter<any>,
  streamDocument?: StreamDocument,
  sourceField?: string
): YextSchemaField[] => {
  if (sourceField) {
    return getScopedFieldsForSelector(
      entityFields,
      sourceField,
      filter,
      streamDocument
    );
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
          .filter(hasRequiredDescendants)
          .filter((field) =>
            !streamDocument
              ? true
              : (() => {
                  const resolvedValue = resolveField<unknown>(
                    streamDocument,
                    field.name
                  ).value;
                  return (
                    resolvedValue === undefined ||
                    resolvedValue === null ||
                    Array.isArray(resolvedValue)
                  );
                })()
          )
      )
    );
  }

  if (filter.mappedSourceTypes?.length) {
    const validLinkedEntityRootFields = getTopLevelLinkedEntitySourceFields(
      entityFields
    )
      .filter(hasRequiredDescendants)
      .filter((field) =>
        !streamDocument
          ? true
          : isMappedListSourceValue(
              resolveField<unknown>(streamDocument, field.name).value
            )
      );
    const validListRootFields = getListSourceRootFields(entityFields)
      .filter(hasRequiredDescendants)
      .filter((field) =>
        !streamDocument
          ? true
          : (() => {
              const resolvedValue = resolveField<unknown>(
                streamDocument,
                field.name
              ).value;
              return (
                resolvedValue === undefined ||
                resolvedValue === null ||
                Array.isArray(resolvedValue)
              );
            })()
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

  return sortFields(dedupeFieldsByName([...filteredEntityFields]));
};

const getResolvedDescendantFieldPaths = (
  streamDocument: StreamDocument | undefined,
  rootFieldPath: string,
  relativeToRoot = false
): Set<string> | undefined => {
  if (!streamDocument) {
    return undefined;
  }

  const resolvedValue = resolveField<unknown>(
    streamDocument,
    rootFieldPath
  ).value;
  if (resolvedValue === undefined || resolvedValue === null) {
    return undefined;
  }

  const sampledValues = Array.isArray(resolvedValue)
    ? resolvedValue.slice(0, 3)
    : [resolvedValue];
  const subdocuments = sampledValues.filter(
    (value): value is Record<string, unknown> =>
      !!value && typeof value === "object"
  );

  if (!subdocuments.length) {
    return undefined;
  }

  const fieldPaths = new Set<string>();

  const collectFieldPaths = (value: unknown, parentFieldPath = ""): void => {
    if (!value || typeof value !== "object") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => collectFieldPaths(item, parentFieldPath));
      return;
    }

    Object.entries(value).forEach(([fieldName, childValue]) => {
      const childFieldPath = parentFieldPath
        ? `${parentFieldPath}.${fieldName}`
        : fieldName;
      fieldPaths.add(
        relativeToRoot ? childFieldPath : `${rootFieldPath}.${childFieldPath}`
      );
      collectFieldPaths(childValue, childFieldPath);
    });
  };

  subdocuments.forEach((subdocument) => collectFieldPaths(subdocument));
  return fieldPaths;
};
