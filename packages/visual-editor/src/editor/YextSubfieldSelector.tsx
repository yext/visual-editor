import React from "react";
import { FieldLabel, Field } from "@puckeditor/core";
import { YextAutoField } from "../fields/YextAutoField.tsx";
import { type RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";
import { pt } from "../utils/i18n/platform.ts";
import { useTranslation } from "react-i18next";
import {
  ConstantValueModeToggler,
  getConstantConfigFromType,
  returnConstantFieldConfig,
  type YextEntityField,
} from "./YextEntityFieldSelector.tsx";
import { EmbeddedFieldStringInputFromOptions } from "./EmbeddedFieldStringInput.tsx";
import { useEntityFields } from "../hooks/useEntityFields.tsx";
import { useDocument } from "../hooks/useDocument.tsx";
import { type StreamDocument } from "../utils/types/StreamDocument.ts";
import {
  getEntityFieldDisplayName,
  getSubfieldsForSelector,
} from "./yextEntityFieldUtils.ts";
import { YextPuckFieldOverrides } from "../fields/fields.ts";

export type RenderYextSubfieldSelectorProps<T extends Record<string, any>> = {
  label: string;
  sourceField: string;
  filter: RenderEntityFieldFilter<T>;
  disableConstantValueToggle?: boolean;
  disallowTranslation?: boolean;
};

type InputProps<T extends Record<string, any>> = {
  filter: RenderEntityFieldFilter<T>;
  onChange: (value: any, uiState?: any) => void;
  value: any;
  className?: string;
  disallowTranslation?: boolean;
  label?: string;
  sourceField: string;
};

const isYextPuckFieldType = (
  type: string
): type is keyof typeof YextPuckFieldOverrides =>
  type in YextPuckFieldOverrides;

const getSubfieldOptions = (
  entityFields: ReturnType<typeof useEntityFields>,
  sourceField: string,
  filter: RenderEntityFieldFilter<any>,
  streamDocument: StreamDocument
): { label: string; value: string }[] => {
  const rootDisplayName = getEntityFieldDisplayName(sourceField, entityFields);
  const rootPrefix = rootDisplayName ? `${rootDisplayName} > ` : undefined;

  return getSubfieldsForSelector(
    entityFields,
    sourceField,
    filter,
    streamDocument
  ).map((field) => {
    const displayName =
      field.displayName ??
      getEntityFieldDisplayName(field.name, entityFields) ??
      field.name;

    return {
      label:
        rootPrefix && displayName.startsWith(rootPrefix)
          ? displayName.slice(rootPrefix.length)
          : displayName,
      value: field.name.slice(sourceField.length + 1),
    };
  });
};

/**
 * Allows the user to select only descendants of an already-selected mapped
 * source such as a linked entity or list item.
 */
export const YextSubfieldSelector = <T extends Record<string, any>, U>(
  props: RenderYextSubfieldSelectorProps<T>
): Field<YextEntityField<U>> => {
  return {
    type: "custom",
    render: ({ value, onChange }) => {
      const constantValueEnabled =
        !props.disableConstantValueToggle && !!value?.constantValueEnabled;

      return (
        <>
          <ConstantValueModeToggler
            fieldTypeFilter={props.filter.types ?? []}
            constantValueEnabled={constantValueEnabled}
            toggleConstantValueEnabled={(nextConstantValueEnabled) =>
              onChange({
                ...value,
                constantValueEnabled: nextConstantValueEnabled,
              })
            }
            disableConstantValue={props.disableConstantValueToggle}
            label={pt(props.label)}
            showLocale={
              props.filter.types?.includes("type.string") &&
              !props.disallowTranslation
            }
          />
          {constantValueEnabled ? (
            <SubfieldConstantValueInput<T>
              className="ve-pt-3"
              filter={props.filter}
              onChange={onChange}
              sourceField={props.sourceField}
              value={value}
              disallowTranslation={props.disallowTranslation}
            />
          ) : (
            <SubfieldInput<T>
              className="ve-pt-3"
              filter={props.filter}
              onChange={onChange}
              sourceField={props.sourceField}
              value={value}
            />
          )}
        </>
      );
    },
  };
};

const SubfieldConstantValueInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  className,
  disallowTranslation,
  sourceField,
}: InputProps<T>) => {
  const entityFields = useEntityFields();
  const streamDocument = useDocument<StreamDocument>();
  const subfieldOptions = React.useMemo(
    () => getSubfieldOptions(entityFields, sourceField, filter, streamDocument),
    [entityFields, filter, sourceField, streamDocument]
  );
  const isSingleStringField =
    filter.types?.includes("type.string") && !filter.includeListsOnly;
  let constantFieldConfig = returnConstantFieldConfig(
    filter.types,
    !!filter.includeListsOnly,
    !!disallowTranslation
  );

  if (!constantFieldConfig && isSingleStringField) {
    constantFieldConfig = getConstantConfigFromType(
      "type.string",
      false,
      !!disallowTranslation
    );
  }

  const { i18n } = useTranslation();
  const locale = i18n.language;
  const constantValue = value?.constantValue;
  const localizedConstantValue =
    typeof constantValue === "string"
      ? constantValue
      : constantValue &&
          typeof constantValue === "object" &&
          !Array.isArray(constantValue)
        ? (constantValue[locale] ?? constantValue.defaultValue ?? "")
        : "";

  if (!constantFieldConfig) {
    return;
  }

  const fieldEditor = isSingleStringField ? (
    <div className={className}>
      <EmbeddedFieldStringInputFromOptions
        value={
          typeof localizedConstantValue === "string"
            ? localizedConstantValue
            : ""
        }
        onChange={(newInputValue) =>
          onChange({
            ...value,
            constantValue: {
              ...(typeof value?.constantValue === "object" &&
              !Array.isArray(value?.constantValue)
                ? value?.constantValue
                : {}),
              [locale]: newInputValue,
              hasLocalizedValue: "true",
            },
          })
        }
        optionGroups={[{ options: subfieldOptions }]}
        showFieldSelector={true}
      />
    </div>
  ) : (
    <YextAutoField
      onChange={(newConstantValue, uiState) =>
        onChange(
          {
            ...value,
            constantValue: newConstantValue,
          },
          uiState
        )
      }
      value={value?.constantValue}
      field={constantFieldConfig}
    />
  );

  return constantFieldConfig.type === "custom" ||
    isYextPuckFieldType(constantFieldConfig.type) ? (
    fieldEditor
  ) : (
    <FieldLabel
      label={constantFieldConfig.label ?? "Value"}
      el="div"
      className={`ve-inline-block w-full ${
        constantFieldConfig.label ? "ve-pt-3" : ""
      }`}
    >
      {fieldEditor}
    </FieldLabel>
  );
};

export const SubfieldInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  className,
  label,
  sourceField,
}: InputProps<T>) => {
  const entityFields = useEntityFields();
  const streamDocument = useDocument<StreamDocument>();
  const currentFieldPath = value?.field as string | undefined;
  const currentSubfieldValue = currentFieldPath?.startsWith(`${sourceField}.`)
    ? currentFieldPath.slice(sourceField.length + 1)
    : "";
  const subfieldOptions = React.useMemo(() => {
    const nextSubfieldOptions = getSubfieldOptions(
      entityFields,
      sourceField,
      filter,
      streamDocument
    );

    if (
      currentFieldPath?.startsWith(`${sourceField}.`) &&
      currentSubfieldValue &&
      !nextSubfieldOptions.some(
        (option) => option.value === currentSubfieldValue
      )
    ) {
      const rootDisplayName = getEntityFieldDisplayName(
        sourceField,
        entityFields
      );
      const rootPrefix = rootDisplayName ? `${rootDisplayName} > ` : undefined;
      const currentDisplayName =
        getEntityFieldDisplayName(currentFieldPath, entityFields) ??
        currentSubfieldValue;

      nextSubfieldOptions.push({
        label:
          rootPrefix && currentDisplayName.startsWith(rootPrefix)
            ? currentDisplayName.slice(rootPrefix.length)
            : currentDisplayName,
        value: currentSubfieldValue,
      });
    }

    return nextSubfieldOptions;
  }, [
    currentFieldPath,
    currentSubfieldValue,
    entityFields,
    filter,
    sourceField,
    streamDocument,
  ]);

  return (
    <div className={"ve-inline-block ve-w-full " + className}>
      <YextAutoField
        field={{
          type: "basicSelector",
          label,
          optionGroups: [
            {
              options: [
                {
                  value: "",
                  label: pt("fields.options.selectAField", "Select a field"),
                },
                ...subfieldOptions,
              ],
            },
          ],
          translateOptions: false,
          noOptionsPlaceholder: pt("noAvailableFields", "No available fields"),
        }}
        onChange={(selectedSubfield, uiState) =>
          onChange(
            {
              ...value,
              field: selectedSubfield
                ? `${sourceField}.${selectedSubfield}`
                : "",
            },
            uiState
          )
        }
        value={currentSubfieldValue}
      />
    </div>
  );
};
