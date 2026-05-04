import React from "react";
import { FieldLabel } from "@puckeditor/core";
import { pt } from "../../utils/i18n/platform.ts";
import { StyleSelectOption } from "../../utils/themeResolver.ts";
import {
  constructFontSelectOptions,
  defaultFonts,
  FontRegistry,
  getFontStyleOptionsForFontFamily,
  getFontWeightOptionsForFontFamily,
} from "../../utils/fonts/visualEditorFonts.ts";
import { useTemplateMetadata } from "../../internal/hooks/useMessageReceivers.ts";
import { ThemeOptions } from "../../utils/themeConfigOptions.ts";
import { FontSelector } from "../../internal/puck/components/FontSelector.tsx";
import { Combobox } from "../../internal/puck/ui/Combobox.tsx";
import { FontWeightSelector } from "../../internal/puck/components/FontWeightSelector.tsx";
import { FontStyleSelector } from "../../internal/puck/components/FontStyleSelector.tsx";

/**
 * Defines the core typography styling properties shared across text-based components.
 */
export type BaseTextStyles = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: "normal" | "italic" | "default";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize" | "default";
};

/**
 * The default values for baseline typography properties, initializing all fields to "default".
 */
export const defaultBaseTextStyles: BaseTextStyles = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const defaultOption = {
  label: pt("default", "Default"),
  value: "default",
};

const getFontOptions = (customFonts: FontRegistry = {}) => [
  defaultOption,
  ...constructFontSelectOptions(customFonts),
  ...constructFontSelectOptions(defaultFonts).filter(
    (option) => !(option.label in customFonts)
  ),
];

/**
 * Utility to prepend the standard default option to an existing array of style options.
 *
 * @param options - The array of options to augment.
 * @returns A new array with the default option at the 0th index.
 */
export const withDefaultOption = (options: StyleSelectOption[]) => [
  defaultOption,
  ...options,
];

/**
 * Validates and corrects font weight and style values based on the currently selected font family.
 * Font weight and style options depend heavily on the selected font family; this ensures unsupported
 * values are reset back to "default" when the font family changes.
 *
 * @param nextValue - The proposed typography style object.
 * @param availableFontWeights - The list of valid font weights for the active font family.
 * @param availableFontStyles - The list of valid font styles for the active font family.
 * @returns A sanitized typography style object containing only supported values.
 */
const correctTypographyValues = <T extends BaseTextStyles>(
  nextValue: T,
  availableFontWeights: StyleSelectOption[],
  availableFontStyles: StyleSelectOption[]
): T => {
  let correctedValue = { ...nextValue };

  if (
    nextValue.fontWeight !== "default" &&
    availableFontWeights.length > 0 &&
    !availableFontWeights.some((opt) => opt.value === nextValue.fontWeight)
  ) {
    correctedValue.fontWeight = "default";
  }

  if (
    nextValue.fontStyle !== "default" &&
    availableFontStyles.length > 0 &&
    !availableFontStyles.some((opt) => opt.value === nextValue.fontStyle)
  ) {
    correctedValue.fontStyle = "default";
  }

  return correctedValue;
};

/**
 * A custom hook that manages the state, selection options, and validation logic
 * for typography-related fields within the editor.
 *
 * @param currentValue - The current state of the typography properties.
 * @param onChange - Callback function triggered when a typography property is updated and validated.
 * @returns An object containing the derived options, the validated current value, and an update handler.
 */
export function useTypographyOptions<T extends BaseTextStyles>(
  currentValue: T,
  onChange: (value: T) => void
) {
  const templateMetadata = useTemplateMetadata();
  const customFonts = templateMetadata.customFonts ?? {};
  const fontList = { ...defaultFonts, ...customFonts };
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
    fontWeightOptions.map((option) => ({ ...option, label: pt(option.label) }))
  );
  const translatedFontStyleOptions = withDefaultOption(
    fontStyleOptions.map((option) => ({ ...option, label: pt(option.label) }))
  );

  const correctedValue = correctTypographyValues(
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

  const updateValue = <Key extends keyof T>(key: Key, nextValue: T[Key]) => {
    const nextStyledValue = { ...currentValue, [key]: nextValue };
    const nextFontWeightOptions = getFontWeightOptionsForFontFamily(
      nextStyledValue.fontFamily,
      { fontList }
    );
    const nextFontStyleOptions = getFontStyleOptionsForFontFamily(
      nextStyledValue.fontFamily,
      { fontList }
    );

    onChange(
      correctTypographyValues(
        nextStyledValue,
        nextFontWeightOptions,
        nextFontStyleOptions
      )
    );
  };

  return {
    fontOptions,
    fontSizeOptions,
    textTransformOptions,
    translatedFontWeightOptions,
    translatedFontStyleOptions,
    correctedValue,
    updateValue,
  };
}

/**
 * A shared UI component that renders standard typography configuration fields
 * (Font Family, Size, Weight, Style, and Transform).
 *
 * @param props - Component props.
 * @param props.currentValue - The current values for the typography fields.
 * @param props.typographyOptions - The state and handlers returned from the `useTypographyOptions` hook.
 * @returns A React fragment containing the typography field controls.
 */
export function BaseTypographyFields<T extends BaseTextStyles>({
  currentValue,
  typographyOptions,
}: {
  currentValue: T;
  typographyOptions: ReturnType<typeof useTypographyOptions<T>>;
}) {
  const {
    fontOptions,
    fontSizeOptions,
    textTransformOptions,
    translatedFontWeightOptions,
    translatedFontStyleOptions,
    correctedValue,
    updateValue,
  } = typographyOptions;

  return (
    <>
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
          updateValue("fontStyle", nextValue as T["fontStyle"])
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
    </>
  );
}
