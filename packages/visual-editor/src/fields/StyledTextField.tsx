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
  fontFamily?: string | "default";
  fontSize?: string | "default";
  fontWeight?: string | "default";
  fontStyle?: "normal" | "italic" | "default";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize" | "default";
};

export type StyledTextField = BaseField & {
  type: "styledText";
  label?: string | MsgString;
  visible?: boolean;
};

type StyledTextFieldProps = FieldProps<StyledTextField, StyledTextValue>;

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

const translateOptions = (options: StyleSelectOption[]) =>
  options.map((option) => ({ ...option, label: pt(option.label) }));

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
  const currentValue = value ?? {};
  const customFonts = templateMetadata.customFonts ?? {};
  const fontList = React.useMemo(
    () => ({
      ...defaultFonts,
      ...customFonts,
    }),
    [customFonts]
  );
  const fontOptions = React.useMemo(
    () => getFontOptions(customFonts),
    [customFonts]
  );
  const fontSizeOptions = React.useMemo(
    () => withDefaultOption(translateOptions(ThemeOptions.FONT_SIZE())),
    []
  );
  const textTransformOptions = React.useMemo(
    () => withDefaultOption(translateOptions(ThemeOptions.TEXT_TRANSFORM)),
    []
  );
  const getAvailableFontWeightOptions = React.useCallback(
    (fontFamilyValue: string | undefined) =>
      getFontWeightOptionsForFontFamily(fontFamilyValue, {
        fontList,
      }),
    [fontList]
  );
  const getAvailableFontStyleOptions = React.useCallback(
    (fontFamilyValue: string | undefined) =>
      getFontStyleOptionsForFontFamily(fontFamilyValue, {
        fontList,
      }),
    [fontList]
  );
  const fontWeightOptions = React.useMemo(
    () => getAvailableFontWeightOptions(currentValue.fontFamily),
    [currentValue.fontFamily, getAvailableFontWeightOptions]
  );
  const fontStyleOptions = React.useMemo(
    () => getAvailableFontStyleOptions(currentValue.fontFamily),
    [currentValue.fontFamily, getAvailableFontStyleOptions]
  );
  const translatedFontWeightOptions = React.useMemo(
    () =>
      withDefaultOption(
        fontWeightOptions.map((option) => ({
          ...option,
          label: pt(option.label),
        }))
      ),
    [fontWeightOptions]
  );
  const translatedFontStyleOptions = React.useMemo(
    () =>
      withDefaultOption(
        fontStyleOptions.map((option) => ({
          ...option,
          label: pt(option.label),
        }))
      ),
    [fontStyleOptions]
  );

  const correctFontSelections = React.useCallback(
    (nextValue: StyledTextValue) =>
      correctStyledTextValue(
        nextValue,
        getAvailableFontWeightOptions(nextValue.fontFamily),
        getAvailableFontStyleOptions(nextValue.fontFamily)
      ),
    [getAvailableFontStyleOptions, getAvailableFontWeightOptions]
  );
  const correctedValue = React.useMemo(
    () => correctFontSelections(currentValue),
    [correctFontSelections, currentValue]
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
    onChange(
      correctFontSelections({
        ...currentValue,
        [key]: nextValue,
      })
    );
  };

  return (
    <div className="ve-flex ve-flex-col ve-gap-3">
      {field.label && (
        <div className="ve-text-sm ve-font-medium">{pt(field.label)}</div>
      )}
      <FontSelector
        label={pt("theme.font", "Font")}
        options={fontOptions}
        value={currentValue.fontFamily ?? ""}
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
        value={correctedValue.fontWeight ?? ""}
        onChange={(nextValue) => updateValue("fontWeight", nextValue)}
      />
      <FontStyleSelector
        label={pt("fields.fontStyle", "Font Style")}
        options={translatedFontStyleOptions}
        value={correctedValue.fontStyle ?? ""}
        onChange={(nextValue) =>
          updateValue("fontStyle", nextValue as StyledTextValue["fontStyle"])
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
  );
};
