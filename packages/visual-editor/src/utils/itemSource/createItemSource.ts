import {
  type YextFieldDefinition,
  type YextFieldMap,
} from "../../fields/fields.ts";
import {
  getDefaultValueForField,
  getItemSourceTypes,
  getManualItemField,
  getMappingItemField,
} from "./itemSourceFieldTransforms.ts";
import {
  type CreateItemSourceOptions,
  type ItemSourceInstance,
  type RepeatedEntityFieldDefinition,
  type RepeatedEntityFieldValue,
  type ResolvedItemField,
} from "./itemSourceTypes.ts";
import { resolveItemValue } from "./itemSourceResolution.ts";

/**
 * Item-source assembly.
 *
 * 1. Uses mappingFields for manual inputs and linked item mappings. Excludes
 *    optionalMappingKeys from the types required in a selected object list.
 *    Uses directItem to also accept lists of values without child fields.
 * 2. Generates the default repeated value for linked and manual modes.
 * 3. Resolves linked or manual items into render-ready values without writing
 *    derived data back onto component props.
 */
export function createItemSource<TItemProps extends Record<string, unknown>>({
  label,
  mappingFields,
  defaultValues,
  optionalMappingKeys = [],
  directItem,
}: CreateItemSourceOptions<TItemProps>): ItemSourceInstance<TItemProps> {
  const directItemField = directItem
    ? (mappingFields as Record<string, YextFieldDefinition<any>>)[
        directItem.mappingKey
      ]
    : undefined;
  const directItemTypes =
    directItem?.types ??
    (directItemField?.type === "entityField"
      ? directItemField.filter.types
      : undefined);
  const scopedMappingFields = Object.fromEntries(
    Object.entries(mappingFields).map(([key, field]) => {
      const mappingField = getMappingItemField(
        field as YextFieldDefinition<any>
      );
      return [
        key,
        key === directItem?.mappingKey && mappingField.type === "entityField"
          ? {
              ...mappingField,
              filter: {
                ...mappingField.filter,
                directItemTypes,
              },
            }
          : mappingField,
      ];
    })
  ) as YextFieldMap<TItemProps>;
  const manualItemFields = Object.fromEntries(
    Object.entries(mappingFields).map(([key, field]) => [
      key,
      getManualItemField(field as YextFieldDefinition<any>),
    ])
  ) as YextFieldMap<TItemProps>;
  const generatedDefaultItemValue = Object.fromEntries(
    Object.entries(manualItemFields).map(([key, field]) => [
      key,
      getDefaultValueForField(field as YextFieldDefinition<any>, true),
    ])
  ) as TItemProps;
  const generatedDefaultMappings = Object.fromEntries(
    Object.entries(scopedMappingFields).map(([key, field]) => [
      key,
      getDefaultValueForField(field as YextFieldDefinition<any>, false),
    ])
  ) as TItemProps;
  const defaultItemValue = defaultValues?.[0] ?? generatedDefaultItemValue;
  const defaultMappings = generatedDefaultMappings;
  const field = {
    type: "entityField",
    label,
    filter: {
      itemSourceTypes: getItemSourceTypes(
        Object.fromEntries(
          Object.entries(scopedMappingFields).filter(
            ([key]) => !optionalMappingKeys.includes(key as keyof TItemProps)
          )
        ) as YextFieldMap<TItemProps>
      ),
      directItemTypes,
    },
    repeated: {
      mappingFields: scopedMappingFields,
      manualItemFields,
      defaultItemValue,
      defaultMappings,
      directItemMappingKey: directItem?.mappingKey,
    },
  } satisfies RepeatedEntityFieldDefinition<TItemProps>;
  const defaultValue: RepeatedEntityFieldValue<TItemProps> = {
    field: "",
    constantValueEnabled: true,
    constantValue: defaultValues ?? [],
    mappings: defaultMappings,
  };
  const sourceField = {
    type: "entityField",
    label,
    filter: { itemSourceTypes: [] },
  } satisfies YextFieldDefinition<unknown>;

  return {
    field,
    defaultValue,
    value: undefined as unknown as RepeatedEntityFieldValue<TItemProps>,
    resolveItems: (value, streamDocument) => {
      if (!value) {
        return [];
      }

      if (value.constantValueEnabled || !value.field) {
        return (value.constantValue ?? []).map((item) =>
          Object.fromEntries(
            Object.entries(manualItemFields).map(([key, itemField]) => [
              key,
              resolveItemValue(
                itemField as YextFieldDefinition<any>,
                item?.[key as keyof TItemProps],
                streamDocument
              ),
            ])
          )
        ) as ResolvedItemField<TItemProps>[];
      }

      const resolvedSourceItems = resolveItemValue(
        sourceField,
        {
          field: value.field,
          constantValue: value.constantValue,
          constantValueEnabled: false,
        },
        streamDocument
      );

      if (!Array.isArray(resolvedSourceItems)) {
        return [];
      }

      return resolvedSourceItems.map((itemDocument) =>
        Object.fromEntries(
          Object.entries(scopedMappingFields).map(([key, itemField]) => [
            key,
            resolveItemValue(
              itemField as YextFieldDefinition<any>,
              value.mappings?.[key as keyof TItemProps],
              streamDocument,
              itemDocument
            ),
          ])
        )
      ) as ResolvedItemField<TItemProps>[];
    },
  };
}
