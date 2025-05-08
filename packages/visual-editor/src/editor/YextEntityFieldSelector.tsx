import React from "react";
import { AutoField, FieldLabel, Field, CustomField } from "@measured/puck";
import {
  EntityFieldTypes,
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";
import { RadioGroup, RadioGroupItem } from "../internal/puck/ui/radio.tsx";
import { Label } from "../internal/puck/ui/label.tsx";
import { DevLogger } from "../utils/devLogger.ts";
import { IMAGE_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Image.tsx";
import { TEXT_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Text.tsx";
import { ADDRESS_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Address.tsx";
import { TEXT_LIST_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/TextList.tsx";
import { CTA_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/CallToAction.tsx";
import { PHONE_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Phone.tsx";
import { BasicSelector } from "./BasicSelector.tsx";
import { useEntityFields } from "../hooks/useEntityFields.tsx";
import { IMAGE_LIST_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/ImageList.tsx";

const devLogger = new DevLogger();

type RenderProps = Parameters<CustomField<any>["render"]>[0];

export type YextEntityField<T> = {
  field: string;
  constantValue: T;
  constantValueEnabled?: boolean;
};

export type YextCollection = {
  items: YextEntityField<Array<any>>;
  limit: string | number;
};

export type RenderYextEntityFieldSelectorProps<T extends Record<string, any>> =
  {
    label: string;
    filter: RenderEntityFieldFilter<T>;
    isCollection?: boolean;
    disableConstantValueToggle?: boolean;
  };

export const TYPE_TO_CONSTANT_CONFIG: Record<string, Field<any>> = {
  "type.string": TEXT_CONSTANT_CONFIG,
  "type.phone": PHONE_CONSTANT_CONFIG,
  "type.image": IMAGE_CONSTANT_CONFIG,
  "type.address": ADDRESS_CONSTANT_CONFIG,
  "type.cta": CTA_CONSTANT_CONFIG,
};

const LIST_TYPE_TO_CONSTANT_CONFIG: Record<string, Field<any>> = {
  "type.string": TEXT_LIST_CONSTANT_CONFIG,
  "type.image": IMAGE_LIST_CONSTANT_CONFIG,
};

export const getConstantConfigFromType = (
  type: EntityFieldTypes,
  isList?: boolean
): Field<any> | undefined => {
  if (isList) {
    return LIST_TYPE_TO_CONSTANT_CONFIG[type];
  }
  const constantConfig = TYPE_TO_CONSTANT_CONFIG[type];
  if (!constantConfig) {
    devLogger.log(`No constant configuration for ${type}`);
    return;
  }
  return constantConfig;
};

/**
 * Returns the constant type configuration if all types match
 * @param typeFilter
 */
const returnConstantFieldConfig = (
  typeFilter: EntityFieldTypes[] | undefined,
  isList: boolean
): Field | undefined => {
  if (!typeFilter) {
    return undefined;
  }

  let fieldConfiguration: Field | undefined;
  for (const entityFieldType of typeFilter) {
    const mappedConfiguration = getConstantConfigFromType(
      entityFieldType,
      isList
    );
    if (!mappedConfiguration) {
      devLogger.log(`No mapped configuration for ${entityFieldType}`);
      return;
    }
    if (!fieldConfiguration) {
      fieldConfiguration = mappedConfiguration;
    }
    if (fieldConfiguration !== mappedConfiguration) {
      devLogger.log(`Could not resolve configuration for ${entityFieldType}`);
      return;
    }
  }
  return fieldConfiguration;
};

/**
 * Allows the user to select an entity field from the document and set a constant value.
 */
export const YextEntityFieldSelector = <T extends Record<string, any>, U>(
  props: RenderYextEntityFieldSelectorProps<T>
): Field<YextEntityField<U>> => {
  return {
    type: "custom",
    label: props.label,
    render: ({ value, onChange }: RenderProps) => {
      const toggleConstantValueEnabled = (constantValueEnabled: boolean) => {
        onChange({
          field: value?.field ?? "",
          constantValue: value?.constantValue ?? "",
          constantValueEnabled: constantValueEnabled,
        });
      };

      return (
        <FieldLabel label={props.label} className="ve-inline-block ve-w-full">
          <ConstantValueModeToggler
            fieldTypeFilter={props.filter.types ?? []}
            constantValueEnabled={value?.constantValueEnabled}
            toggleConstantValueEnabled={toggleConstantValueEnabled}
            isCollection={!!props.isCollection}
            disableConstantValue={props.disableConstantValueToggle}
          />
          {value?.constantValueEnabled && !props.isCollection && (
            <ConstantValueInput<T>
              onChange={onChange}
              value={value}
              filter={props.filter}
            />
          )}
          {!value?.constantValueEnabled && (
            <EntityFieldInput<T>
              className="ve-pt-4"
              onChange={onChange}
              value={value}
              filter={props.filter}
            />
          )}
        </FieldLabel>
      );
    },
  };
};

/**
 * Allows the user to select an entity subfield from the document and set a constant value.
 */
export const YextCollectionSubfieldSelector = <
  T extends Record<string, any>,
  U,
>(
  props: RenderYextEntityFieldSelectorProps<T>
): Field<YextEntityField<U>> => {
  // If the field is not part of a collection, redirect to the normal entity field selector
  if (!props.isCollection) {
    return YextEntityFieldSelector({ ...props });
  }

  return {
    type: "custom",
    label: props.label,
    render: ({ value, onChange }: RenderProps) => {
      const toggleConstantValueEnabled = (constantValueEnabled: boolean) => {
        onChange({
          field: value?.field ?? "",
          constantValue: value?.constantValue ?? "",
          constantValueEnabled: constantValueEnabled,
        });
      };

      return (
        <FieldLabel label={props.label} className="ve-inline-block ve-w-full">
          <ConstantValueModeToggler
            fieldTypeFilter={props.filter.types ?? []}
            constantValueEnabled={value?.constantValueEnabled}
            toggleConstantValueEnabled={toggleConstantValueEnabled}
            isCollection={!!props.isCollection}
            disableConstantValue={props.disableConstantValueToggle}
          />
          {value?.constantValueEnabled ? (
            <ConstantValueInput<T>
              onChange={onChange}
              value={value}
              filter={props.filter}
            />
          ) : (
            <EntityFieldInput<T>
              className="ve-pt-4"
              onChange={onChange}
              value={value}
              filter={props.filter}
            />
          )}
        </FieldLabel>
      );
    },
  };
};

export const ConstantValueModeToggler = ({
  fieldTypeFilter,
  constantValueEnabled,
  toggleConstantValueEnabled,
  isCollection,
  disableConstantValue,
}: {
  fieldTypeFilter: EntityFieldTypes[];
  constantValueEnabled: boolean;
  toggleConstantValueEnabled: (constantValueEnabled: boolean) => void;
  isCollection?: boolean;
  disableConstantValue?: boolean;
}) => {
  const random = Math.floor(Math.random() * 999999);
  const entityButtonId = `ve-use-entity-value-${random}`;
  const constantButtonId = `ve-use-constant-value-${random}`;

  // If disableConstantValue is true, constantValueInputSupported is always false.
  // Else if isCollection or a supported field type, constantValueInputSupported is true
  const constantValueInputSupported =
    !disableConstantValue &&
    (isCollection ||
      fieldTypeFilter.some(
        (fieldType) =>
          Object.keys(TYPE_TO_CONSTANT_CONFIG).includes(fieldType) ||
          Object.keys(LIST_TYPE_TO_CONSTANT_CONFIG).includes(fieldType)
      ));

  return (
    <div className="ve-w-full">
      <RadioGroup
        value={constantValueEnabled?.toString() ?? "false"}
        onValueChange={(value) => toggleConstantValueEnabled(value === "true")}
      >
        <div className="ve-flex ve-items-center ve-space-x-2">
          <RadioGroupItem value="false" id={entityButtonId} />
          <Label
            htmlFor={entityButtonId}
            onClick={() => toggleConstantValueEnabled(false)}
          >
            Use Entity Value
          </Label>
        </div>
        {constantValueInputSupported && (
          <div className="ve-flex ve-items-center ve-space-x-2">
            <RadioGroupItem value="true" id={constantButtonId} />
            <Label
              onClick={() => toggleConstantValueEnabled(true)}
              htmlFor={constantButtonId}
            >
              Use Constant Value
            </Label>
          </div>
        )}
      </RadioGroup>
    </div>
  );
};

type InputProps<T extends Record<string, any>> = {
  filter: RenderEntityFieldFilter<T>;
  onChange: (value: any, uiState: any) => void;
  value: any;
  className?: string;
};

export const ConstantValueInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
}: InputProps<T>) => {
  const constantFieldConfig = returnConstantFieldConfig(
    filter.types,
    !!filter.includeListsOnly
  );

  if (!constantFieldConfig) {
    return;
  }

  return constantFieldConfig.type === "custom" ? (
    <AutoField
      onChange={(newConstantValue, uiState) =>
        onChange(
          {
            field: value?.field ?? "",
            constantValue: newConstantValue,
            constantValueEnabled: true,
          },
          uiState
        )
      }
      value={value?.constantValue}
      field={constantFieldConfig}
    />
  ) : (
    <FieldLabel
      label={constantFieldConfig.label ?? "Value"}
      className={`ve-inline-block w-full ${constantFieldConfig.label ? "ve-pt-4" : ""}`}
    >
      <AutoField
        onChange={(newConstantValue, uiState) =>
          onChange(
            {
              field: value?.field ?? "",
              constantValue: newConstantValue,
              constantValueEnabled: true,
            },
            uiState
          )
        }
        value={value?.constantValue}
        field={constantFieldConfig}
      />
    </FieldLabel>
  );
};

export const EntityFieldInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  className,
}: InputProps<T>) => {
  const entityFields = useEntityFields();

  const basicSelectorField = React.useMemo(() => {
    let filteredEntityFields = getFilteredEntityFields(entityFields, filter);

    // If there are no direct children, return the parent field if it is a list
    if (filter.directChildrenOf && filteredEntityFields.length === 0) {
      filteredEntityFields = getFilteredEntityFields(entityFields, {
        allowList: [filter.directChildrenOf],
        types: filter.types,
        includeListsOnly: true,
      });
    }

    return BasicSelector("Entity Field", [
      { value: "", label: "Select a Content field" },
      ...filteredEntityFields
        .map((entityFieldNameToSchema) => {
          return {
            label:
              entityFieldNameToSchema.displayName ??
              entityFieldNameToSchema.name,
            value: entityFieldNameToSchema.name,
          };
        })
        .sort((entityFieldA, entityFieldB) => {
          const nameA = entityFieldA.label.toUpperCase();
          const nameB = entityFieldB.label.toUpperCase();
          return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        }),
    ]);
  }, [entityFields, filter]);

  return (
    <div className={"ve-inline-block ve-w-full " + className}>
      <AutoField
        field={basicSelectorField}
        onChange={(selectedEntityField, uiState) => {
          onChange(
            {
              field: selectedEntityField,
              constantValue: value?.constantValue ?? "",
              constantValueEnabled: false,
              constantValueOverride: value?.constantValueOverride ?? {},
            },
            uiState
          );
        }}
        value={value?.field}
      />
    </div>
  );
};
