import {
  type EntityFieldTypes,
  type RenderEntityFieldFilter,
} from "../../internal/utils/getFilteredEntityFields.ts";
import {
  type StreamFields,
  type YextSchemaField,
} from "../../types/entityFields.ts";

const getListFields = (
  fields: YextSchemaField[],
  parentPath = ""
): YextSchemaField[] =>
  fields.flatMap((field) => {
    const name = parentPath ? `${parentPath}.${field.name}` : field.name;
    return [
      { ...field, name },
      ...getListFields(field.children?.fields ?? [], name),
    ];
  });

/**
 * Returns lists with child fields for mapped sources. Item sources can also
 * include lists whose complete items can be mapped.
 */
export const getListSourceRootFields = (
  entityFields: StreamFields | YextSchemaField[] | null,
  includeItems = false
): YextSchemaField[] => {
  const fields = Array.isArray(entityFields)
    ? entityFields
    : (entityFields?.fields ?? []);

  return getListFields(fields).filter(
    (field) =>
      !!field.definition?.isList &&
      ((Array.isArray(field.children?.fields) &&
        field.children.fields.length > 0) ||
        includeItems)
  );
};

export type MappedSourceFieldFilter<T extends Record<string, any>> =
  RenderEntityFieldFilter<T> & {
    /** Higher-priority repeated-source constraints used by itemSource pickers. */
    itemSourceTypes?: EntityFieldTypes[][];
    /** Used only when itemSourceTypes is not provided. */
    mappedSourceTypes?: EntityFieldTypes[][];
  };
