import React from "react";
import { AutoField, FieldLabel, Field } from "@measured/puck";
import { RenderProps } from "../internal/utils/renderEntityFields.tsx";
import {
  EntityFieldTypes,
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";

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

      return (
        <>
          <FieldLabel label={field.label || "Label is undefined"}>
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
                });
              }}
              value={value?.field}
            />
          </FieldLabel>
          {shouldDisplayConstantValueField(props.filter.types) && (
            <FieldLabel
              label={"Constant Value"}
              className="entityField-constantValue"
            >
              <AutoField
                onChange={(newConstantValue) =>
                  onChange({
                    field: value?.field ?? "",
                    constantValue: newConstantValue,
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
