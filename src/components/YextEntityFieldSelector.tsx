import React from "react";
import { AutoField, FieldLabel, Field } from "@measured/puck";
import { RenderProps } from "../internal/utils/renderEntityFields.tsx";
import {
  EntityFieldTypes,
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";

export type EntityFieldType = {
  fieldName: string;
  staticValue: string;
};

export type RenderYextEntityFieldSelectorProps<T extends Record<string, any>> =
  {
    label: string;
    filter: RenderEntityFieldFilter<T>;
  };

const STATIC_VALUE_TYPES: EntityFieldTypes[] = ["type.string", "type.phone"];
const shouldDisplayStaticValueField = (typeFilter: EntityFieldTypes[]) => {
  for (const staticValueType of STATIC_VALUE_TYPES) {
    if (typeFilter.includes(staticValueType)) {
      return true;
    }
  }
};

/**
 * Allows the user to select an entity field from the document and set a static value.
 */
export const YextEntityFieldSelector = <T extends Record<string, any>>(
  props: RenderYextEntityFieldSelectorProps<T>
): Field<EntityFieldType> => {
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
              onChange={(selectedEntityFieldName) => {
                onChange({
                  fieldName: selectedEntityFieldName,
                  staticValue: value?.staticValue ?? "",
                });
              }}
              value={value?.fieldName}
            />
          </FieldLabel>
          {shouldDisplayStaticValueField(props.filter.types) && (
            <FieldLabel
              label={"Static Value"}
              className="entityField-staticValue"
            >
              <AutoField
                onChange={(newStaticValue) =>
                  onChange({
                    fieldName: value?.fieldName ?? "",
                    staticValue: newStaticValue,
                  })
                }
                value={value?.staticValue}
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
