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

export type StyledTextValue = BaseTextStyles;
export type StyledTextFieldValue =
  | StyledTextValue
  | {
      text: StyledTextValue;
      color?: ThemeColor;
    };

export type StyledTextField = BaseField & {
  type: "styledText";
  label?: string | MsgString;
  visible?: boolean;
  includeColor?: boolean;
  colorLabel?: string | MsgString;
};

type StyledTextFieldProps = FieldProps<StyledTextField, StyledTextFieldValue>;

const isStyledTextGroupValue = (
  value: StyledTextFieldValue | undefined
): value is { text: StyledTextValue; color?: ThemeColor } =>
  typeof value === "object" && value !== null && "text" in value;

export const StyledTextFieldOverride = ({
  field,
  value,
  onChange,
}: StyledTextFieldProps) => {
  const currentTextValue: BaseTextStyles = {
    ...defaultBaseTextStyles,
    ...(isStyledTextGroupValue(value) ? value.text : value),
  };

  const handleTextChange = (nextValue: BaseTextStyles) => {
    if (isStyledTextGroupValue(value)) {
      onChange({
        ...value,
        text: nextValue,
      });
      return;
    }

    onChange(nextValue);
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
              value={isStyledTextGroupValue(value) ? value.color : undefined}
              onChange={(nextValue) =>
                onChange({
                  text: currentTextValue,
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
