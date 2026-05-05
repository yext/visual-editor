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
 * Returns every list field with nested children so wrappers can treat that
 * list's item shape as a mapped source.
 */
export const getListSourceRootFields = (
  entityFields: StreamFields | YextSchemaField[] | null
): YextSchemaField[] => {
  const fields = Array.isArray(entityFields)
    ? entityFields
    : (entityFields?.fields ?? []);

  return getListFields(fields).filter(
    (field) =>
      !!field.definition?.isList &&
      Array.isArray(field.children?.fields) &&
      field.children.fields.length > 0
  );
};

export type MappedSourceFieldFilter<T extends Record<string, any>> =
  RenderEntityFieldFilter<T> & {
    mappedSourceTypes?: EntityFieldTypes[][];
    itemSourceTypes?: EntityFieldTypes[][];
  };
