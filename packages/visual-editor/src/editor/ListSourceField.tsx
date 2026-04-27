import * as React from "react";
import { type CustomField, type Field } from "@puckeditor/core";
import { type BasicSelectorField } from "../fields/BasicSelectorField.tsx";
import { YextAutoField } from "../fields/YextAutoField.tsx";
import { useDocument } from "../hooks/useDocument.tsx";
import { useEntityFields } from "../hooks/useEntityFields.tsx";
import { useLinkedEntitySchemas } from "../hooks/useLinkedEntitySchemas.tsx";
import { useTemplateMetadata } from "../internal/hooks/useMessageReceivers.ts";
import { type RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";
import { pt, type MsgString } from "../utils/i18n/platform.ts";
import { isLinkedEntityFieldPath } from "../utils/linkedEntityFieldUtils.ts";
import {
  getListSourceSelectorOptions,
  resolveDefaultListItemMappings,
  type ListSourceMappingConfig,
} from "../utils/listSourceFieldUtils.ts";
import { warnOnMultiValueLinkedEntityTraversal } from "../utils/linkedEntityWarningUtils.ts";
import {
  ConstantValueModeToggler,
  type YextEntityField,
} from "./YextEntityFieldSelector.tsx";

export type ListSourceFieldValue = Omit<
  YextEntityField<{ id?: string }[]>,
  "constantValue"
> & {
  constantValue: {
    id?: string;
  }[];
  itemFieldMappings?: Record<string, string>;
};

type ListSourceFieldConfig = {
  label: MsgString;
  legacySourceFilter: RenderEntityFieldFilter<Record<string, any>>;
  constantField: Field<any>;
  mappingConfigs: ListSourceMappingConfig[];
};

type RenderProps = Parameters<CustomField<any>["render"]>[0];

export const createListSourceField = ({
  label,
  legacySourceFilter,
  constantField,
  mappingConfigs,
}: ListSourceFieldConfig): CustomField<ListSourceFieldValue> => ({
  type: "custom",
  render: (props: RenderProps) => (
    <ListSourceFieldInput
      {...props}
      constantField={constantField}
      label={label}
      legacySourceFilter={legacySourceFilter}
      mappingConfigs={mappingConfigs}
    />
  ),
});

const ListSourceFieldInput = ({
  onChange,
  value,
  constantField,
  label,
  legacySourceFilter,
  mappingConfigs,
}: RenderProps & {
  constantField: Field<any>;
  label: MsgString;
  legacySourceFilter: RenderEntityFieldFilter<Record<string, any>>;
  mappingConfigs: ListSourceMappingConfig[];
}) => {
  const entityFields = useEntityFields();
  const linkedEntitySchemas = useLinkedEntitySchemas();
  const streamDocument = useDocument();
  const templateMetadata = useTemplateMetadata();

  const normalizedValue = React.useMemo<ListSourceFieldValue>(
    () => ({
      field: value?.field ?? "",
      constantValue: Array.isArray(value?.constantValue)
        ? value.constantValue
        : [],
      constantValueEnabled: value?.constantValueEnabled ?? true,
      itemFieldMappings: value?.itemFieldMappings,
    }),
    [value]
  );

  const selectorOptions = React.useMemo(
    () =>
      getListSourceSelectorOptions({
        entityFields,
        linkedEntitySchemas: linkedEntitySchemas ?? undefined,
        legacySourceFilter,
        mappingConfigs,
      }),
    [entityFields, legacySourceFilter, linkedEntitySchemas, mappingConfigs]
  );

  const selectedMappingOptions =
    selectorOptions.mappingOptionsBySourceField[normalizedValue.field];
  const isListSource = selectorOptions.listSourceFieldNames.has(
    normalizedValue.field
  );

  React.useEffect(() => {
    if (
      !normalizedValue.field ||
      !isLinkedEntityFieldPath(
        normalizedValue.field,
        linkedEntitySchemas ?? undefined
      )
    ) {
      return;
    }

    warnOnMultiValueLinkedEntityTraversal(
      streamDocument,
      normalizedValue.field
    );
  }, [linkedEntitySchemas, normalizedValue.field, streamDocument]);

  const sourceSelector = React.useMemo<BasicSelectorField>(() => {
    const defaultOption = {
      value: "",
      label: pt("entityTypeField", "{{entityType}} Field", {
        entityType: templateMetadata.entityTypeDisplayName,
      }),
    };

    return {
      type: "basicSelector",
      label,
      ...(selectorOptions.sourceOptionGroups
        ? {
            optionGroups: [
              { title: "General", options: [defaultOption] },
              ...selectorOptions.sourceOptionGroups,
            ],
          }
        : {
            options: [defaultOption, ...selectorOptions.sourceOptions],
          }),
      translateOptions: false,
      noOptionsPlaceholder: pt("noAvailableFields", "No available fields"),
    };
  }, [
    label,
    selectorOptions.sourceOptionGroups,
    selectorOptions.sourceOptions,
    templateMetadata.entityTypeDisplayName,
  ]);

  const toggleConstantValueEnabled = (constantValueEnabled: boolean) => {
    onChange({
      ...normalizedValue,
      constantValueEnabled,
    });
  };

  return (
    <>
      <ConstantValueModeToggler
        constantValueEnabled={normalizedValue.constantValueEnabled ?? true}
        disableConstantValue={false}
        fieldTypeFilter={legacySourceFilter.types ?? []}
        label={label}
        toggleConstantValueEnabled={toggleConstantValueEnabled}
      />
      {normalizedValue.constantValueEnabled ? (
        <div className="ve-pt-3">
          <YextAutoField
            field={constantField}
            onChange={(nextConstantValue, uiState) =>
              onChange(
                {
                  ...normalizedValue,
                  constantValue: nextConstantValue,
                },
                uiState
              )
            }
            value={normalizedValue.constantValue}
          />
        </div>
      ) : (
        <div className="ve-space-y-3 ve-pt-3">
          <YextAutoField
            field={sourceSelector}
            onChange={(selectedSourceField, uiState) => {
              const nextMappings = selectorOptions.listSourceFieldNames.has(
                selectedSourceField
              )
                ? resolveDefaultListItemMappings(
                    normalizedValue.itemFieldMappings,
                    mappingConfigs,
                    selectorOptions.mappingOptionsBySourceField[
                      selectedSourceField
                    ]
                  )
                : undefined;

              onChange(
                {
                  ...normalizedValue,
                  field: selectedSourceField,
                  itemFieldMappings: nextMappings,
                },
                uiState
              );
            }}
            value={normalizedValue.field}
          />
          {isListSource &&
            mappingConfigs.map((config) => {
              const mappingField: BasicSelectorField = {
                type: "basicSelector",
                label: config.label,
                options: selectedMappingOptions?.[config.key] ?? [],
                translateOptions: false,
                noOptionsPlaceholder: pt(
                  "noAvailableFields",
                  "No available fields"
                ),
              };

              return (
                <YextAutoField
                  key={config.key}
                  field={mappingField}
                  onChange={(selectedMappingField, uiState) =>
                    onChange(
                      {
                        ...normalizedValue,
                        itemFieldMappings: {
                          ...normalizedValue.itemFieldMappings,
                          [config.key]: selectedMappingField,
                        },
                      },
                      uiState
                    )
                  }
                  value={normalizedValue.itemFieldMappings?.[config.key] ?? ""}
                />
              );
            })}
        </div>
      )}
    </>
  );
};
