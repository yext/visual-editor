import { StreamFields, YextSchemaField } from "../../types/entityFields.ts";

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
  types?: EntityFieldTypes[];
  includeListsOnly?: boolean;
  directChildrenOf?: string;
};
export type RenderEntityFieldFilter<T extends Record<string, any>> =
  EntityFieldTypesFilter & EitherOrNeither<AllowList<T>, DisallowList<T>>;

export type EntityFieldTypes =
  | "type.string"
  | "type.image"
  | "type.hours"
  | "type.address"
  | "type.phone"
  | "type.coordinate"
  | "type.cta"
  | "type.product"
  | "type.rich_text_v2"
  | `c_${string}`;

const DEFAULT_DISALLOWED_ENTITY_FIELDS = ["uid", "meta", "slug"];

// Populate this with fields that aren't allowed to have subfields.
const TOP_LEVEL_ONLY_FIELD_TYPES: string[] = ["type.hours"];

type EntityFieldNameAndSchema = {
  name: string;
  schemaField: YextSchemaField;
};

/**
 * Returns a list of {@link EntityFieldNameAndSchema} given a {@link YextSchemaField}.
 * @param schemaField The schema field for which to get the field names.
 * @param includeListChildren Whether to include the children of list types
 * @returns Entity field names and their corresponding schema fields.
 */
const getEntityFieldNames = (
  schemaField: YextSchemaField,
  includeListChildren: boolean
): EntityFieldNameAndSchema[] => {
  return walkSubfields(schemaField, includeListChildren, "");
};

const walkSubfields = (
  schemaField: YextSchemaField,
  includeListChildren: boolean,
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

  if (!includeListChildren && schemaField.definition.isList) {
    return [{ name: fieldNameInternal, schemaField: schemaField }]; // skip all children of list types
  }

  const fieldNames: EntityFieldNameAndSchema[] = [
    { name: fieldNameInternal, schemaField: schemaField },
  ];

  if (
    schemaField.children?.fields &&
    schemaField.children?.fields?.length > 0
  ) {
    for (const child of schemaField.children.fields) {
      fieldNames.push(
        ...walkSubfields(child, includeListChildren, fieldNameInternal)
      );
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
  schemaFields: YextSchemaField[],
  includeListChildren: boolean
): Map<string, string[]> => {
  return schemaFields.reduce((prev: Map<string, string[]>, field) => {
    const fieldNameToSchemas = getEntityFieldNames(field, includeListChildren);

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
  streamFields: StreamFields | null,
  filter: RenderEntityFieldFilter<T>
): YextSchemaField[] => {
  if (!streamFields?.fields) {
    return [];
  }

  let filteredEntityFields = streamFields.fields.filter(
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

  // Augment to include subfields
  let filteredEntitySubFields: YextSchemaField[] = [];
  for (const yextSchemaField of filteredEntityFields) {
    const entityFieldNames = getEntityFieldNames(
      yextSchemaField,
      !!filter?.directChildrenOf?.length
    );

    for (const entityFieldName of entityFieldNames) {
      filteredEntitySubFields.push({
        ...entityFieldName.schemaField,
        name: entityFieldName.name,
      });
    }
  }

  if (filter?.directChildrenOf) {
    filteredEntitySubFields = filteredEntitySubFields.filter((field) => {
      if (!field.name.startsWith(filter.directChildrenOf!)) {
        return false;
      }

      // filter children of children
      const numberOfChildren =
        field.name.substring(filter.directChildrenOf!.length).split(".")
          .length - 1;
      return numberOfChildren === 1;
    });
  }

  if (filter?.types) {
    const typeToFieldNames = getEntityTypeToFieldNames(
      filteredEntitySubFields,
      !!filter?.directChildrenOf?.length
    );

    const updatedFilteredEntitySubFields: YextSchemaField[] = [];
    filter.types.forEach((type) => {
      updatedFilteredEntitySubFields.push(
        ...filteredEntitySubFields.filter((field) => {
          return typeToFieldNames.get(type)?.includes(field.name);
        })
      );
    });
    filteredEntitySubFields = updatedFilteredEntitySubFields;
  }

  filteredEntitySubFields = filteredEntitySubFields.filter(
    (field) => !!field.definition.isList === !!filter?.includeListsOnly
  );

  if (streamFields.displayNames) {
    filteredEntitySubFields.forEach((field) => {
      field.displayName = streamFields.displayNames![field.name];
    });
  }

  return filteredEntitySubFields;
};
