import {
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";
import { StreamFields, YextSchemaField } from "../types/entityFields.ts";

/** Represents data that can either be from the Yext Knowledge Graph or statically defined */
export type YextEntityField<T> = {
  /** The api name of the Yext field */
  field: string;
  /** The static value of the field */
  constantValue: T;
  /** Whether to use the Yext field or the constant value */
  constantValueEnabled?: boolean;
  /**
   * Whether the field can be translated or not.
   */
  disallowTranslation?: boolean;
  /**
   * Filter the embedded field input to this type.
   */
  selectedType?: string;
};

export const getFieldsForSelector = (
  entityFields: StreamFields | null,
  filter: RenderEntityFieldFilter<any>
): YextSchemaField[] => {
  let filteredEntityFields = getFilteredEntityFields(entityFields, filter);

  // If there are no direct children, return the parent field if it is a list
  if (filter.directChildrenOf && filteredEntityFields.length === 0) {
    filteredEntityFields = getFilteredEntityFields(entityFields, {
      allowList: [filter.directChildrenOf],
      types: filter.types,
      includeListsOnly: true,
    });
  }

  return filteredEntityFields.sort((entityFieldA, entityFieldB) => {
    const nameA = (entityFieldA.displayName ?? entityFieldA.name).toUpperCase();
    const nameB = (entityFieldB.displayName ?? entityFieldB.name).toUpperCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });
};
