import { type DefaultComponentProps, type Fields } from "@puckeditor/core";
import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import {
  toPuckFields,
  type YextFieldDefinition,
  type YextFieldMap,
} from "../../fields/fields.ts";
import {
  returnConstantFieldConfig,
  type EntityFieldSelectorField,
} from "../../fields/EntityFieldSelectorField.tsx";
import {
  type ItemSourceField,
  type ItemSourceValue,
} from "../../fields/ItemSourceField.tsx";
import { type EntityFieldTypes } from "../../internal/utils/getFilteredEntityFields.ts";
import {
  resolveYextEntityField,
  resolveField,
} from "../resolveYextEntityField.ts";
import { type StreamDocument } from "../types/StreamDocument.ts";
import { type MappedSourceFieldFilter } from "../cardSlots/mappedSource.ts";

type NormalizeDataParams = {
  lastData: { props: Record<string, unknown> } | null;
};

type CreateItemSourceOptions<TItem extends Record<string, unknown>> = {
  itemSourcePath: string;
  itemMappingsPath: string;
  itemSourceLabel?: string;
  itemMappingsLabel?: string;
  itemFields: YextFieldMap<TItem>;
};

type ResolvedItemField<TValue> =
  TValue extends YextEntityField<infer TResolved>
    ? TResolved | undefined
    : TValue extends Array<infer TItem>
      ? ResolvedItemField<TItem>[]
      : TValue extends Record<string, unknown>
        ? { [TKey in keyof TValue]: ResolvedItemField<TValue[TKey]> }
        : TValue;

type ItemSourceInstance<
  TProps extends DefaultComponentProps,
  TItem extends Record<string, unknown>,
> = {
  fields: Fields<TProps>;
  defaultProps: Partial<TProps>;
  resolveFields: (data: { props: Record<string, unknown> }) => Fields<TProps>;
  normalizeData: <TData extends { props: Record<string, unknown> }>(
    data: TData,
    params: NormalizeDataParams
  ) => TData;
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
const getDefaultLabel = (path: string): string =>
  path
    .split(".")
    .at(-1)
    ?.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (value) => value.toUpperCase()) ?? path;

/**
 * Narrows a generic field definition to the entity-field variant used for
 * source-relative mapping and manual constants.
 */
const isEntityFieldDefinition = (
  field: YextFieldDefinition<any>
): field is EntityFieldSelectorField<any> => field.type === "entityField";

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

  if (field.type === "text" || field.type === "translatableString") {
    return "";
  }

  if (field.type === "radio" && "options" in field) {
    return field.options?.[0]?.value;
  }

  return undefined;
};

/**
 * Propagates the parent item source path into nested entity fields so linked
 * mode resolves them relative to each source item by default.
 */
const applySourceEntityPath = <TValue>(
  field: YextFieldDefinition<TValue>,
  itemSourcePath: string
): YextFieldDefinition<TValue> => {
  if (isEntityFieldDefinition(field)) {
    return {
      ...field,
      sourceEntityPath:
        field.sourceEntityPath === undefined
          ? itemSourcePath
          : field.sourceEntityPath,
    } as YextFieldDefinition<TValue>;
  }

  if (field.type === "object" && "objectFields" in field) {
    return {
      ...field,
      objectFields: Object.fromEntries(
        Object.entries(field.objectFields).map(([key, nestedField]) => [
          key,
          applySourceEntityPath(
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
          applySourceEntityPath(
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
const getItemSourceTypes = (
  itemFields: YextFieldMap<Record<string, unknown>>
): EntityFieldTypes[][] =>
  (Object.values(itemFields) as YextFieldDefinition<any>[]).flatMap((field) => {
    if (!isEntityFieldDefinition(field)) {
      return [];
    }

    return field.sourceEntityPath !== null && field.filter.types?.length
      ? [field.filter.types]
      : [];
  });

/**
 * Detects authored entity-field values so source changes can clear only the
 * linked field bindings while preserving constants.
 */
const isYextEntityFieldValue = (
  value: unknown
): value is Partial<YextEntityField<unknown>> =>
  !!value &&
  typeof value === "object" &&
  "field" in value &&
  "constantValue" in value;

/**
 * Recursively clears selected field paths from an authored mapping tree while
 * preserving any constants that the editor entered.
 */
const clearEntityFieldBindings = (value: unknown): unknown => {
  if (isYextEntityFieldValue(value)) {
    return {
      ...value,
      field: "",
    };
  }

  if (Array.isArray(value)) {
    return value.map(clearEntityFieldBindings);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        clearEntityFieldBindings(nestedValue),
      ])
    );
  }

  return value;
};

/**
 * Resolves one item field into its render-ready value using either the current
 * source item or the root stream document, depending on field scope.
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
    const resolutionDocument =
      field.sourceEntityPath && itemDocument ? itemDocument : streamDocument;

    return resolveYextEntityField(
      resolutionDocument,
      {
        field: entityField?.field ?? "",
        constantValue: entityField?.constantValue,
        constantValueEnabled: entityField?.constantValueEnabled,
      },
      streamDocument.locale ??
        streamDocument.meta?.locale ??
        streamDocument.__?.pathInfo?.primaryLocale
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
 * 3. Exposes editor-time helpers for showing mappings and clearing stale field
 *    bindings when the selected source changes.
 * 4. Resolves linked or manual items into render-ready values without writing
 *    derived data back onto component props.
 */
export const createItemSource = <
  TProps extends DefaultComponentProps,
  TItem extends Record<string, unknown>,
>({
  itemSourcePath,
  itemMappingsPath,
  itemSourceLabel = getDefaultLabel(itemSourcePath),
  itemMappingsLabel = getDefaultLabel(itemMappingsPath),
  itemFields,
}: CreateItemSourceOptions<TItem>): ItemSourceInstance<TProps, TItem> => {
  const scopedItemFields = Object.fromEntries(
    Object.entries(itemFields).map(([key, field]) => [
      key,
      applySourceEntityPath(field as YextFieldDefinition<any>, itemSourcePath),
    ])
  ) as YextFieldMap<TItem>;
  const itemSourceField = {
    type: "itemSource",
    label: itemSourceLabel,
    filter: {
      itemSourceTypes: getItemSourceTypes(
        scopedItemFields as YextFieldMap<Record<string, unknown>>
      ),
    } as MappedSourceFieldFilter<any>,
    itemFields: scopedItemFields,
    defaultItemValue: Object.fromEntries(
      Object.entries(scopedItemFields).map(([key, field]) => [
        key,
        getDefaultValueForField(field as YextFieldDefinition<any>, true),
      ])
    ) as TItem,
  } as ItemSourceField<any, TItem>;
  const itemMappingsField: YextFieldDefinition<any> = {
    type: "object",
    label: itemMappingsLabel,
    visible: false,
    objectFields: scopedItemFields,
  };
  const rawFields = mergeTrees(
    buildNestedFieldTree(
      itemSourcePath,
      itemSourceField as unknown as YextFieldDefinition<any>
    ),
    buildNestedFieldTree(itemMappingsPath, itemMappingsField)
  ) as YextFieldMap<TProps>;
  const defaultItemValue = itemSourceField.defaultItemValue;
  const defaultProps = mergeTrees(
    buildNestedValueTree(itemSourcePath, {
      field: "",
      constantValueEnabled: true,
      constantValue: [defaultItemValue],
    }),
    buildNestedValueTree(
      itemMappingsPath,
      Object.fromEntries(
        Object.entries(scopedItemFields).map(([key, field]) => [
          key,
          getDefaultValueForField(field as YextFieldDefinition<any>, false),
        ])
      )
    )
  ) as Partial<TProps>;

  return {
    fields: toPuckFields(rawFields as YextFieldMap<any>) as Fields<TProps>,
    defaultProps,
    resolveFields: (data) => {
      const itemSource = getPathValue<ItemSourceValue<TItem>>(
        data.props,
        itemSourcePath
      );

      return toPuckFields(
        mergeTrees(
          rawFields as Record<string, unknown>,
          buildNestedFieldTree(itemMappingsPath, {
            ...itemMappingsField,
            visible: !itemSource?.constantValueEnabled && !!itemSource?.field,
          })
        ) as YextFieldMap<any>
      ) as Fields<TProps>;
    },
    normalizeData: <TData extends { props: Record<string, unknown> }>(
      data: TData,
      params: NormalizeDataParams
    ) => {
      const itemSource = getPathValue<ItemSourceValue<TItem>>(
        data.props,
        itemSourcePath
      );
      const lastItemSource = getPathValue<ItemSourceValue<TItem>>(
        params.lastData?.props,
        itemSourcePath
      );

      if (
        itemSource?.constantValueEnabled ||
        !params.lastData ||
        lastItemSource?.field === itemSource?.field
      ) {
        return data;
      }

      const itemMappings = getPathValue<Record<string, unknown>>(
        data.props,
        itemMappingsPath
      );

      if (!itemMappings) {
        return data;
      }

      return {
        ...data,
        props: mergeTrees(
          data.props,
          buildNestedValueTree(
            itemMappingsPath,
            clearEntityFieldBindings(itemMappings)
          )
        ) as TData["props"],
      } as TData;
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
