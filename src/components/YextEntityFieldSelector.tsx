import React from "react";
import { AutoField, FieldLabel, Field, Button } from "@measured/puck";
import { RenderProps } from "../internal/utils/renderEntityFields.tsx";
import {
  EntityFieldTypes,
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";
import { Lock } from "lucide-react";

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
      const toggleConstantValueEnabled = () => {
        onChange({
          field: value?.field ?? "",
          constantValue: value?.constantValue ?? "",
          constantValueEnabled: !value?.constantValueEnabled,
        });
      };

      return (
        <>
          {!value?.constantValueEnabled ? (
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
          {shouldDisplayConstantValueField(props.filter.types) && (
            <ToggleMode
              constantValueEnabled={value?.constantValueEnabled}
              toggleConstantValueEnabled={toggleConstantValueEnabled}
            />
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
  toggleConstantValueEnabled: () => void;
}) => {
  return (
    <div className="ve-mt-2 ve-w-full">
      <Button onClick={toggleConstantValueEnabled} variant="secondary">
        {constantValueEnabled ? (
          <p>Use Entity Field</p>
        ) : (
          <>
            <Lock className="sm-icon" />
            <p>Use Constant Value</p>
          </>
        )}
      </Button>
    </div>
  );
};
