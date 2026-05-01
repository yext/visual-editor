import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { Combobox } from "../internal/puck/ui/Combobox.tsx";
import { FontSelector } from "../internal/puck/components/FontSelector.tsx";
import { FontStyleSelector } from "../internal/puck/components/FontStyleSelector.tsx";
import { FontWeightSelector } from "../internal/puck/components/FontWeightSelector.tsx";
import { useTemplateMetadata } from "../internal/hooks/useMessageReceivers.ts";
import {
  constructFontSelectOptions,
  defaultFonts,
  getFontStyleOptionsForFontFamily,
  getFontWeightOptionsForFontFamily,
  type FontRegistry,
} from "../utils/fonts/visualEditorFonts.ts";
import { ThemeOptions } from "../utils/themeConfigOptions.ts";
import { pt, type MsgString } from "../utils/i18n/platform.ts";
import type { StyleSelectOption } from "../utils/themeResolver.ts";

export type StyledTextValue = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: "normal" | "italic" | "default";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize" | "default";
};

export type StyledTextField = BaseField & {
  type: "styledText";
  label?: string | MsgString;
  visible?: boolean;
};

type StyledTextFieldProps = FieldProps<StyledTextField, StyledTextValue>;

const defaultStyledTextValue: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const defaultOption = {
  label: pt("fontSizeDefaultLabel", "Default"),
  value: "default",
};

const withDefaultOption = (options: StyleSelectOption[]) => [
  defaultOption,
  ...options,
];

const getFontOptions = (customFonts: FontRegistry = {}) => [
  defaultOption,
  ...constructFontSelectOptions(customFonts),
  ...constructFontSelectOptions(defaultFonts).filter(
    (option) => !(option.label in customFonts)
  ),
];

// Font weight and style options depend on the selected font, so reset unsupported
// values back to Default when the font changes.
const correctStyledTextValue = (
  nextValue: StyledTextValue,
  availableFontWeights: StyleSelectOption[],
  availableFontStyles: StyleSelectOption[]
) => {
  let correctedValue = nextValue;

  if (
    nextValue.fontWeight &&
    nextValue.fontWeight !== "default" &&
    availableFontWeights.length > 0 &&
    !availableFontWeights.some(
      (option) => option.value === nextValue.fontWeight
    )
  ) {
    correctedValue = {
      ...correctedValue,
      fontWeight: "default",
    };
  }

  if (
    nextValue.fontStyle &&
    nextValue.fontStyle !== "default" &&
    availableFontStyles.length > 0 &&
    !availableFontStyles.some((option) => option.value === nextValue.fontStyle)
  ) {
    correctedValue = {
      ...correctedValue,
      fontStyle: "default",
    };
  }

  return correctedValue;
};

export const StyledTextFieldOverride = ({
  field,
  value,
  onChange,
}: StyledTextFieldProps) => {
  const templateMetadata = useTemplateMetadata();
  const currentValue: StyledTextValue = {
    ...defaultStyledTextValue,
    ...value,
  };
  const customFonts = templateMetadata.customFonts ?? {};
  const fontList = {
    ...defaultFonts,
    ...customFonts,
  };
  const fontOptions = getFontOptions(customFonts);
  const fontSizeOptions = withDefaultOption(ThemeOptions.FONT_SIZE());
  const textTransformOptions = withDefaultOption(
    ThemeOptions.TEXT_TRANSFORM.map((option) => ({
      ...option,
      label: pt(option.label),
    }))
  );
  const fontWeightOptions = getFontWeightOptionsForFontFamily(
    currentValue.fontFamily,
    { fontList }
  );
  const fontStyleOptions = getFontStyleOptionsForFontFamily(
    currentValue.fontFamily,
    { fontList }
  );
  const translatedFontWeightOptions = withDefaultOption(
    fontWeightOptions.map((option) => ({
      ...option,
      label: pt(option.label),
    }))
  );
  const translatedFontStyleOptions = withDefaultOption(
    fontStyleOptions.map((option) => ({
      ...option,
      label: pt(option.label),
    }))
  );
  const correctedValue = correctStyledTextValue(
    currentValue,
    fontWeightOptions,
    fontStyleOptions
  );

  React.useEffect(() => {
    if (
      correctedValue.fontWeight !== currentValue.fontWeight ||
      correctedValue.fontStyle !== currentValue.fontStyle
    ) {
      onChange(correctedValue);
    }
  }, [correctedValue, currentValue, onChange]);

  const updateValue = <Key extends keyof StyledTextValue>(
    key: Key,
    nextValue: StyledTextValue[Key]
  ) => {
    const nextStyledTextValue = {
      ...currentValue,
      [key]: nextValue,
    };

    const nextFontWeightOptions = getFontWeightOptionsForFontFamily(
      nextStyledTextValue.fontFamily,
      { fontList }
    );
    const nextFontStyleOptions = getFontStyleOptionsForFontFamily(
      nextStyledTextValue.fontFamily,
      { fontList }
    );

    onChange(
      correctStyledTextValue(
        nextStyledTextValue,
        nextFontWeightOptions,
        nextFontStyleOptions
      )
    );
  };

  return (
    <div>
      {field.label && (
        <div className="ve-mb-3 ve-text-sm ve-font-medium">
          {pt(field.label)}
        </div>
      )}
      <div className="ObjectField">
        <div className="ObjectField-fieldset ve-flex ve-flex-col ve-gap-3">
          <FontSelector
            label={pt("theme.font", "Font")}
            options={fontOptions}
            value={currentValue.fontFamily}
            onChange={(nextValue) => updateValue("fontFamily", nextValue)}
          />
          <FieldLabel label={pt("theme.fontSize", "Font Size")}>
            <Combobox
              selectedOption={
                fontSizeOptions.find(
                  (option) => option.value === currentValue.fontSize
                ) ?? fontSizeOptions[0]
              }
              onChange={(nextValue) => updateValue("fontSize", nextValue)}
              optionGroups={[{ options: fontSizeOptions }]}
              disableSearch
            />
          </FieldLabel>
          <FontWeightSelector
            label={pt("theme.fontWeight.fontWeight", "Font Weight")}
            options={translatedFontWeightOptions}
            value={correctedValue.fontWeight}
            onChange={(nextValue) => updateValue("fontWeight", nextValue)}
          />
          <FontStyleSelector
            label={pt("fields.fontStyle", "Font Style")}
            options={translatedFontStyleOptions}
            value={correctedValue.fontStyle}
            onChange={(nextValue) =>
              updateValue(
                "fontStyle",
                nextValue as StyledTextValue["fontStyle"]
              )
            }
          />
          <FieldLabel
            label={pt("theme.textTransform.textTransform", "Text Transform")}
          >
            <Combobox
              selectedOption={
                textTransformOptions.find(
                  (option) => option.value === currentValue.textTransform
                ) ?? textTransformOptions[0]
              }
              onChange={(nextValue) => updateValue("textTransform", nextValue)}
              optionGroups={[{ options: textTransformOptions }]}
              disableSearch
            />
          </FieldLabel>
        </div>
      </div>
    </div>
  );
};
