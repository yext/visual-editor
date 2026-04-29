import {
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";
import { StreamFields, YextSchemaField } from "../types/entityFields.ts";
import { type LinkedEntitySchemas } from "../utils/linkedEntityFieldUtils.ts";
import {
  getLinkedEntitySourceRootFields,
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

export const getFieldsForSelector = (
  entityFields: StreamFields | null,
  filter: LinkedEntitySourceFieldFilter<any>,
  linkedEntitySchemas?: LinkedEntitySchemas
): YextSchemaField[] => {
  let filteredEntityFields = getFilteredEntityFields(entityFields, filter);
  const linkedEntityRootFields = filter.includeLinkedEntityRoots
    ? getLinkedEntitySourceRootFields(linkedEntitySchemas)
    : [];
  let linkedEntityFields =
    !filter.includeListsOnly && linkedEntitySchemas
      ? getFilteredEntityFields(
          {
            fields: getLinkedEntitySourceRootFields(linkedEntitySchemas),
          },
          filter
        )
      : [];

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
      !filter.includeListsOnly && linkedEntitySchemas
        ? getFilteredEntityFields(
            {
              fields: getLinkedEntitySourceRootFields(linkedEntitySchemas),
            },
            fallbackFilter
          )
        : [];
  }

  return [
    ...filteredEntityFields,
    ...linkedEntityFields,
    ...linkedEntityRootFields,
  ].sort((entityFieldA, entityFieldB) => {
    const nameA = (entityFieldA.displayName ?? entityFieldA.name).toUpperCase();
    const nameB = (entityFieldB.displayName ?? entityFieldB.name).toUpperCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });
};
