import { useEntityFields, YextSchemaField } from "../hooks/index.ts";

type Only<T, U> = {
  [P in keyof T]: T[P];
} & {
  [P in keyof U]?: never;
};
type Either<T, U> = Only<T, U> | Only<U, T>;

type ConfigFields<T extends Record<string, any>> = T["stream"]["fields"];

type AllowList<T extends Record<string, any>> = {
  allowList: ConfigFields<T>[number][];
};

type DisallowList<T extends Record<string, any>> = {
  disallowList: ConfigFields<T>[number][];
};

type EntityFieldTypesFilter = {
  types: EntityFieldTypes[];
};

export type RenderEntityFieldFilter<T extends Record<string, any>> = Either<
  EntityFieldTypesFilter,
  Either<AllowList<T>, DisallowList<T>>
>;

type EntityFieldTypes = "type.string" | "type.image" | `c_${string}`;

const DEFAULT_DISALLOWED_ENTITY_FIELDS = [
  "uid",
  "meta",
  "slug",
  "c_visualConfigurations",
  "c_pages_layouts",
];
const TOP_LEVEL_ONLY_FIELD_TYPES = ["type.image", "type.hours", "type.address"];

type EntityFieldNameAndSchema = {
  name: string;
  schemaField: YextSchemaField;
};

/**
 * Returns a list of {@link EntityFieldNameAndSchema} given a {@link YextSchemaField}.
 * @param schemaField The schema field for which to get the field names.
 * @returns Entity field names and their corresponding schema fields.
 */
const getEntityFieldNames = (
  schemaField: YextSchemaField
): EntityFieldNameAndSchema[] => {
  const entityFieldNames: EntityFieldNameAndSchema[] = [];
  if (DEFAULT_DISALLOWED_ENTITY_FIELDS.includes(schemaField.name)) {
    return entityFieldNames;
  }

  return walkSubfields(schemaField, "");
};

const walkSubfields = (
  schemaField: YextSchemaField,
  fieldName: string
): EntityFieldNameAndSchema[] => {
  const fieldNameInternal = fieldName
    ? `${fieldName}.${schemaField.name}`
    : schemaField.name;

  if (
    TOP_LEVEL_ONLY_FIELD_TYPES.includes(schemaField.definition.typeName) ||
    TOP_LEVEL_ONLY_FIELD_TYPES.includes(schemaField.definition.typeRegistryId)
  ) {
    return [{ name: fieldNameInternal, schemaField: schemaField }];
  }

  if (
    schemaField.children?.fields &&
    schemaField.children?.fields?.length > 0
  ) {
    const fieldNames: EntityFieldNameAndSchema[] = [];
    for (const child of schemaField.children.fields) {
      fieldNames.push(...walkSubfields(child, fieldNameInternal));
    }
    return fieldNames;
  }

  return [{ name: fieldNameInternal, schemaField: schemaField }];
};

const getTypeFromSchemaField = (schemaField: YextSchemaField) => {
  return (
    schemaField.definition.typeName ||
    schemaField.definition.typeRegistryId ||
    Object.entries(schemaField.definition.type)[0][1]
  );
};

const getEntityTypeToFieldNames = (
  schemaFields: YextSchemaField[],
  filter: {
    includeSubfields: boolean;
  }
): Map<string, string[]> => {
  return schemaFields.reduce((prev: Map<string, string[]>, field) => {
    if (field.definition.isList) {
      return prev;
    }

    if (filter.includeSubfields) {
      const fieldNameToSchemas = getEntityFieldNames(field); // already recursed
      if (fieldNameToSchemas.length === 0) {
        return prev;
      }

      for (const fieldNameToSchema of fieldNameToSchemas) {
        const typeName = getTypeFromSchemaField(fieldNameToSchema.schemaField);
        if (!typeName) {
          continue;
        }

        if (!prev.has(typeName)) {
          prev = prev.set(typeName, [fieldNameToSchema.name]);
        } else {
          prev.get(typeName)?.push(fieldNameToSchema.name);
        }
      }
    } else {
      const typeName = getTypeFromSchemaField(field);
      if (!typeName) {
        return prev;
      }

      if (!prev.has(typeName)) {
        prev = prev.set(typeName, [field.definition.name]);
      } else {
        prev.get(typeName)?.push(field.definition.name);
      }
    }

    return prev;
  }, new Map<string, string[]>());
};

export const getFilteredEntityFields = <T extends Record<string, any>>(
  filter?: RenderEntityFieldFilter<T>
) => {
  const entityFields = useEntityFields();

  let filteredEntityFields = entityFields.stream.expression.fields.filter(
    (field) => !DEFAULT_DISALLOWED_ENTITY_FIELDS.includes(field.name)
  );

  if (filter?.allowList) {
    filteredEntityFields = filteredEntityFields.filter((field) =>
      filter.allowList.includes(field.name)
    );
  }

  if (filter?.disallowList) {
    filteredEntityFields = filteredEntityFields.filter(
      (field) => !filter.disallowList.includes(field.name)
    );
  }

  if (filter?.types) {
    const typeToFieldNames = getEntityTypeToFieldNames(
      entityFields.stream.schema.fields,
      {
        includeSubfields: true,
      }
    );

    filter.types.forEach((type) => {
      filteredEntityFields = filteredEntityFields.filter((field) =>
        typeToFieldNames.get(type)?.includes(field.name)
      );
    });
  }

  return filteredEntityFields;
};
