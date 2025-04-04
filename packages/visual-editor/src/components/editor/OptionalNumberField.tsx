import React from "react";
import { CustomField, FieldLabel, AutoField } from "@measured/puck";

export type OptionalNumberFieldProps = {
  fieldLabel: string;
  hideNumberFieldRadioLabel: string;
  hideNumberFieldRadioValue: string;
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
  hideNumberFieldRadioValue,
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
                  value: hideNumberFieldRadioValue,
                  label: hideNumberFieldRadioLabel,
                },
                { value: showNumberField, label: showNumberFieldRadioLabel },
              ],
            }}
            onChange={(e) =>
              onChange(
                e === hideNumberFieldRadioValue
                  ? hideNumberFieldRadioValue
                  : defaultCustomValue
              )
            }
            value={
              value === hideNumberFieldRadioValue
                ? hideNumberFieldRadioValue
                : showNumberField
            }
          />
          {value !== hideNumberFieldRadioValue && (
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
