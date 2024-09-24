import React from "react";
import { AutoField, FieldLabel } from "@measured/puck";
import { Unlock } from "lucide-react";
import { RenderProps } from "../utils/renderEntityFields.tsx";
import {
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../utils/getFilteredEntityFields.ts";

export type EntityFieldType = {
  name: string;
  value: string;
};

export type RenderYextEntityFieldSelectorProps<T extends Record<string, any>> =
  {
    useDocument: (...args: any[]) => any;
    label: string;
    filter: RenderEntityFieldFilter<T>;
  };

/**
 * Allows the user to select an entity field from the document or set a constant value.
 */
export const YextEntityFieldSelector = <T extends Record<string, any>>(
  props: RenderYextEntityFieldSelectorProps<T>
) => {
  return {
    type: "custom",
    label: props.label,
    render: ({ field, value, onChange, readOnly }: RenderProps) => {
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
              onChange={(value) => {
                onChange({
                  name: value as unknown as string, // hack because the option value is a string so it comes back as a string even though TS thinks it's an object
                  value: "",
                });
              }}
              value={value?.name}
            />
            {value?.name && (
              <button
                type="button"
                className={"entityField"}
                onClick={() => {
                  onChange({ name: "", value: value?.value });
                }}
              >
                <span className="entityField-unlock-icon">
                  <Unlock size={16} />
                </span>
                <span>Use a constant value</span>
              </button>
            )}
          </FieldLabel>
          <FieldLabel
            label={readOnly ? "Value" : "Constant Value"}
            readOnly={readOnly}
            className="entityField-value"
          >
            <AutoField
              readOnly={readOnly}
              onChange={(value) =>
                onChange({
                  name: "",
                  value: value,
                })
              }
              value={value?.value}
              field={{
                type: "text",
              }}
            />
          </FieldLabel>
        </>
      );
    },
  };
};
