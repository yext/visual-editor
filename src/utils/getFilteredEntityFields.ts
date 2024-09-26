import { useEntityFields } from "../hooks/useEntityFields.tsx";
import { YextSchemaField } from "../internal/types/entityFields.ts";

type Only<T, U> = {
  [P in keyof T]: T[P];
} & {
  [P in keyof U]?: never;
};

type Neither<T, U> = {
  [P in keyof T]?: never;
} & {
  [P in keyof U]?: never;
};

type Either<T, U> = Only<T, U> | Only<U, T>;

type EitherOrNeither<T, U> = Either<T, U> | Neither<T, U>;

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
export type RenderEntityFieldFilter<T extends Record<string, any>> =
  EntityFieldTypesFilter & EitherOrNeither<AllowList<T>, DisallowList<T>>;

type EntityFieldTypes =
  | "type.string"
  | "type.image"
  | "type.hours"
  | "type.address"
  | `c_${string}`;

const DEFAULT_DISALLOWED_ENTITY_FIELDS = [
  "uid",
  "meta",
  "slug",
  "c_visualConfigurations",
  "c_pages_layouts",
];

// Populate this with fields that aren't allowed to have subfields.
const TOP_LEVEL_ONLY_FIELD_TYPES: string[] = [];

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
    TOP_LEVEL_ONLY_FIELD_TYPES.includes(getTypeFromSchemaField(schemaField))
  ) {
    // skip all children of TOP_LEVEL_ONLY_FIELD_TYPES
    return [{ name: fieldNameInternal, schemaField: schemaField }];
  }

  if (schemaField.definition.isList) {
    return []; // skip all children of list types
  }

  const fieldNames: EntityFieldNameAndSchema[] = [
    { name: fieldNameInternal, schemaField: schemaField },
  ];

  if (
    schemaField.children?.fields &&
    schemaField.children?.fields?.length > 0
  ) {
    for (const child of schemaField.children.fields) {
      fieldNames.push(...walkSubfields(child, fieldNameInternal));
    }
  }

  return fieldNames;
};

const getTypeFromSchemaField = (schemaField: YextSchemaField) => {
  return (
    schemaField.definition.typeName ||
    schemaField.definition.typeRegistryId ||
    Object.entries(schemaField.definition.type)[0][1]
  );
};

function appendToMapList<K, V>(
  map: Map<K, V[]>,
  key: K,
  value: V
): Map<K, V[]> {
  const list = map.get(key) || [];
  list.push(value);
  map.set(key, list);
  return map;
}

const getEntityTypeToFieldNames = (
  schemaFields: YextSchemaField[]
): Map<string, string[]> => {
  return schemaFields.reduce((prev: Map<string, string[]>, field) => {
    const fieldNameToSchemas = getEntityFieldNames(field);

    for (const fieldToSchema of fieldNameToSchemas) {
      const typeName = getTypeFromSchemaField(fieldToSchema.schemaField);
      if (typeName) {
        prev = appendToMapList(prev, typeName, fieldToSchema.name);
      }
    }

    return prev;
  }, new Map<string, string[]>());
};

export const getFilteredEntityFields = <T extends Record<string, any>>(
  filter: RenderEntityFieldFilter<T>
) => {
  const entityFields = useEntityFields();

  let filteredEntityFields = entityFields.stream.schema.fields.filter(
    (field) => !DEFAULT_DISALLOWED_ENTITY_FIELDS.includes(field.name)
  );

  if (filter?.allowList) {
    const streamFieldNames = filteredEntityFields.map((field) => field.name);
    filter.allowList.forEach((field) => {
      if (!streamFieldNames.includes(field)) {
        console.warn(
          `The entity field filter allowList included ${field}, which does not exist in the stream.`
        );
      }
    });

    filteredEntityFields = filteredEntityFields.filter((field) =>
      filter.allowList.includes(field.name)
    );
  }

  if (filter?.disallowList) {
    filteredEntityFields = filteredEntityFields.filter(
      (field) => !filter.disallowList.includes(field.name)
    );
  }

  let filterEntitySubFields: YextSchemaField[] = [];
  for (const yextSchemaField of filteredEntityFields) {
    const entityFieldNames = getEntityFieldNames(yextSchemaField);

    for (const entityFieldName of entityFieldNames) {
      filterEntitySubFields.push({
        ...entityFieldName.schemaField,
        name: entityFieldName.name,
      });
    }
  }

  if (filter?.types) {
    const typeToFieldNames = getEntityTypeToFieldNames(filterEntitySubFields);

    const updatedFilterEntitySubFields: YextSchemaField[] = [];
    filter.types.forEach((type) => {
      updatedFilterEntitySubFields.push(
        ...filterEntitySubFields.filter((field) => {
          return typeToFieldNames.get(type)?.includes(field.name);
        })
      );
    });
    filterEntitySubFields = updatedFilterEntitySubFields;
  }

  return filterEntitySubFields;
};
