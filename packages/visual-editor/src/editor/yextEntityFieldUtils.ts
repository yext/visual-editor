import {
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";
import { StreamFields, YextSchemaField } from "../types/entityFields.ts";
import {
  buildLinkedEntityStreamFields,
  type LinkedEntitySchemas,
} from "../utils/linkedEntityFieldUtils.ts";
import {
  getBaseEntityListSourceRootFields,
  isTopLevelLinkedEntitySourceField,
  type LinkedEntitySourceFieldFilter,
} from "../utils/cardSlots/linkedEntityListWrapper.ts";

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

const trimLinkedEntityRootDisplayName = (
  fields: YextSchemaField[],
  linkedEntitySchemas: LinkedEntitySchemas | undefined,
  linkedEntityRoot: string
): YextSchemaField[] => {
  const rootDisplayName = linkedEntitySchemas?.[linkedEntityRoot]?.displayName;
  if (!rootDisplayName) {
    return fields;
  }

  const rootPrefix = `${rootDisplayName} > `;
  return fields.map((field) => {
    const displayName = field.displayName ?? field.name;
    return displayName.startsWith(rootPrefix)
      ? { ...field, displayName: displayName.slice(rootPrefix.length) }
      : field;
  });
};

export const getFieldsForSelector = (
  entityFields: StreamFields | null,
  filter: LinkedEntitySourceFieldFilter<any>,
  linkedEntitySchemas?: LinkedEntitySchemas
): YextSchemaField[] => {
  const linkedEntityStreamFields =
    buildLinkedEntityStreamFields(linkedEntitySchemas);
  const linkedEntityRootFields = filter.sourceRootKinds?.includes(
    "linkedEntityRoot"
  )
    ? (linkedEntityStreamFields?.fields ?? [])
    : [];
  const baseListRootFields = filter.sourceRootKinds?.includes("baseListRoot")
    ? getBaseEntityListSourceRootFields(entityFields)
    : [];
  const isLinkedEntityDescendantFilter =
    !!filter.descendantsOf &&
    isTopLevelLinkedEntitySourceField(
      filter.descendantsOf,
      linkedEntitySchemas
    );

  if (filter.sourceRootsOnly) {
    const rootEntityFields = getFilteredEntityFields(
      entityFields,
      filter
    ).filter((field) => !field.name.includes("."));

    return sortFields(
      dedupeFieldsByName([
        ...rootEntityFields,
        ...linkedEntityRootFields,
        ...baseListRootFields,
      ])
    );
  }

  let filteredEntityFields = isLinkedEntityDescendantFilter
    ? []
    : getFilteredEntityFields(entityFields, filter);
  let linkedEntityFields =
    !filter.includeListsOnly && linkedEntityStreamFields
      ? getFilteredEntityFields(linkedEntityStreamFields, filter)
      : [];

  if (isLinkedEntityDescendantFilter) {
    linkedEntityFields = trimLinkedEntityRootDisplayName(
      linkedEntityFields,
      linkedEntitySchemas,
      filter.descendantsOf!
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
    linkedEntityFields =
      !filter.includeListsOnly && linkedEntityStreamFields
        ? getFilteredEntityFields(linkedEntityStreamFields, fallbackFilter)
        : [];
  }

  return sortFields(
    dedupeFieldsByName([
      ...filteredEntityFields,
      ...linkedEntityFields,
      ...(!isLinkedEntityDescendantFilter ? linkedEntityRootFields : []),
      ...(!isLinkedEntityDescendantFilter ? baseListRootFields : []),
    ])
  );
};
