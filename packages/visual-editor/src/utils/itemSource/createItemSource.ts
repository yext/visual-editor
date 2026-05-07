import { type DefaultComponentProps } from "@puckeditor/core";
import {
  toPuckFields,
  type YextFieldDefinition,
  type YextFieldMap,
} from "../../fields/fields.ts";
import { type ItemSource } from "../../fields/ItemSourceField.tsx";
import { type StreamDocument } from "../types/StreamDocument.ts";
import {
  createItemSourceField,
  getDefaultLabel,
  getDefaultValueForField,
  getManualItemField,
  getMappingItemField,
} from "./itemSourceFieldTransforms.ts";
import {
  type CreateItemSourceOptions,
  type ItemSourceInstance,
  type ResolvedItemField,
} from "./itemSourceTypes.ts";
import { resolveItemValue } from "./itemSourceResolution.ts";

/**
 * Item-source assembly.
 *
 * 1. Builds the parent `itemSource` field and shared mapping fields from one
 *    item schema.
 * 2. Generates default props for linked mode and inline manual items.
 * 3. Exposes editor-time helpers for showing mappings when linked mode is
 *    active.
 * 4. Resolves linked or manual items into render-ready values without writing
 *    derived data back onto component props.
 */
export function createItemSource<
  TProps extends DefaultComponentProps,
  TItem extends Record<string, unknown>,
>({
  sourcePath,
  mappingsPath,
  sourceLabel = getDefaultLabel(sourcePath),
  mappingsLabel = getDefaultLabel(mappingsPath),
  mappingFields,
}: CreateItemSourceOptions<TItem>): ItemSourceInstance<TProps, TItem> {
  // Build the two editor-facing field variants from one item schema:
  // linked shared mappings stay source-scoped, while manual items stay local.
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

  // Reuse those shaped fields to assemble the parent source control, the
  // mapping object field, and the authored default props for both modes.
  const itemSourceField = createItemSourceField(
    sourcePath,
    mappingsPath,
    sourceLabel,
    scopedItemFields,
    manualItemFields
  );
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
    fields: toPuckFields(rawFields),
    defaultProps,
    resolveFields: (data) => {
      const itemSource = getPathValue<ItemSource<TItem>>(
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
      );
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

      const resolvedSourceItems = resolveItemValue(
        {
          type: "entityField",
          label: sourceLabel,
          filter: { itemSourceTypes: [] },
        } as YextFieldDefinition<any>,
        {
          field: itemSource.field,
          constantValue: itemSource.constantValue,
          constantValueEnabled: false,
        },
        streamDocument
      );

      if (!Array.isArray(resolvedSourceItems)) {
        return [];
      }

      return resolvedSourceItems.map((itemDocument) =>
        Object.fromEntries(
          Object.entries(scopedItemFields).map(([key, field]) => [
            key,
            resolveItemValue(
              field as YextFieldDefinition<any>,
              itemMappings?.[key as keyof TItem],
              streamDocument,
              itemDocument as StreamDocument
            ),
          ])
        )
      ) as ResolvedItemField<TItem>[];
    },
  };
}

/**
 * Shared tree/path helpers used by the public `createItemSource(...)`
 * entrypoint above.
 */

/**
 * Builds the nested field-definition tree that Puck expects for a dotted props
 * path like `articleSource` or `articleMappings.title`.
 */
function buildNestedFieldTree(
  path: string,
  field: YextFieldDefinition<any>
): Record<string, YextFieldDefinition<any>> {
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
}

/**
 * Builds the nested value object that matches a dotted props path.
 */
function buildNestedValueTree(
  path: string,
  value: unknown
): Record<string, unknown> {
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
}

/**
 * Deep-merges two plain-object trees while preserving non-object leaf values.
 */
function mergeTrees<
  TTree extends Record<string, unknown>,
  TOtherTree extends Record<string, unknown>,
>(tree: TTree, otherTree: TOtherTree): TTree & TOtherTree {
  return Object.entries(otherTree).reduce(
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
}

/**
 * Reads a dotted path out of an unknown value tree.
 */
function getPathValue<T>(value: unknown, path: string): T | undefined {
  let currentValue: unknown = value;

  for (const segment of path.split(".")) {
    if (!segment || !currentValue || typeof currentValue !== "object") {
      return undefined;
    }

    currentValue = (currentValue as Record<string, unknown>)[segment];
  }

  return currentValue as T | undefined;
}
