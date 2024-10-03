import React from "react";
import { AutoField, FieldLabel, Field } from "@measured/puck";
import { RenderProps } from "../internal/utils/renderEntityFields.tsx";
import {
  EntityFieldTypes,
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";
import { RadioGroup, RadioGroupItem } from "../internal/puck/ui/radio.tsx";
import { Label } from "../internal/puck/ui/label.tsx";

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

const SUPPORTED_CONSTANT_VALUE_TYPES: EntityFieldTypes[] = [
  "type.string",
  "type.phone",
];
const shouldDisplayConstantValueField = (typeFilter: EntityFieldTypes[]) => {
  for (const constantValueType of SUPPORTED_CONSTANT_VALUE_TYPES) {
    if (typeFilter.includes(constantValueType)) {
      return true;
    }
  }
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
      const toggleConstantValueEnabled = (constantValueEnabled: boolean) => {
        onChange({
          field: value?.field ?? "",
          constantValue: value?.constantValue ?? "",
          constantValueEnabled: constantValueEnabled,
        });
      };

      return (
        <>
          {shouldDisplayConstantValueField(props.filter.types) && (
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
            id="r1"
            onClick={() => toggleConstantValueEnabled(false)}
          />
          <Label htmlFor="r1">Use Entity Value</Label>
        </div>
        <div className="ve-flex ve-items-center ve-space-x-2">
          <RadioGroupItem
            value="true"
            id="r2"
            onClick={() => toggleConstantValueEnabled(true)}
          />
          <Label htmlFor="r2">Use Constant Value</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
