import React from "react";
import { BaseField, type FieldProps } from "@puckeditor/core";
import { pt, type MsgString } from "../../utils/i18n/platform.ts";
import {
  BaseTextStyles,
  BaseTypographyFields,
  defaultBaseTextStyles,
  useTypographyOptions,
} from "./baseText.tsx";

export type StyledTextValue = BaseTextStyles;

export type StyledTextField = BaseField & {
  type: "styledText";
  label?: string | MsgString;
  visible?: boolean;
};

type StyledTextFieldProps = FieldProps<StyledTextField, StyledTextValue>;

export const StyledTextFieldOverride = ({
  field,
  value,
  onChange,
}: StyledTextFieldProps) => {
  const currentValue: BaseTextStyles = {
    ...defaultBaseTextStyles,
    ...value,
  };

  const typographyOptions = useTypographyOptions(currentValue, onChange);

  return (
    <div>
      {field.label && (
        <div className="ve-mb-3 ve-text-sm ve-font-medium">
          {pt(field.label)}
        </div>
      )}
      <div className="ObjectField">
        <div className="ObjectField-fieldset ve-flex ve-flex-col ve-gap-3">
          <BaseTypographyFields
            currentValue={currentValue}
            typographyOptions={typographyOptions}
          />
        </div>
      </div>
    </div>
  );
};
