import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { Combobox } from "../../internal/puck/ui/Combobox.tsx";
import { ThemeOptions } from "../../utils/themeConfigOptions.ts";
import { pt, type MsgString } from "../../utils/i18n/platform.ts";
import {
  BaseTextStyles,
  BaseTypographyFields,
  defaultBaseTextStyles,
  useTypographyOptions,
  withDefaultOption,
} from "./baseText.tsx";

export type StyledButtonValue = BaseTextStyles & {
  borderRadius: string;
  letterSpacing: string;
};

export type StyledButtonField = BaseField & {
  type: "styledButton";
  label?: string | MsgString;
  visible?: boolean;
};

type StyledButtonFieldProps = FieldProps<StyledButtonField, StyledButtonValue>;

const defaultStyledButtonValue: StyledButtonValue = {
  ...defaultBaseTextStyles,
  borderRadius: "default",
  letterSpacing: "default",
};

export const StyledButtonFieldOverride = ({
  field,
  value,
  onChange,
}: StyledButtonFieldProps) => {
  const currentValue: StyledButtonValue = {
    ...defaultStyledButtonValue,
    ...value,
  };

  const typographyOptions = useTypographyOptions(currentValue, onChange);
  const { updateValue } = typographyOptions;

  const borderRadiusOptions = withDefaultOption(
    ThemeOptions.BUTTON_BORDER_RADIUS.map((option) => ({
      ...option,
      label: pt(option.label),
    }))
  );

  const letterSpacingOptions = withDefaultOption(ThemeOptions.LETTER_SPACING);

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
          <FieldLabel label={pt("theme.borderRadius", "Border Radius")}>
            <Combobox
              selectedOption={
                borderRadiusOptions.find(
                  (option) => option.value === currentValue.borderRadius
                ) ?? borderRadiusOptions[0]
              }
              onChange={(nextValue) => updateValue("borderRadius", nextValue)}
              optionGroups={[{ options: borderRadiusOptions }]}
              disableSearch
            />
          </FieldLabel>
          <FieldLabel
            label={pt("theme.letterSpacing.letterSpacing", "Letter Spacing")}
          >
            <Combobox
              selectedOption={
                letterSpacingOptions.find(
                  (option) => option.value === currentValue.letterSpacing
                ) ?? letterSpacingOptions[0]
              }
              onChange={(nextValue) => updateValue("letterSpacing", nextValue)}
              optionGroups={[{ options: letterSpacingOptions }]}
              disableSearch
            />
          </FieldLabel>
        </div>
      </div>
    </div>
  );
};
