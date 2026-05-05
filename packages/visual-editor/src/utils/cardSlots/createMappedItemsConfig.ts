import {
  type ComponentData,
  type DefaultComponentProps,
} from "@puckeditor/core";
import { type Fields } from "@puckeditor/core";
import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { type YextFieldDefinition } from "../../editor/YextField.tsx";
import { type EntityFieldSelectorField } from "../../fields/EntityFieldSelectorField.tsx";
import {
  toPuckFields,
  type YextFieldMap,
  type YextFields,
} from "../../fields/fields.ts";
import {
  type EntityFieldTypes,
  type RenderEntityFieldFilter,
} from "../../internal/utils/getFilteredEntityFields.ts";
import { type StreamDocument } from "../types/StreamDocument.ts";
import {
  type MappedSourceFieldFilter,
  resolveMappedListSource,
  resolveMappedSourceField,
  type SourceRootKind,
} from "./mappedSource.ts";

type MappedItemFieldConfig = {
  label: string;
  types: EntityFieldTypes[];
  defaultValue: unknown;
  disableConstantValueToggle?: boolean;
  disallowTranslation?: boolean;
  filter?: Omit<RenderEntityFieldFilter<any>, "types">;
};

type CreateMappedItemsConfigOptions = {
  sourceFieldPath: string;
  mappingGroupPath: string;
  sourceLabel: string;
  mappingGroupLabel: string;
  constantValueType: EntityFieldTypes;
  defaultConstantValue?: { id?: string }[];
  listFieldName?: string;
  sourceRootKinds?: SourceRootKind[];
  sourceRootsOnly?: boolean;
  requiredDescendantTypes?: EntityFieldTypes[][];
  mappings: Record<string, MappedItemFieldConfig>;
};

type MappedItemsValue = Omit<YextEntityField<unknown>, "constantValue"> & {
  constantValue: { id?: string }[];
};

type ResolveMappedItemsParams = {
  lastData: { props: Record<string, unknown> } | null;
  metadata?: {
    streamDocument?: StreamDocument;
  };
};

type MappedItemsResolveResult<
  TProps extends DefaultComponentProps = DefaultComponentProps,
> = {
  data: ComponentData<TProps>;
  items: StreamDocument[];
};

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

const getScopedSourceFieldPath = (
  sourceField: Partial<YextEntityField<unknown>> | undefined
): string | undefined =>
  sourceField?.constantValueEnabled || !sourceField?.field
    ? undefined
    : sourceField.field;

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
 * Creates the standard repeated-items field subtree and resolution behavior.
 *
 * 1. Generate the source `entityField` and scoped mapping fields.
 * 2. Provide blank default values for the repeated-items subtree.
 * 3. Toggle mapping visibility from the selected source.
 * 4. Clear scoped mapping field bindings when the source changes.
 * 5. Resolve repeated source items and per-item mapped values.
 */
export const createMappedItemsConfig = <
  TProps extends DefaultComponentProps = DefaultComponentProps,
>({
  sourceFieldPath,
  mappingGroupPath,
  sourceLabel,
  mappingGroupLabel,
  constantValueType,
  defaultConstantValue = [],
  listFieldName = "",
  sourceRootKinds = [],
  sourceRootsOnly = false,
  requiredDescendantTypes,
  mappings,
}: CreateMappedItemsConfigOptions) => {
  const sourceGroupPath = sourceFieldPath.endsWith(".field")
    ? sourceFieldPath.slice(0, -".field".length)
    : sourceFieldPath;
  const sourceField = {
    label: sourceLabel,
    type: "entityField",
    filter: {
      listFieldName,
      requiredDescendantTypes,
      sourceRootKinds,
      sourceRootsOnly,
    } as MappedSourceFieldFilter<any>,
    constantValueFilter: {
      types: [constantValueType],
    },
  } as EntityFieldSelectorField<MappedItemsValue>;
  const mappingFieldKeys = Object.keys(mappings);
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
  const fields = mergeTrees(
    buildNestedFieldTree(sourceGroupPath, sourceField),
    buildNestedFieldTree(mappingGroupPath, mappingGroupField)
  ) as YextFields<TProps> | YextFieldMap<TProps>;
  const defaultProps = mergeTrees(
    buildNestedValueTree(sourceGroupPath, {
      field: "",
      constantValueEnabled: true,
      constantValue: defaultConstantValue,
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

  return {
    fields,
    defaultProps,
    resolveFields: (data: ComponentData<TProps>): Fields<TProps> => {
      const sourceFieldValue = getPathValue<Partial<YextEntityField<unknown>>>(
        data.props,
        sourceGroupPath
      );

      return toPuckFields(
        mergeTrees(
          fields as Record<string, unknown>,
          buildNestedFieldTree(mappingGroupPath, {
            ...mappingGroupField,
            visible: !!getScopedSourceFieldPath(sourceFieldValue),
          })
        ) as YextFields<TProps> | YextFieldMap<TProps>
      );
    },
    resolve: (
      data: ComponentData<TProps>,
      params: ResolveMappedItemsParams
    ): MappedItemsResolveResult<TProps> => {
      const nextData = clearMappingFieldsOnSourceChange(
        data,
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
  };
};
