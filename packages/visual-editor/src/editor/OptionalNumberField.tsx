import React from "react";
import { CustomField, FieldLabel, AutoField } from "@measured/puck";

export type OptionalNumberFieldProps = {
  fieldLabel: string;
  hideNumberFieldRadioLabel: string;
  showNumberFieldRadioLabel: string;
  defaultCustomValue: number;
};

type OptionalNumberFieldRenderProps = {
  value: number | string;
  onChange: (e: number | string) => void;
};

export const OptionalNumberField = ({
  fieldLabel,
  hideNumberFieldRadioLabel,
  showNumberFieldRadioLabel,
  defaultCustomValue,
}: OptionalNumberFieldProps): CustomField<number | string> => {
  const showNumberField = showNumberFieldRadioLabel.toLowerCase();

  return {
    type: "custom",
    render: ({ onChange, value }: OptionalNumberFieldRenderProps) => {
      return (
        <FieldLabel label={fieldLabel}>
          <AutoField
            field={{
              type: "radio",
              options: [
                {
                  value: hideNumberFieldRadioLabel,
                  label: hideNumberFieldRadioLabel,
                },
                { value: showNumberField, label: showNumberFieldRadioLabel },
              ],
            }}
            onChange={(e) =>
              onChange(
                e === hideNumberFieldRadioLabel
                  ? hideNumberFieldRadioLabel
                  : defaultCustomValue
              )
            }
            value={
              value === hideNumberFieldRadioLabel
                ? hideNumberFieldRadioLabel
                : showNumberField
            }
          />
          {value !== hideNumberFieldRadioLabel && (
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
