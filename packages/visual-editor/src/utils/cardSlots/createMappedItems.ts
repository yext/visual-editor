import {
  type ComponentData,
  type DefaultComponentProps,
  type Fields,
  setDeep,
} from "@puckeditor/core";
import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { type YextFieldDefinition } from "../../editor/YextField.tsx";
import { type EntityFieldSelectorField } from "../../fields/EntityFieldSelectorField.tsx";
import { toPuckFields, type YextFieldMap } from "../../fields/fields.ts";
import {
  type EntityFieldTypes,
  type RenderEntityFieldFilter,
} from "../../internal/utils/getFilteredEntityFields.ts";
import { type StreamDocument } from "../types/StreamDocument.ts";
import { buildListSectionCards } from "./listSectionData.ts";
import { syncConstantValueListCards } from "./mappedListWrapper.ts";
import {
  type MappedSourceFieldFilter,
  resolveMappedListSource,
  resolveMappedSourceField,
} from "./mappedSource.ts";

type MappedItemFieldConfig = {
  label: string;
  types: EntityFieldTypes[];
  defaultValue: unknown;
  disableConstantValueToggle?: boolean;
  disallowTranslation?: boolean;
  filter?: Omit<RenderEntityFieldFilter<any>, "types">;
};

type CreateMappedItemsOptions = {
  sourceFieldPath: string;
  mappingGroupPath: string;
  sourceLabel?: string;
  mappingGroupLabel?: string;
  mappings: Record<string, MappedItemFieldConfig>;
};

type WithConstantValueModeOptions = {
  constantValueType: EntityFieldTypes;
  defaultConstantValue?: { id?: string }[];
};

type ResolveMappedItemsParams = {
  lastData: { props: Record<string, unknown> } | null;
  metadata?: {
    streamDocument?: StreamDocument;
  };
};

type ResolveItemsOptions<
  TProps extends DefaultComponentProps,
  TItemProps extends DefaultComponentProps,
> = {
  slotPath: string;
  createItem: (
    id: string,
    index: number | undefined,
    existingItem?: ComponentData<TItemProps>
  ) => ComponentData<TItemProps>;
  getItemData: (
    item: StreamDocument,
    data: ComponentData<TProps>,
    index: number
  ) => unknown;
};

type MappedItemsResolveResult<
  TProps extends DefaultComponentProps = DefaultComponentProps,
> = {
  data: ComponentData<TProps>;
  items: StreamDocument[];
};

type MappedItemsInstance<TProps extends DefaultComponentProps> = {
  fields: Fields<TProps>;
  defaultProps: Partial<TProps>;
  resolveFields: (data: { props: Record<string, unknown> }) => Fields<TProps>;
  resolve: (
    data: { props: Record<string, unknown> },
    params: ResolveMappedItemsParams
  ) => MappedItemsResolveResult<TProps>;
  resolveMapping: <T>(
    entityField: Partial<YextEntityField<T>> | undefined,
    item: StreamDocument,
    locale?: string
  ) => T | undefined;
  withConstantValueMode: (
    options: WithConstantValueModeOptions
  ) => MappedItemsInstance<TProps>;
  withRepeatedSlot: <TItemProps extends DefaultComponentProps>(
    options: ResolveItemsOptions<TProps, TItemProps>
  ) => MappedItemsInstance<TProps> & {
    resolveItems: (
      data: { props: Record<string, unknown> },
      params: ResolveMappedItemsParams
    ) => MappedItemsResolveResult<TProps>;
  };
};

/**
 * Builds a nested hidden object tree so dotted prop paths can be emitted as
 * normal Puck field definitions.
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
 * Builds a nested object value for a dotted prop path.
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
 * Deep-merges two plain object trees while preserving non-object leaves from
 * the incoming tree.
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
 * Reads a nested property from an unknown object using a dotted path.
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
 * Writes a nested prop path on Puck component data without mutating the input.
 */
const setPathValue = <T extends DefaultComponentProps>(
  value: ComponentData<T>,
  path: string,
  nextValue: unknown
): ComponentData<T> =>
  setDeep(value, `props.${path}`, nextValue) as ComponentData<T>;

/**
 * Returns the active mapped source path when the wrapper is in linked-field
 * mode, or `undefined` when constant/manual mode is active.
 */
const getScopedSourceFieldPath = (
  sourceField: Partial<YextEntityField<unknown>> | undefined
): string | undefined =>
  sourceField?.constantValueEnabled || !sourceField?.field
    ? undefined
    : sourceField.field;

/**
 * Clears scoped mapping field bindings when the selected mapped source changes
 * so saved relative paths are not silently reinterpreted against a new source.
 */
const clearMappingFieldsOnSourceChange = <TProps extends DefaultComponentProps>(
  data: ComponentData<TProps>,
  lastData: { props: Record<string, unknown> } | null,
  sourceGroupPath: string,
  mappingGroupPath: string,
  mappingKeys: string[]
): ComponentData<TProps> => {
  const sourceField = getPathValue<Partial<YextEntityField<unknown>>>(
    data.props,
    sourceGroupPath
  );
  const lastSourceField = getPathValue<Partial<YextEntityField<unknown>>>(
    lastData?.props,
    sourceGroupPath
  );

  if (
    sourceField?.constantValueEnabled ||
    !lastData ||
    lastSourceField?.field === sourceField?.field
  ) {
    return data;
  }

  const mappingGroup = getPathValue<Record<string, unknown>>(
    data.props,
    mappingGroupPath
  );
  if (!mappingGroup || typeof mappingGroup !== "object") {
    return data;
  }

  return {
    ...data,
    props: mergeTrees(
      data.props,
      buildNestedValueTree(
        mappingGroupPath,
        Object.fromEntries(
          mappingKeys.map((mappingKey) => {
            const mappingValue = mappingGroup[mappingKey];
            return [
              mappingKey,
              mappingValue && typeof mappingValue === "object"
                ? { ...mappingValue, field: "" }
                : mappingValue,
            ];
          })
        )
      )
    ) as TProps,
  } as ComponentData<TProps>;
};

/**
 * Turns a dotted config path into a readable fallback label.
 */
const getDefaultLabel = (path: string): string =>
  path
    .split(".")
    .at(-1)
    ?.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (value) => value.toUpperCase()) ?? path;

/**
 * Derives the mapped-source compatibility requirements directly from the
 * declared mapping field types.
 */
const getMappedSourceTypes = (
  mappings: Record<string, MappedItemFieldConfig>
): EntityFieldTypes[][] =>
  Object.values(mappings).map((mapping) => mapping.types);

/**
 * Builds the shared mapped-items field configuration and runtime behavior.
 *
 * 1. Generate the source `entityField` and scoped mapping fields.
 * 2. Provide blank default values for the mapped-items subtree.
 * 3. Toggle mapping visibility from the selected source.
 * 4. Clear scoped mapping field bindings when the source changes.
 * 5. Resolve mapped source items and per-item field values.
 */
const buildMappedItems = <TProps extends DefaultComponentProps>({
  sourceFieldPath,
  mappingGroupPath,
  sourceLabel = getDefaultLabel(sourceFieldPath),
  mappingGroupLabel = getDefaultLabel(mappingGroupPath),
  mappings,
  constantValueMode,
}: CreateMappedItemsOptions & {
  constantValueMode?: WithConstantValueModeOptions;
}): MappedItemsInstance<TProps> => {
  const sourceGroupPath = sourceFieldPath.endsWith(".field")
    ? sourceFieldPath.slice(0, -".field".length)
    : sourceFieldPath;
  const mappingFieldKeys = Object.keys(mappings);
  const mappedSourceTypes = getMappedSourceTypes(mappings);
  const sourceField: EntityFieldSelectorField<any> = {
    label: sourceLabel,
    type: "entityField",
    filter: {
      mappedSourceTypes,
    } as MappedSourceFieldFilter<any>,
    disableConstantValueToggle: !constantValueMode,
    constantValueFilter: constantValueMode
      ? {
          types: [constantValueMode.constantValueType],
        }
      : undefined,
  };
  const mappingGroupField: YextFieldDefinition<any> = {
    label: mappingGroupLabel,
    type: "object",
    visible: false,
    objectFields: Object.fromEntries(
      Object.entries(mappings).map(([mappingKey, mappingConfig]) => [
        mappingKey,
        {
          label: mappingConfig.label,
          type: "entityField",
          sourceFieldPath,
          disableConstantValueToggle: mappingConfig.disableConstantValueToggle,
          disallowTranslation: mappingConfig.disallowTranslation,
          filter: {
            ...mappingConfig.filter,
            types: mappingConfig.types,
          },
        },
      ])
    ) as YextFieldMap<any>,
  };
  const rawFields = mergeTrees(
    buildNestedFieldTree(sourceGroupPath, sourceField),
    buildNestedFieldTree(mappingGroupPath, mappingGroupField)
  ) as YextFieldMap<TProps>;
  const defaultProps = mergeTrees(
    buildNestedValueTree(sourceGroupPath, {
      field: "",
      constantValueEnabled: !!constantValueMode,
      constantValue: constantValueMode?.defaultConstantValue ?? [],
    }),
    buildNestedValueTree(
      mappingGroupPath,
      Object.fromEntries(
        Object.entries(mappings).map(([mappingKey, mappingConfig]) => [
          mappingKey,
          {
            field: "",
            constantValueEnabled: false,
            constantValue: mappingConfig.defaultValue,
          },
        ])
      )
    )
  ) as Partial<TProps>;

  const mappedItems: MappedItemsInstance<TProps> = {
    fields: toPuckFields(rawFields as YextFieldMap<any>) as Fields<TProps>,
    defaultProps,
    resolveFields: (data: {
      props: Record<string, unknown>;
    }): Fields<TProps> => {
      const sourceFieldValue = getPathValue<Partial<YextEntityField<unknown>>>(
        data.props,
        sourceGroupPath
      );

      return toPuckFields(
        mergeTrees(
          rawFields as Record<string, unknown>,
          buildNestedFieldTree(mappingGroupPath, {
            ...mappingGroupField,
            visible: !!getScopedSourceFieldPath(sourceFieldValue),
          })
        ) as YextFieldMap<any>
      ) as Fields<TProps>;
    },
    resolve: (
      data: { props: Record<string, unknown> },
      params: ResolveMappedItemsParams
    ): MappedItemsResolveResult<TProps> => {
      const nextData = clearMappingFieldsOnSourceChange(
        data as ComponentData<TProps>,
        params.lastData,
        sourceGroupPath,
        mappingGroupPath,
        mappingFieldKeys
      );
      const sourceFieldValue = getPathValue<Partial<YextEntityField<unknown>>>(
        nextData.props,
        sourceGroupPath
      );

      return {
        data: nextData,
        items: resolveMappedListSource<StreamDocument>({
          streamDocument: params.metadata?.streamDocument ?? {},
          constantValueEnabled: sourceFieldValue?.constantValueEnabled,
          fieldPath: sourceFieldValue?.field,
        }).items,
      };
    },
    resolveMapping: <T>(
      entityField: Partial<YextEntityField<T>> | undefined,
      item: StreamDocument,
      locale?: string
    ): T | undefined => resolveMappedSourceField(item, entityField, locale),
    /**
     * Enables wrapper-level constant/manual repeated-content mode while keeping
     * the mapped-items field structure unchanged.
     */
    withConstantValueMode: (options: WithConstantValueModeOptions) =>
      buildMappedItems<TProps>({
        sourceFieldPath,
        mappingGroupPath,
        sourceLabel,
        mappingGroupLabel,
        mappings,
        constantValueMode: options,
      }),
    /**
     * Connects mapped items to a repeated Puck slot, automatically syncing slot
     * children, `index`, and `itemData` from the resolved source items.
     */
    withRepeatedSlot: <TItemProps extends DefaultComponentProps>(
      options: ResolveItemsOptions<TProps, TItemProps>
    ) => {
      const resolveItems = (
        data: { props: Record<string, unknown> },
        params: ResolveMappedItemsParams
      ): MappedItemsResolveResult<TProps> => {
        const resolved = clearMappingFieldsOnSourceChange(
          data as ComponentData<TProps>,
          params.lastData,
          sourceGroupPath,
          mappingGroupPath,
          mappingFieldKeys
        );
        const sourceFieldValue = getPathValue<
          Partial<YextEntityField<unknown>>
        >(resolved.props, sourceGroupPath);
        const items = resolveMappedListSource<StreamDocument>({
          streamDocument: params.metadata?.streamDocument ?? {},
          constantValueEnabled: sourceFieldValue?.constantValueEnabled,
          fieldPath: sourceFieldValue?.field,
        }).items;
        const currentItems =
          getPathValue<ComponentData<TItemProps>[]>(
            resolved.props,
            options.slotPath
          ) ?? [];
        const existingItem = currentItems[0];

        if (
          constantValueMode &&
          (sourceFieldValue?.constantValueEnabled || !sourceFieldValue?.field)
        ) {
          const syncedItems = syncConstantValueListCards({
            currentCards: currentItems,
            constantValue: sourceFieldValue?.constantValue as
              | { id?: string }[]
              | undefined,
            createId: () => `mapped-item-${crypto.randomUUID()}`,
            createCard: (id, index) =>
              options.createItem(id, index, existingItem),
            fallbackToIndex: true,
          });

          return {
            data: setPathValue(
              setPathValue(resolved, options.slotPath, syncedItems.slots),
              `${sourceGroupPath}.constantValue`,
              syncedItems.constantValue
            ),
            items: [],
          };
        }

        if (!items.length) {
          return {
            data: setPathValue(resolved, options.slotPath, []),
            items,
          };
        }

        return {
          data: setPathValue(
            resolved,
            options.slotPath,
            buildListSectionCards<TItemProps, StreamDocument>({
              currentCards: currentItems,
              createCard: () =>
                options.createItem(
                  `mapped-item-${crypto.randomUUID()}`,
                  undefined,
                  existingItem
                ),
              decorateCard: (itemComponent, item, index) =>
                setPathValue(
                  setPathValue(itemComponent, "index", index),
                  "itemData",
                  options.getItemData(item, resolved, index)
                ),
              items,
            })
          ),
          items,
        };
      };

      return {
        ...mappedItems,
        resolveItems,
      };
    },
  } satisfies MappedItemsInstance<TProps>;

  return mappedItems;
};

/**
 * Creates the shared mapped-items field model used by repeated linked-item
 * components. Consumers can use it directly, or opt into wrapper-level
 * constant mode and repeated-slot orchestration with the chained helpers.
 */
export const createMappedItems = <
  TProps extends DefaultComponentProps = DefaultComponentProps,
>(
  options: CreateMappedItemsOptions
): MappedItemsInstance<TProps> => buildMappedItems<TProps>(options);
