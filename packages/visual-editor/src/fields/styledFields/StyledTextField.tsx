import React from "react";
import { BaseField, type FieldProps } from "@puckeditor/core";
import { pt, type MsgString } from "../../utils/i18n/platform.ts";
import { BasicSelectorFieldOverride } from "../BasicSelectorField.tsx";
import { type ThemeColor } from "../../utils/themeConfigOptions.ts";
import {
  BaseTextStyles,
  BaseTypographyFields,
  defaultBaseTextStyles,
  useTypographyOptions,
} from "./baseText.tsx";

export type StyledTextValue = BaseTextStyles & {
  color?: ThemeColor;
};
export type StyledTextFieldValue = StyledTextValue;

export type StyledTextField = BaseField & {
  type: "styledText";
  label?: string | MsgString;
  visible?: boolean;
  includeColor?: boolean;
  colorLabel?: string | MsgString;
};

type StyledTextFieldProps = FieldProps<StyledTextField, StyledTextFieldValue>;

export const StyledTextFieldOverride = ({
  field,
  value,
  onChange,
}: StyledTextFieldProps) => {
  const currentTextValue: StyledTextValue = {
    ...defaultBaseTextStyles,
    ...value,
  };

  const handleTextChange = (nextValue: BaseTextStyles) => {
    onChange({
      ...nextValue,
      ...(value?.color ? { color: value.color } : {}),
    });
  };

  const typographyOptions = useTypographyOptions(
    currentTextValue,
    handleTextChange
  );

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
            currentValue={currentTextValue}
            typographyOptions={typographyOptions}
          />
          {field.includeColor ? (
            <BasicSelectorFieldOverride
              field={{
                type: "basicSelector",
                label: field.colorLabel ?? pt("fields.fontColor", "Font Color"),
                options: "SITE_COLOR",
              }}
              value={value?.color}
              onChange={(nextValue) =>
                onChange({
                  ...currentTextValue,
                  color: nextValue as ThemeColor | undefined,
                })
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
