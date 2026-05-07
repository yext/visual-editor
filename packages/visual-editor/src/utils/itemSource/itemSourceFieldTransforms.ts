import { type EntityFieldSelectorField } from "../../fields/EntityFieldSelectorField.tsx";
import {
  type YextFieldDefinition,
  type YextFieldMap,
} from "../../fields/fields.ts";
import { type EntityFieldTypes } from "../../internal/utils/getFilteredEntityFields.ts";

/**
 * Authoring-time item-source field transforms.
 *
 * 1. Shape one repeated-item schema into linked-mapping and manual-item forms.
 * 2. Derive source-selector compatibility requirements from mapping fields.
 * 3. Build default authored values for linked mappings and manual items.
 */

/**
 * Applies linked-mapping defaults to one item field definition.
 */
export function getMappingItemField<TValue>(
  field: YextFieldDefinition<TValue>
): YextFieldDefinition<TValue> {
  if (
    isEntityFieldDefinition(field) &&
    field.disableConstantValueToggle === undefined
  ) {
    return {
      ...field,
      disableConstantValueToggle: !shouldEnableMappingConstantValue(field),
    } as YextFieldDefinition<TValue>;
  }

  if (field.type === "object" && "objectFields" in field) {
    return {
      ...field,
      objectFields: Object.fromEntries(
        Object.entries(field.objectFields).map(([key, nestedField]) => [
          key,
          getMappingItemField(nestedField as YextFieldDefinition<any>),
        ])
      ),
    } as YextFieldDefinition<TValue>;
  }

  if (field.type === "array" && "arrayFields" in field) {
    return {
      ...field,
      arrayFields: Object.fromEntries(
        Object.entries(field.arrayFields).map(([key, nestedField]) => [
          key,
          getMappingItemField(nestedField as YextFieldDefinition<any>),
        ])
      ),
    } as YextFieldDefinition<TValue>;
  }

  return field;
}

/**
 * Removes linked-mapping-only behavior so manual items can be authored locally.
 */
export function getManualItemField<TValue>(
  field: YextFieldDefinition<TValue>
): YextFieldDefinition<TValue> {
  if (isEntityFieldDefinition(field)) {
    const {
      disableConstantValueToggle: _disableConstantValueToggle,
      sourceFieldPath: _sourceFieldPath,
      ...rest
    } = field;

    return rest as YextFieldDefinition<TValue>;
  }

  if (field.type === "object" && "objectFields" in field) {
    return {
      ...field,
      objectFields: Object.fromEntries(
        Object.entries(field.objectFields).map(([key, nestedField]) => [
          key,
          getManualItemField(nestedField as YextFieldDefinition<any>),
        ])
      ),
    } as YextFieldDefinition<TValue>;
  }

  if (field.type === "array" && "arrayFields" in field) {
    return {
      ...field,
      arrayFields: Object.fromEntries(
        Object.entries(field.arrayFields).map(([key, nestedField]) => [
          key,
          getManualItemField(nestedField as YextFieldDefinition<any>),
        ])
      ),
    } as YextFieldDefinition<TValue>;
  }

  return field;
}

/**
 * Collects the descendant field-type requirements that a parent item-source
 * root must satisfy in linked mode.
 */
export function getItemSourceTypes<TItemProps extends Record<string, unknown>>(
  itemFields: YextFieldMap<TItemProps>
): EntityFieldTypes[][] {
  return (Object.values(itemFields) as YextFieldDefinition<any>[]).flatMap(
    getNestedItemSourceTypes
  );
}

/**
 * Narrows a generic field definition to the entity-field variant used for
 * source-relative mapping and manual constants.
 */
export function isEntityFieldDefinition(
  field: YextFieldDefinition<any>
): field is EntityFieldSelectorField<any> {
  return field.type === "entityField";
}

const MAPPING_CONSTANT_VALUE_TYPES: EntityFieldTypes[] = [
  "type.string",
  "type.rich_text_v2",
  "type.cta",
];

const MAPPING_CONSTANT_VALUE_LIST_TYPES: EntityFieldTypes[] = ["type.string"];

function shouldEnableMappingConstantValue(
  field: EntityFieldSelectorField<any>
): boolean {
  const constantValueFilter = field.constantValueFilter ?? field.filter;

  return (
    !!constantValueFilter.types?.length &&
    constantValueFilter.types.every((entityFieldType) =>
      (constantValueFilter.includeListsOnly
        ? MAPPING_CONSTANT_VALUE_LIST_TYPES
        : MAPPING_CONSTANT_VALUE_TYPES
      ).includes(entityFieldType)
    )
  );
}

function inferEntityFieldConstantValue(
  field: EntityFieldSelectorField<any>
): unknown {
  const allowsListValues = !!field.filter.includeListsOnly;

  if (allowsListValues) {
    return [];
  }

  return undefined;
}

/**
 * Creates the default authored value for one item field.
 */
export function getDefaultValueForField(
  field: YextFieldDefinition<any>,
  constantValueEnabled: boolean
): unknown {
  if (isEntityFieldDefinition(field)) {
    return {
      field: "",
      constantValueEnabled: field.disableConstantValueToggle
        ? false
        : constantValueEnabled,
      constantValue: inferEntityFieldConstantValue(field),
    };
  }

  if (field.type === "object" && "objectFields" in field) {
    return Object.fromEntries(
      Object.entries(field.objectFields).map(([key, nestedField]) => [
        key,
        getDefaultValueForField(
          nestedField as YextFieldDefinition<any>,
          constantValueEnabled
        ),
      ])
    );
  }

  if (field.type === "array") {
    return [];
  }

  return undefined;
}

function getNestedItemSourceTypes(
  field: YextFieldDefinition<any>
): EntityFieldTypes[][] {
  if (isEntityFieldDefinition(field)) {
    return field.filter.types?.length ? [field.filter.types] : [];
  }

  if (field.type === "object" && "objectFields" in field) {
    return Object.values(field.objectFields).flatMap((nestedField) =>
      getNestedItemSourceTypes(nestedField as YextFieldDefinition<any>)
    );
  }

  if (field.type === "array" && "arrayFields" in field) {
    return Object.values(field.arrayFields).flatMap((nestedField) =>
      getNestedItemSourceTypes(nestedField as YextFieldDefinition<any>)
    );
  }

  return [];
}
