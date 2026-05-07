import {
  returnConstantFieldConfig,
  type EntityFieldSelectorField,
} from "../../fields/EntityFieldSelectorField.tsx";
import { type ItemSourceField } from "../../fields/ItemSourceField.tsx";
import {
  type YextFieldDefinition,
  type YextFieldMap,
} from "../../fields/fields.ts";
import { type EntityFieldTypes } from "../../internal/utils/getFilteredEntityFields.ts";
import { type MappedSourceFieldFilter } from "../cardSlots/mappedSource.ts";

/**
 * Authoring-time item-source field transforms.
 *
 * 1. Shape one repeated-item schema into linked-mapping and manual-item forms.
 * 2. Derive source-selector compatibility requirements from mapping fields.
 * 3. Build the parent `itemSource` field config consumed by `createItemSource(...)`.
 */

/**
 * Derives a human-readable fallback label from a dotted props path.
 */
export function getDefaultLabel(path: string): string {
  const lastSegment = path.split(".").at(-1);
  if (!lastSegment) {
    return path;
  }

  return lastSegment
    .replace(/^[_-]+/, "")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

/**
 * Applies linked-mapping defaults to one item field definition.
 */
export function getMappingItemField<TValue>(
  field: YextFieldDefinition<TValue>,
  sourcePath: string
): YextFieldDefinition<TValue> {
  const sourceScopedField = applySourceFieldPath(field, sourcePath);

  if (
    isEntityFieldDefinition(sourceScopedField) &&
    sourceScopedField.disableConstantValueToggle === undefined
  ) {
    return {
      ...sourceScopedField,
      disableConstantValueToggle:
        !shouldEnableMappingConstantValue(sourceScopedField),
    } as YextFieldDefinition<TValue>;
  }

  return sourceScopedField;
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
export function getItemSourceTypes(
  itemFields: YextFieldMap<Record<string, unknown>>
): EntityFieldTypes[][] {
  return (Object.values(itemFields) as YextFieldDefinition<any>[]).flatMap(
    getNestedItemSourceTypes
  );
}

/**
 * Builds the parent `itemSource` field config from linked and manual item
 * field variants.
 */
export function createItemSourceField<TItem extends Record<string, unknown>>(
  sourcePath: string,
  mappingsPath: string,
  sourceLabel: string,
  scopedItemFields: YextFieldMap<TItem>,
  manualItemFields: YextFieldMap<TItem>
): ItemSourceField<any, TItem> {
  return {
    type: "itemSource",
    label: sourceLabel,
    sourcePath,
    mappingsPath,
    filter: {
      itemSourceTypes: getItemSourceTypes(
        scopedItemFields as YextFieldMap<Record<string, unknown>>
      ),
    } as MappedSourceFieldFilter<any>,
    itemFields: manualItemFields,
    defaultItemValue: Object.fromEntries(
      Object.entries(manualItemFields).map(([key, field]) => [
        key,
        getDefaultValueForField(field as YextFieldDefinition<any>, true),
      ])
    ) as TItem,
  };
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

/**
 * Shared helpers used by the public transforms above.
 */

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
  const constantFieldConfig = returnConstantFieldConfig(
    field.filter.types,
    allowsListValues,
    !!field.disallowTranslation
  );

  if (allowsListValues) {
    return [];
  }

  if (!constantFieldConfig) {
    return undefined;
  }

  if (constantFieldConfig.type === "text") {
    return "";
  }

  if (constantFieldConfig.type === "translatableString") {
    return { defaultValue: "" };
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

  if (field.type === "text") {
    return "";
  }

  if (field.type === "translatableString") {
    return { defaultValue: "" };
  }

  if (field.type === "radio" && "options" in field) {
    return field.options?.[0]?.value;
  }

  return undefined;
}

function applySourceFieldPath<TValue>(
  field: YextFieldDefinition<TValue>,
  sourcePath: string
): YextFieldDefinition<TValue> {
  if (isEntityFieldDefinition(field)) {
    return {
      ...field,
      sourceFieldPath: field.sourceFieldPath ?? sourcePath,
    } as YextFieldDefinition<TValue>;
  }

  if (field.type === "object" && "objectFields" in field) {
    return {
      ...field,
      objectFields: Object.fromEntries(
        Object.entries(field.objectFields).map(([key, nestedField]) => [
          key,
          applySourceFieldPath(
            nestedField as YextFieldDefinition<any>,
            sourcePath
          ),
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
          applySourceFieldPath(
            nestedField as YextFieldDefinition<any>,
            sourcePath
          ),
        ])
      ),
    } as YextFieldDefinition<TValue>;
  }

  return field;
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
