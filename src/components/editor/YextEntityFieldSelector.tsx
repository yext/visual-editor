import React from "react";
import {AutoField, FieldLabel, Field, CustomField, TextField} from "@measured/puck";
import { RenderProps } from "../../internal/utils/renderEntityFields.tsx";
import {
  EntityFieldTypes,
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../../internal/utils/getFilteredEntityFields.ts";
import { RadioGroup, RadioGroupItem } from "../../internal/puck/ui/radio.tsx";
import { Label } from "../../internal/puck/ui/label.tsx";
import { ImageType } from "@yext/pages-components";

export type YextEntityField = {
  field: string;
  constantValue: string;
  constantValueEnabled?: boolean;
};

export type RenderYextEntityFieldSelectorProps<T extends Record<string, any>> =
  {
    label: string;
    filter: RenderEntityFieldFilter<T>;
  };

const TEXT_CONSTANT_CONFIG: TextField = {
  type: "text",
};

const IMAGE_CONSTANT_CONFIG: CustomField<ImageType> = {
  type: "custom",
  render: ({name, onChange, value}) => {
    return <>
    <input name={"Alternate Text"} onChange={(e) => {
      onChange({
        ...value,
        alternateText: e.currentTarget.value,
      });
    }}/>
      <input name={"Height"} onChange={(e) => {
        const height = Number(e.currentTarget.value);
        if (height) {
          onChange({
            ...value,
            height: +e.currentTarget.value,
          });
        }
      }}/>
      <input name={"Width"} onChange={(e) => {
        const width = Number(e.currentTarget.value);
        if (width) {
          onChange({
            ...value,
            width: +e.currentTarget.value,
          });
        }
      }}/>
      <input name={"URL"} onChange={(e) => {
        onChange({
          ...value,
          url: e.currentTarget.value,
        });
      }}/>
    </>
  }
}

const TYPE_TO_CONSTANT_CONFIG: Record<string, Field<any>> = {
  "type.string": TEXT_CONSTANT_CONFIG,
  "type.phone": TEXT_CONSTANT_CONFIG,
  "type.image": IMAGE_CONSTANT_CONFIG,
}

/**
 * Returns the constant type configuration if all types match
 * @param typeFilter
 */
const returnConstantFieldConfig = (typeFilter: EntityFieldTypes[]): Field | undefined => {
  let fieldConfiguration: Field | undefined;
  for (const entityFieldType of typeFilter) {
    const mappedConfiguration = TYPE_TO_CONSTANT_CONFIG[entityFieldType];
    if (!mappedConfiguration) {
      console.log(`No mapped configuration for ${entityFieldType}`);
      return;
    }
    if (!fieldConfiguration) {
      fieldConfiguration = mappedConfiguration;
    }
    if (fieldConfiguration !== mappedConfiguration) {
      console.log(`Could not resolve configuration for ${entityFieldType}`);
      return;
    }
  }
  return fieldConfiguration;
};

/**
 * Allows the user to select an entity field from the document and set a constant value.
 */
export const YextEntityFieldSelector = <T extends Record<string, any>>(
  props: RenderYextEntityFieldSelectorProps<T>
): Field<YextEntityField> => {
  return {
    type: "custom",
    label: props.label,
    render: ({ field, value, onChange }: RenderProps) => {
      const filteredEntityFields = getFilteredEntityFields(props.filter);

      console.log(`Filtered entity fields for ${props.label} are ${JSON.stringify(filteredEntityFields)}\n`);
      const toggleConstantValueEnabled = (constantValueEnabled: boolean) => {
        onChange({
          field: value?.field ?? "",
          constantValue: value?.constantValue ?? "",
          constantValueEnabled: constantValueEnabled,
        });
      };

      return (
        <>
          {!!returnConstantFieldConfig(props.filter.types) && (
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
              <AutoField
                onChange={(newConstantValue) =>
                  onChange({
                    field: value?.field ?? "",
                    constantValue: newConstantValue,
                    constantValueEnabled: true,
                  })
                }
                value={value?.constantValue}
                field={{
                  type: "text",
                }}
              />
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
