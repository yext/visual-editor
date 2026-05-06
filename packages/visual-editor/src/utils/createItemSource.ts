import { type DefaultComponentProps, type Fields } from "@puckeditor/core";
import { type YextEntityField } from "../editor/YextEntityFieldSelector.tsx";
import {
  toPuckFields,
  type YextFieldDefinition,
  type YextFieldMap,
} from "../fields/fields.ts";
import {
  returnConstantFieldConfig,
  type EntityFieldSelectorField,
} from "../fields/EntityFieldSelectorField.tsx";
import {
  type ItemSourceField,
  type ItemSourceValue,
} from "../fields/ItemSourceField.tsx";
import { type EntityFieldTypes } from "../internal/utils/getFilteredEntityFields.ts";
import {
  resolveYextEntityField,
  resolveField,
} from "./resolveYextEntityField.ts";
import { type StreamDocument } from "./types/StreamDocument.ts";

export type CreateItemSourceOptions<TItem extends Record<string, unknown>> = {
  sourcePath: string;
  mappingsPath: string;
  sourceLabel?: string;
  mappingsLabel?: string;
  mappingFields: YextFieldMap<TItem>;
};

type ResolvedItemField<TValue> =
  TValue extends YextEntityField<infer TResolved>
    ? TResolved | undefined
    : TValue extends Array<infer TItem>
      ? ResolvedItemField<TItem>[]
      : TValue extends Record<string, unknown>
        ? { [TKey in keyof TValue]: ResolvedItemField<TValue[TKey]> }
        : TValue;

export type ItemSourceInstance<
  TProps extends DefaultComponentProps,
  TItem extends Record<string, unknown>,
> = {
  fields: Fields<TProps>;
  defaultProps: Partial<TProps>;
  resolveFields: (data: { props: Record<string, unknown> }) => Fields<TProps>;
  resolveItems: (
    itemSource: ItemSourceValue<TItem> | undefined,
    itemMappings: TItem | undefined,
    streamDocument: StreamDocument
  ) => ResolvedItemField<TItem>[];
};

/**
 * Builds the nested field-definition tree that Puck expects for a dotted props
 * path like `articleSource` or `articleMappings.title`.
 */
const buildNestedFieldTree = (
  path: string,
  field: YextFieldDefinition<any>
): Record<string, YextFieldDefinition<any>> => {
  const [segment, ...rest] = path.split(".");
  if (!segment) {
    return {};
  }

  if (!rest.length) {
    return { [segment]: field };
  }

  return {
    [segment]: {
      type: "object",
      visible: false,
      objectFields: buildNestedFieldTree(rest.join("."), field),
    },
  };
};

/**
 * Builds the nested value object that matches a dotted props path.
 */
const buildNestedValueTree = (
  path: string,
  value: unknown
): Record<string, unknown> => {
  const [segment, ...rest] = path.split(".");
  if (!segment) {
    return {};
  }

  if (!rest.length) {
    return { [segment]: value };
  }

  return {
    [segment]: buildNestedValueTree(rest.join("."), value),
  };
};

/**
 * Deep-merges two plain-object trees while preserving non-object leaf values.
 */
const mergeTrees = <
  TTree extends Record<string, unknown>,
  TOtherTree extends Record<string, unknown>,
>(
  tree: TTree,
  otherTree: TOtherTree
): TTree & TOtherTree =>
  Object.entries(otherTree).reduce(
    (mergedTree, [key, value]) => {
      const existingValue = mergedTree[key];
      mergedTree[key] =
        existingValue &&
        value &&
        typeof existingValue === "object" &&
        typeof value === "object" &&
        !Array.isArray(existingValue) &&
        !Array.isArray(value)
          ? mergeTrees(
              existingValue as Record<string, unknown>,
              value as Record<string, unknown>
            )
          : value;

      return mergedTree;
    },
    { ...tree } as Record<string, unknown>
  ) as TTree & TOtherTree;

/**
 * Reads a dotted path out of an unknown value tree.
 */
const getPathValue = <T>(value: unknown, path: string): T | undefined => {
  let currentValue: unknown = value;

  for (const segment of path.split(".")) {
    if (!segment || !currentValue || typeof currentValue !== "object") {
      return undefined;
    }

    currentValue = (currentValue as Record<string, unknown>)[segment];
  }

  return currentValue as T | undefined;
};

/**
 * Derives a human-readable fallback label from a dotted props path.
 */
const getDefaultLabel = (path: string): string => {
  const lastSegment = path.split(".").at(-1);
  if (!lastSegment) {
    return path;
  }

  return lastSegment
    .replace(/^[_-]+/, "")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (value) => value.toUpperCase());
};

/**
 * Narrows a generic field definition to the entity-field variant used for
 * source-relative mapping and manual constants.
 */
const isEntityFieldDefinition = (
  field: YextFieldDefinition<any>
): field is EntityFieldSelectorField<any> => field.type === "entityField";

const MAPPING_CONSTANT_VALUE_TYPES: EntityFieldTypes[] = [
  "type.string",
  "type.rich_text_v2",
  "type.cta",
];

const MAPPING_CONSTANT_VALUE_LIST_TYPES: EntityFieldTypes[] = ["type.string"];

/**
 * Returns whether a linked mapping field should expose constant-value mode.
 * Mappings default to authored constants only for field editors that can
 * meaningfully author embedded content, such as strings, rich text, and CTAs.
 */
const shouldEnableMappingConstantValue = (
  field: EntityFieldSelectorField<any>
): boolean => {
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
};

/**
 * Infers the default constant value shape that matches an entity field's
 * configured filter and translation behavior.
 */
const inferEntityFieldConstantValue = (
  field: EntityFieldSelectorField<any>
): unknown => {
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
};

/**
 * Creates the authored default value for one item field in either shared
 * mapping mode or manual-item mode.
 */
const getDefaultValueForField = (
  field: YextFieldDefinition<any>,
  constantValueEnabled: boolean
): unknown => {
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
};

/**
 * Applies item-mapping defaults before the same schema is reused for manual
 * items and source-relative linked mappings.
 */
const getMappingItemField = <TValue>(
  field: YextFieldDefinition<TValue>,
  itemSourcePath: string
): YextFieldDefinition<TValue> => {
  const sourceScopedField = applySourceFieldPath(field, itemSourcePath);

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
};

/**
 * Removes mapping-only entity-field restrictions from the manual item editor
 * so authored fallback items can still use constant values.
 */
const getManualItemField = <TValue>(
  field: YextFieldDefinition<TValue>
): YextFieldDefinition<TValue> => {
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
};

/**
 * Propagates the parent item source path into nested entity fields so linked
 * mode resolves them relative to each source item by default.
 */
const applySourceFieldPath = <TValue>(
  field: YextFieldDefinition<TValue>,
  itemSourcePath: string
): YextFieldDefinition<TValue> => {
  if (isEntityFieldDefinition(field)) {
    return {
      ...field,
      sourceFieldPath: field.sourceFieldPath ?? itemSourcePath,
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
            itemSourcePath
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
            itemSourcePath
          ),
        ])
      ),
    } as YextFieldDefinition<TValue>;
  }

  return field;
};

/**
 * Collects the entity-field type filters that the parent item source picker
 * must satisfy for linked mode to be valid.
 */
const getNestedItemSourceTypes = (
  field: YextFieldDefinition<any>
): EntityFieldTypes[][] => {
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
};

const getItemSourceTypes = (
  itemFields: YextFieldMap<Record<string, unknown>>
): EntityFieldTypes[][] =>
  (Object.values(itemFields) as YextFieldDefinition<any>[]).flatMap(
    getNestedItemSourceTypes
  );

/**
 * Resolves one item field into its render-ready value using the current source
 * item for mapped entity fields.
 */
const resolveItemValue = <TValue>(
  field: YextFieldDefinition<TValue>,
  value: unknown,
  streamDocument: StreamDocument,
  itemDocument?: StreamDocument
): ResolvedItemField<TValue> => {
  if (isEntityFieldDefinition(field)) {
    const entityField = value as Partial<YextEntityField<unknown>> | undefined;
    if (!entityField?.constantValueEnabled && !entityField?.field) {
      return undefined as ResolvedItemField<TValue>;
    }

    return resolveYextEntityField(
      itemDocument ?? streamDocument,
      {
        field: entityField?.field ?? "",
        constantValue: entityField?.constantValue,
        constantValueEnabled: entityField?.constantValueEnabled,
      },
      streamDocument.locale
    ) as ResolvedItemField<TValue>;
  }

  if (field.type === "object" && "objectFields" in field) {
    const objectValue =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

    return Object.fromEntries(
      Object.entries(field.objectFields).map(([key, nestedField]) => [
        key,
        resolveItemValue(
          nestedField as YextFieldDefinition<any>,
          objectValue[key],
          streamDocument,
          itemDocument
        ),
      ])
    ) as ResolvedItemField<TValue>;
  }

  if (
    field.type === "array" &&
    "arrayFields" in field &&
    Array.isArray(value)
  ) {
    return value.map((item) =>
      Object.fromEntries(
        Object.entries(field.arrayFields).map(([key, nestedField]) => [
          key,
          resolveItemValue(
            nestedField as YextFieldDefinition<any>,
            item?.[key],
            streamDocument,
            itemDocument
          ),
        ])
      )
    ) as ResolvedItemField<TValue>;
  }

  return value as ResolvedItemField<TValue>;
};

/**
 * Creates the authored-state contract for a list-backed component.
 *
 * 1. Builds the parent `itemSource` field and shared mapping fields from one
 *    item schema.
 * 2. Generates default props for linked mode and inline manual items.
 * 3. Exposes editor-time helpers for showing mappings when linked mode is
 *    active.
 * 4. Resolves linked or manual items into render-ready values without writing
 *    derived data back onto component props.
 */
export const createItemSource = <
  TProps extends DefaultComponentProps,
  TItem extends Record<string, unknown>,
>({
  sourcePath,
  mappingsPath,
  sourceLabel = getDefaultLabel(sourcePath),
  mappingsLabel = getDefaultLabel(mappingsPath),
  mappingFields,
}: CreateItemSourceOptions<TItem>): ItemSourceInstance<TProps, TItem> => {
  const scopedItemFields = Object.fromEntries(
    Object.entries(mappingFields).map(([key, field]) => [
      key,
      getMappingItemField(field as YextFieldDefinition<any>, sourcePath),
    ])
  ) as YextFieldMap<TItem>;
  const manualItemFields = Object.fromEntries(
    Object.entries(scopedItemFields).map(([key, field]) => [
      key,
      getManualItemField(field as YextFieldDefinition<any>),
    ])
  ) as YextFieldMap<TItem>;
  const itemSourceField: ItemSourceField<any, TItem> = {
    type: "itemSource",
    label: sourceLabel,
    itemSourcePath: sourcePath,
    itemMappingsPath: mappingsPath,
    filter: {
      itemSourceTypes: getItemSourceTypes(
        scopedItemFields as YextFieldMap<Record<string, unknown>>
      ),
    },
    itemFields: manualItemFields,
    defaultItemValue: Object.fromEntries(
      Object.entries(manualItemFields).map(([key, field]) => [
        key,
        getDefaultValueForField(field as YextFieldDefinition<any>, true),
      ])
    ) as TItem,
  };
  const itemMappingsField: YextFieldDefinition<any> = {
    type: "object",
    label: mappingsLabel,
    visible: false,
    objectFields: scopedItemFields,
  };
  const rawFields = mergeTrees(
    buildNestedFieldTree(
      sourcePath,
      itemSourceField as unknown as YextFieldDefinition<any>
    ),
    buildNestedFieldTree(mappingsPath, itemMappingsField)
  ) as YextFieldMap<TProps>;
  const defaultItemValue = itemSourceField.defaultItemValue;
  const defaultProps = mergeTrees(
    buildNestedValueTree(sourcePath, {
      field: "",
      constantValueEnabled: true,
      constantValue: [defaultItemValue],
    }),
    buildNestedValueTree(
      mappingsPath,
      Object.fromEntries(
        Object.entries(scopedItemFields).map(([key, field]) => [
          key,
          getDefaultValueForField(field as YextFieldDefinition<any>, false),
        ])
      )
    )
  ) as Partial<TProps>;

  return {
    fields: toPuckFields(rawFields) as Fields<TProps>,
    defaultProps,
    resolveFields: (data) => {
      const itemSource = getPathValue<ItemSourceValue<TItem>>(
        data.props,
        sourcePath
      );

      return toPuckFields(
        mergeTrees(
          rawFields as Record<string, unknown>,
          buildNestedFieldTree(mappingsPath, {
            ...itemMappingsField,
            visible: !itemSource?.constantValueEnabled && !!itemSource?.field,
          })
        ) as YextFieldMap<any>
      ) as Fields<TProps>;
    },
    resolveItems: (itemSource, itemMappings, streamDocument) => {
      if (!itemSource) {
        return [];
      }

      if (itemSource.constantValueEnabled || !itemSource.field) {
        return (itemSource.constantValue ?? []).map((item) =>
          Object.fromEntries(
            Object.entries(scopedItemFields).map(([key, field]) => [
              key,
              resolveItemValue(
                field as YextFieldDefinition<any>,
                item?.[key as keyof TItem],
                streamDocument
              ),
            ])
          )
        ) as ResolvedItemField<TItem>[];
      }

      const resolvedSource = resolveField<unknown>(
        streamDocument,
        itemSource.field
      ).value;

      if (!Array.isArray(resolvedSource)) {
        return [];
      }

      return resolvedSource.map((item) =>
        Object.fromEntries(
          Object.entries(scopedItemFields).map(([key, field]) => [
            key,
            resolveItemValue(
              field as YextFieldDefinition<any>,
              itemMappings?.[key as keyof TItem],
              streamDocument,
              item && typeof item === "object"
                ? (item as StreamDocument)
                : undefined
            ),
          ])
        )
      ) as ResolvedItemField<TItem>[];
    },
  };
};
