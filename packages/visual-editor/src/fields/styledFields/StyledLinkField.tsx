import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import {
  BaseTextStyles,
  BaseTypographyFields,
  defaultBaseTextStyles,
  useTypographyOptions,
  withDefaultOption,
} from "./baseText.tsx";
import { MsgString, pt } from "../../utils/i18n/platform.ts";
import { ThemeOptions } from "../../utils/themeConfigOptions.ts";
import { Combobox } from "../../internal/puck/ui/Combobox.tsx";

export type StyledLinkValue = BaseTextStyles & {
  letterSpacing: string;
  includeCaret: string;
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
  includeCaret: "default",
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
  const includeCaretOptions = [
    { label: pt("default", "Default"), value: "default" },
    { label: pt("fields.options.yes", "Yes"), value: "block" },
    { label: pt("fields.options.no", "No"), value: "none" },
  ];

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
            <Combobox
              selectedOption={
                includeCaretOptions.find(
                  (option) => option.value === currentValue.includeCaret
                ) ?? includeCaretOptions[0]
              }
              onChange={(nextValue) => updateValue("includeCaret", nextValue)}
              optionGroups={[{ options: includeCaretOptions }]}
              disableSearch
            />
          </FieldLabel>
        </div>
      </div>
    </div>
  );
};
