import React from "react";
import { AutoField, FieldLabel, Field } from "@measured/puck";
import { RenderProps } from "../../internal/utils/renderEntityFields.tsx";
import {
  EntityFieldTypes,
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../../internal/utils/getFilteredEntityFields.ts";
import { RadioGroup, RadioGroupItem } from "../../internal/puck/ui/radio.tsx";
import { Label } from "../../internal/puck/ui/label.tsx";
import { DevLogger } from "../../utils/devLogger.ts";
import { IMAGE_CONSTANT_CONFIG } from "../../internal/puck/constant-value-fields/Image.tsx";
import { TEXT_CONSTANT_CONFIG } from "../../internal/puck/constant-value-fields/Text.tsx";
import { ADDRESS_CONSTANT_CONFIG } from "../../internal/puck/constant-value-fields/Address.tsx";
import { TEXT_LIST_CONSTANT_CONFIG } from "../../internal/puck/constant-value-fields/TextList.tsx";
import { CTA_CONSTANT_CONFIG } from "../../internal/puck/constant-value-fields/CallToAction.tsx";
import { PHONE_CONSTANT_CONFIG } from "../../internal/puck/constant-value-fields/Phone.tsx";

const devLogger = new DevLogger();

export type YextEntityField<T> = {
  field: string;
  constantValue: T;
  constantValueEnabled?: boolean;
};

export type RenderYextEntityFieldSelectorProps<T extends Record<string, any>> =
  {
    label: string;
    filter: RenderEntityFieldFilter<T>;
  };

const TYPE_TO_CONSTANT_CONFIG: Record<string, Field<any>> = {
  "type.string": TEXT_CONSTANT_CONFIG,
  "type.phone": PHONE_CONSTANT_CONFIG,
  "type.image": IMAGE_CONSTANT_CONFIG,
  "type.address": ADDRESS_CONSTANT_CONFIG,
  "type.cta": CTA_CONSTANT_CONFIG,
};

const LIST_TYPE_TO_CONSTANT_CONFIG: Record<string, Field<any>> = {
  "type.string": TEXT_LIST_CONSTANT_CONFIG,
};

const getConstantConfigFromType = (
  type: EntityFieldTypes,
  isList: boolean
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
  typeFilter: EntityFieldTypes[],
  isList: boolean
): Field | undefined => {
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
    render: ({ field, value, onChange }: RenderProps) => {
      const toggleConstantValueEnabled = (constantValueEnabled: boolean) => {
        onChange({
          field: value?.field ?? "",
          constantValue: value?.constantValue ?? "",
          constantValueEnabled: constantValueEnabled,
        });
      };

      return (
        <>
          <ConstantValueModeToggler
            fieldTypeFilter={props.filter.types}
            constantValueEnabled={value?.constantValueEnabled}
            toggleConstantValueEnabled={toggleConstantValueEnabled}
          />
          {value?.constantValueEnabled ? (
            <ConstantValueInput<T>
              onChange={onChange}
              value={value}
              filter={props.filter}
            />
          ) : (
            <EntityFieldInput<T>
              onChange={onChange}
              value={value}
              filter={props.filter}
              label={field.label}
            />
          )}
        </>
      );
    },
  };
};

const ConstantValueModeToggler = ({
  fieldTypeFilter,
  constantValueEnabled,
  toggleConstantValueEnabled,
}: {
  fieldTypeFilter: EntityFieldTypes[];
  constantValueEnabled: boolean;
  toggleConstantValueEnabled: (constantValueEnabled: boolean) => void;
}) => {
  const random = Math.floor(Math.random() * 999999);
  const entityButtonId = `ve-use-entity-value-${random}`;
  const constantButtonId = `ve-use-constant-value-${random}`;

  const constantValueInputSupported = fieldTypeFilter.some(
    (fieldType) =>
      Object.keys(TYPE_TO_CONSTANT_CONFIG).includes(fieldType) ||
      Object.keys(LIST_TYPE_TO_CONSTANT_CONFIG).includes(fieldType)
  );

  return (
    <div className="ve-w-full">
      <RadioGroup defaultValue={constantValueEnabled?.toString() ?? "false"}>
        <div className="ve-flex ve-items-center ve-space-x-2">
          <RadioGroupItem
            value="false"
            id={entityButtonId}
            onClick={() => toggleConstantValueEnabled(false)}
          />
          <Label htmlFor={entityButtonId}>Use Entity Value</Label>
        </div>
        {constantValueInputSupported && (
          <div className="ve-flex ve-items-center ve-space-x-2">
            <RadioGroupItem
              value="true"
              id={constantButtonId}
              onClick={() => toggleConstantValueEnabled(true)}
            />
            <Label htmlFor={constantButtonId}>Use Constant Value</Label>
          </div>
        )}
      </RadioGroup>
    </div>
  );
};

type InputProps<T extends Record<string, any>> = {
  filter: RenderEntityFieldFilter<T>;
  onChange: (value: any) => void;
  value: any;
  label?: string;
};

const ConstantValueInput = <T extends Record<string, any>>({
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
      onChange={(newConstantValue) =>
        onChange({
          field: value?.field ?? "",
          constantValue: newConstantValue,
          constantValueEnabled: true,
        })
      }
      value={value?.constantValue}
      field={constantFieldConfig}
    />
  ) : (
    <FieldLabel
      label={constantFieldConfig.label ?? "Value"}
      className="ve-inline-block ve-pt-4 w-full"
    >
      <AutoField
        onChange={(newConstantValue) =>
          onChange({
            field: value?.field ?? "",
            constantValue: newConstantValue,
            constantValueEnabled: true,
          })
        }
        value={value?.constantValue}
        field={constantFieldConfig}
      />
    </FieldLabel>
  );
};

const EntityFieldInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  label,
}: InputProps<T>) => {
  const filteredEntityFields = getFilteredEntityFields(filter);

  return (
    <FieldLabel
      label={label ?? "Entity Field"}
      className="ve-inline-block ve-w-full ve-pt-4"
    >
      <AutoField
        field={{
          type: "select",
          options: [
            { value: "", label: "Select a Content field" },
            ...filteredEntityFields.map((entityFieldNameToSchema) => {
              return {
                label: entityFieldNameToSchema.name,
                value: entityFieldNameToSchema.name,
              };
            }),
          ],
        }}
        onChange={(selectedEntityField) => {
          onChange({
            field: selectedEntityField,
            constantValue: value?.constantValue ?? "",
            constantValueEnabled: false,
          });
        }}
        value={value?.field}
      />
    </FieldLabel>
  );
};
