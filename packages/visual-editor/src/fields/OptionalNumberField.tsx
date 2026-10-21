import React from "react";
import {
  AutoField,
  BaseField,
  FieldLabel,
  type FieldProps,
} from "@puckeditor/core";
import { pt, type MsgString } from "../utils/i18n/platform.ts";

const SHOW_OPTION_VALUE = "__ve_optionalNumber_show__";
const HIDE_OPTION_VALUE = "__ve_optionalNumber_hide__";

type OptionalNumberValue = number | string | null | undefined;

export type OptionalNumberField = BaseField & {
  type: "optionalNumber";
  label?: string | MsgString;
  hideNumberFieldRadioLabel: string | MsgString;
  showNumberFieldRadioLabel: string | MsgString;
  defaultCustomValue: number;
};

type OptionalNumberFieldProps = FieldProps<
  OptionalNumberField,
  OptionalNumberValue
>;

export const OptionalNumberFieldOverride = ({
  field,
  value,
  onChange,
}: OptionalNumberFieldProps) => {
  const isHidden = value === HIDE_OPTION_VALUE;
  const translatedLabel = field.label && pt(field.label);

  const optionalNumberField = (
    <>
      <AutoField
        field={{
          type: "radio",
          options: [
            {
              value: HIDE_OPTION_VALUE,
              label: pt(field.hideNumberFieldRadioLabel),
            },
            {
              value: SHOW_OPTION_VALUE,
              label: pt(field.showNumberFieldRadioLabel),
            },
          ],
        }}
        onChange={(nextValue) =>
          onChange(
            nextValue === HIDE_OPTION_VALUE
              ? HIDE_OPTION_VALUE
              : field.defaultCustomValue
          )
        }
        value={isHidden ? HIDE_OPTION_VALUE : SHOW_OPTION_VALUE}
      />
      {!isHidden && (
        <AutoField
          field={{ type: "number" }}
          onChange={onChange}
          value={typeof value === "number" ? value : undefined}
        />
      )}
    </>
  );

  return translatedLabel ? (
    <FieldLabel label={translatedLabel}>{optionalNumberField}</FieldLabel>
  ) : (
    <div className="ve-mt-3">{optionalNumberField}</div>
  );
};
