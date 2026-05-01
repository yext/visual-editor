import {
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";
import { StreamFields, YextSchemaField } from "../types/entityFields.ts";
import { resolveField } from "../utils/resolveYextEntityField.ts";
import { type StreamDocument } from "../utils/types/StreamDocument.ts";
import { getTopLevelLinkedEntitySourceFields } from "../utils/linkedEntityFieldUtils.ts";
import {
  getBaseEntityListSourceRootFields,
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

  for (const segment of fieldPathSegments) {
    const matchingField = currentFields.find((field) => field.name === segment);
    if (!matchingField) {
      return displayNameSegments.length
        ? displayNameSegments.join(" > ")
        : undefined;
    }

    displayNameSegments.push(matchingField.displayName ?? matchingField.name);
    currentFields = matchingField.children?.fields ?? [];
  }

  return displayNameSegments.join(" > ");
};

const isSectionFieldSourceValue = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (!!value && typeof value === "object" && !Array.isArray(value));

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

/**
 * Returns only the selectable descendants for a scoped mapped-item source.
 * 1. Starts from the selected source subtree instead of the full entity tree.
 * 2. Drops nested linked-entity traversals so selectors stay on the current
 *    linked entity or list item.
 * 3. Samples runtime items to keep only fields that are actually present when
 *    runtime data is available, while falling back to schema descendants when
 *    the source cannot currently be resolved.
 */
export const getSubfieldsForSelector = (
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

  const filteredEntityFields = getFilteredEntityFields(
    scopedStreamFields,
    filter
  )
    .filter(
      (field) => !hasNestedLinkedEntityAncestor(scopedStreamFields, field.name)
    )
    .map((field) => ({
      ...field,
      name: `${sourceField}.${field.name}`,
    }));

  const resolvedDescendantFieldPaths = getResolvedDescendantFieldPaths(
    streamDocument,
    sourceField
  );

  const descendantRootDisplayName = getEntityFieldDisplayName(
    sourceField,
    entityFields
  );
  const rootPrefix = descendantRootDisplayName
    ? `${descendantRootDisplayName} > `
    : undefined;

  return sortFields(
    dedupeFieldsByName(
      (resolvedDescendantFieldPaths
        ? resolvedDescendantFieldPaths.size === 0
          ? []
          : filteredEntityFields.filter((field) =>
              resolvedDescendantFieldPaths.has(field.name)
            )
        : filteredEntityFields
      ).map((field) => {
        if (!rootPrefix) {
          return field;
        }

        const displayName = field.displayName ?? field.name;
        return displayName.startsWith(rootPrefix)
          ? { ...field, displayName: displayName.slice(rootPrefix.length) }
          : field;
      })
    )
  );
};

export const getFieldsForSelector = (
  entityFields: StreamFields | null,
  filter: MappedSourceFieldFilter<any>,
  streamDocument?: StreamDocument
): YextSchemaField[] => {
  const hasRequiredDescendants = (field: YextSchemaField): boolean => {
    if (!filter.requiredDescendantTypes?.length) {
      return true;
    }

    const availableFields = getFilteredEntityFields(
      { fields: [field], displayNames: entityFields?.displayNames },
      {
        descendantsOf: field.name,
      }
    );

    return filter.requiredDescendantTypes.every((requiredTypes) => {
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
  const linkedEntityRootFields = filter.sourceRootKinds?.includes(
    "linkedEntityRoot"
  )
    ? getTopLevelLinkedEntitySourceFields(entityFields).filter(
        hasRequiredDescendants
      )
    : [];
  const baseListRootFields = filter.sourceRootKinds?.includes("baseListRoot")
    ? getBaseEntityListSourceRootFields(entityFields).filter(
        hasRequiredDescendants
      )
    : [];

  if (filter.sourceRootsOnly) {
    const rootEntityFields = getFilteredEntityFields(entityFields, filter)
      .filter((field) => !field.name.includes("."))
      .filter((field) =>
        !streamDocument || !filter.listFieldName
          ? true
          : (() => {
              const resolvedValue = resolveField<unknown>(
                streamDocument,
                field.name
              ).value;
              return isSectionFieldSourceValue(resolvedValue);
            })()
      );
    const validLinkedEntityRootFields = linkedEntityRootFields.filter(
      (field) =>
        !streamDocument
          ? true
          : (() => {
              const resolvedValue = resolveField<unknown>(
                streamDocument,
                field.name
              ).value;
              return isMappedListSourceValue(resolvedValue);
            })()
    );
    const validBaseListRootFields = baseListRootFields.filter((field) =>
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
        ...rootEntityFields,
        ...validLinkedEntityRootFields,
        ...validBaseListRootFields,
      ])
    );
  }

  let filteredEntityFields = getFilteredEntityFields(entityFields, filter);

  // If there are no direct children, return the parent field if it is a list
  if (filter.directChildrenOf && filteredEntityFields.length === 0) {
    const fallbackFilter = {
      allowList: [filter.directChildrenOf],
      types: filter.types,
      includeListsOnly: true,
    } satisfies RenderEntityFieldFilter<any>;

    filteredEntityFields = getFilteredEntityFields(
      entityFields,
      fallbackFilter
    );
  }

  return sortFields(
    dedupeFieldsByName([
      ...filteredEntityFields,
      ...linkedEntityRootFields,
      ...baseListRootFields,
    ])
  );
};

const getResolvedDescendantFieldPaths = (
  streamDocument: StreamDocument | undefined,
  rootFieldPath: string
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
      fieldPaths.add(`${rootFieldPath}.${childFieldPath}`);
      collectFieldPaths(childValue, childFieldPath);
    });
  };

  subdocuments.forEach((subdocument) => collectFieldPaths(subdocument));
  return fieldPaths;
};
