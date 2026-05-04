import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import {
  BaseTextStyles,
  BaseTypographyFields,
  defaultBaseTextStyles,
  useTypographyOptions,
  withDefaultOption,
} from "./baseText.tsx";
import { msg, MsgString, pt } from "../../utils/i18n/platform.ts";
import { ThemeOptions } from "../../utils/themeConfigOptions.ts";
import { Combobox } from "../../internal/puck/ui/Combobox.tsx";
import { YextAutoField } from "../YextAutoField.tsx";

export type StyledLinkValue = BaseTextStyles & {
  letterSpacing: string;
  includeCaret: boolean;
};

export type StyledLinkField = BaseField & {
  type: "styledLink";
  label?: string | MsgString;
  visible?: boolean;
};

type StyledLinkFieldProps = FieldProps<StyledLinkField, StyledLinkValue>;

const defaultStyledLinkValue: StyledLinkValue = {
  ...defaultBaseTextStyles,
  letterSpacing: "default",
  includeCaret: false,
};

/**
 * A custom field override for configuring link typography, letter spacing,
 * and an optional caret indicator.
 */
export const StyledLinkFieldOverride = ({
  field,
  value,
  onChange,
}: StyledLinkFieldProps) => {
  const currentValue: StyledLinkValue = {
    ...defaultStyledLinkValue,
    ...value,
  };

  const typographyOptions = useTypographyOptions(currentValue, onChange);
  const { updateValue } = typographyOptions;

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
          <FieldLabel label={pt("theme.includeCaret", "Include Caret")}>
            <YextAutoField
              field={{
                type: "radio",
                options: [
                  { label: msg("fields.options.yes", "Yes"), value: "block" },
                  { label: msg("fields.options.no", "No"), value: "none" },
                ],
              }}
              value={currentValue?.includeCaret}
              onChange={(nextValue) => updateValue("includeCaret", nextValue)}
            />
          </FieldLabel>
        </div>
      </div>
    </div>
  );
};
