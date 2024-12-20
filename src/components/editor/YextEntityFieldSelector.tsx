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
  "type.phone": TEXT_CONSTANT_CONFIG,
  "type.image": IMAGE_CONSTANT_CONFIG,
  "type.address": ADDRESS_CONSTANT_CONFIG,
  "type.cta": CTA_CONSTANT_CONFIG,
};

const getConstantConfigFromType = (
  type: EntityFieldTypes,
  isList: boolean
): Field<any> | undefined => {
  if (isList) {
    return TEXT_LIST_CONSTANT_CONFIG;
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
  const constantFieldConfig = returnConstantFieldConfig(
    props.filter.types,
    !!props.filter.includeListsOnly
  );
  return {
    type: "custom",
    label: props.label,
    render: ({ field, value, onChange }: RenderProps) => {
      const filteredEntityFields = getFilteredEntityFields(props.filter);

      const toggleConstantValueEnabled = (constantValueEnabled: boolean) => {
        onChange({
          field: value?.field ?? "",
          constantValue: value?.constantValue ?? "",
          constantValueEnabled: constantValueEnabled,
        });
      };

      return (
        <>
          {!!constantFieldConfig && (
            <ToggleMode
              constantValueEnabled={value?.constantValueEnabled}
              toggleConstantValueEnabled={toggleConstantValueEnabled}
            />
          )}
          {!value?.constantValueEnabled ? (
            <FieldLabel
              label={field.label || "Label is undefined"}
              className="ve-mt-2.5"
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
          ) : (
            <FieldLabel
              label={"Constant Value"}
              className="entityField-constantValue"
            >
              {constantFieldConfig && (
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
              )}
            </FieldLabel>
          )}
        </>
      );
    },
  };
};

const ToggleMode = ({
  constantValueEnabled,
  toggleConstantValueEnabled,
}: {
  constantValueEnabled: boolean;
  toggleConstantValueEnabled: (constantValueEnabled: boolean) => void;
}) => {
  return (
    <div className="ve-mb-2 ve-w-full">
      <RadioGroup defaultValue={constantValueEnabled?.toString() ?? "false"}>
        <div className="ve-flex ve-items-center ve-space-x-2">
          <RadioGroupItem
            value="false"
            id="ve-use-entity-value"
            onClick={() => toggleConstantValueEnabled(false)}
          />
          <Label htmlFor="ve-use-entity-value">Use Entity Value</Label>
        </div>
        <div className="ve-flex ve-items-center ve-space-x-2">
          <RadioGroupItem
            value="true"
            id="ve-use-constant-value"
            onClick={() => toggleConstantValueEnabled(true)}
          />
          <Label htmlFor="ve-use-constant-value">Use Constant Value</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
