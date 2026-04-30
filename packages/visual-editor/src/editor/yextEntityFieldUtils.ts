import {
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";
import { StreamFields, YextSchemaField } from "../types/entityFields.ts";
import { resolveField } from "../utils/resolveYextEntityField.ts";
import { type StreamDocument } from "../utils/types/StreamDocument.ts";
import {
  buildLinkedEntityStreamFields,
  getTopLevelLinkedEntitySourceFields,
  isTopLevelLinkedEntityField,
  type LinkedEntitySchemas,
} from "../utils/linkedEntityFieldUtils.ts";
import {
  getBaseEntityListSourceRootFields,
  classifyMappedSource,
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

export const getFieldsForSelector = (
  entityFields: StreamFields | null,
  filter: MappedSourceFieldFilter<any>,
  linkedEntitySchemas?: LinkedEntitySchemas,
  streamDocument?: StreamDocument
): YextSchemaField[] => {
  const linkedEntityStreamFields =
    buildLinkedEntityStreamFields(linkedEntitySchemas);
  const resolvedDescendantFieldPaths = filter.descendantsOf
    ? getResolvedDescendantFieldPaths(streamDocument, filter.descendantsOf)
    : undefined;
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
    ? (linkedEntityStreamFields?.fields ??
      getTopLevelLinkedEntitySourceFields(entityFields))
    : [];
  const baseListRootFields = filter.sourceRootKinds?.includes("baseListRoot")
    ? getBaseEntityListSourceRootFields(entityFields).filter(
        hasRequiredDescendants
      )
    : [];
  const isLinkedEntityDescendantFilter =
    !!filter.descendantsOf && !!linkedEntitySchemas?.[filter.descendantsOf];
  const isLinkedEntityDescendantWithoutSchema =
    !!filter.descendantsOf &&
    isTopLevelLinkedEntityField(filter.descendantsOf, entityFields) &&
    !linkedEntitySchemas?.[filter.descendantsOf];
  const descendantRootDisplayName = filter.descendantsOf
    ? (linkedEntitySchemas?.[filter.descendantsOf]?.displayName ??
      entityFields?.displayNames?.[filter.descendantsOf] ??
      entityFields?.fields.find((field) => field.name === filter.descendantsOf)
        ?.displayName)
    : undefined;

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
              return (
                resolvedValue === undefined ||
                classifyMappedSource({
                  streamDocument,
                  fieldPath: field.name,
                  listFieldName: filter.listFieldName,
                }) === "sectionField"
              );
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
              return (
                resolvedValue === undefined ||
                Array.isArray(resolvedValue) ||
                (!!resolvedValue && typeof resolvedValue === "object")
              );
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
            return resolvedValue === undefined || Array.isArray(resolvedValue);
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

  if (isLinkedEntityDescendantWithoutSchema) {
    return [];
  }

  let filteredEntityFields = getFilteredEntityFields(entityFields, filter);

  if (isLinkedEntityDescendantFilter) {
    filteredEntityFields = getFilteredEntityFields(linkedEntityStreamFields, {
      ...filter,
    });
  }

  if (descendantRootDisplayName) {
    const rootPrefix = `${descendantRootDisplayName} > `;
    filteredEntityFields = filteredEntityFields.map((field) => {
      const displayName = field.displayName ?? field.name;
      return displayName.startsWith(rootPrefix)
        ? { ...field, displayName: displayName.slice(rootPrefix.length) }
        : field;
    });
  }

  if (resolvedDescendantFieldPaths) {
    filteredEntityFields = filteredEntityFields.filter((field) =>
      resolvedDescendantFieldPaths.has(field.name)
    );
  }

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
      ...(!isLinkedEntityDescendantFilter ? linkedEntityRootFields : []),
      ...(!isLinkedEntityDescendantFilter ? baseListRootFields : []),
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
  if (resolvedValue === undefined) {
    return undefined;
  }

  const values = Array.isArray(resolvedValue)
    ? resolvedValue
    : resolvedValue && typeof resolvedValue === "object"
      ? [resolvedValue]
      : [];

  if (!values.length) {
    return new Set();
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

  values.forEach((value) => collectFieldPaths(value));
  return fieldPaths;
};
