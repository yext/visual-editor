import React from "react";
import { CustomField, FieldLabel, AutoField } from "@measured/puck";

export type NumberOrDefault = number | "default";

export type NumberFieldWithDefaultOptionProps = {
  label: string;
  defaultCustomValue: number;
};

type NumberFieldWithDefaultOptionRenderProps = {
  value: NumberOrDefault;
  onChange: (e: NumberOrDefault) => void;
};

export const NumberFieldWithDefaultOption = ({
  label,
  defaultCustomValue,
}: NumberFieldWithDefaultOptionProps): CustomField<NumberOrDefault> => {
  return {
    type: "custom",
    render: ({ onChange, value }: NumberFieldWithDefaultOptionRenderProps) => {
      return (
        <FieldLabel label={label}>
          <AutoField
            field={{
              type: "radio",
              options: [
                { value: "default", label: "Default" },
                { value: "custom", label: "Custom" },
              ],
            }}
            onChange={(e) =>
              onChange(e === "default" ? "default" : defaultCustomValue)
            }
            value={value === "default" ? "default" : "custom"}
          />
          {value !== "default" && (
            <AutoField
              field={{ type: "number" }}
              value={value}
              onChange={onChange}
            />
          )}
        </FieldLabel>
      );
    },
  };
};
