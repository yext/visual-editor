import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { ThemeOptions, type ThemeColor } from "../utils/themeConfigOptions.ts";
import { msg, pt, type MsgString } from "../utils/i18n/platform.ts";
import { ColorPickerInput } from "./ColorSelector.tsx";
import {
  getContrastingColor,
  getThemeColorHexValue,
  isCustomThemeColorToken,
} from "../utils/colors.ts";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { BasicSelectorCombobox } from "./BasicSelectorCombobox.tsx";

/** Theme colors always retain authored tokens and resolve both CSS colors. */
export type ThemeColorField = BaseField & {
  type: "themeColor";
  /** Selects site or background palette choices. */
  options: "SITE_COLOR" | "BACKGROUND_COLOR";
  label?: string | MsgString;
  visible?: boolean;
  translateOptions?: boolean;
  noOptionsPlaceholder?: string | MsgString;
  noOptionsMessage?: string | MsgString;
  disableSearch?: boolean;
};

// The combobox returns only option.value, so use a marker value to detect
// the Other option before converting it to a ThemeColor.
const CUSTOM_COLOR_OPTION_VALUE = "__visual_editor_custom_color__";

const isThemeColorValue = (value: unknown): value is ThemeColor => {
  return (
    typeof value === "object" &&
    value !== null &&
    "selectedColor" in value &&
    typeof (value as ThemeColor).selectedColor === "string"
  );
};

const isCustomThemeColorValue = (value: unknown): value is ThemeColor => {
  return (
    isThemeColorValue(value) && isCustomThemeColorToken(value.selectedColor)
  );
};

const toCustomThemeColor = (hexColor: string): ThemeColor => {
  const selectedColor = hexColor.toUpperCase();
  const contrastingColor =
    getContrastingColor(selectedColor, 12, 400) === "#FFFFFF"
      ? "white"
      : "black";

  return {
    selectedColor: `[${selectedColor}]`,
    contrastingColor,
    isDarkColor: contrastingColor === "white",
  };
};

/** Edits palette and custom ThemeColor values without changing their authored shape. */
export const ThemeColorFieldOverride = ({
  field,
  value,
  onChange,
}: FieldProps<ThemeColorField, ThemeColor | undefined>) => {
  const templateProps = React.useContext(TemplatePropsContext);
  const customColorHex =
    getThemeColorHexValue(
      isThemeColorValue(value) ? value.selectedColor : undefined,
      templateProps?.document
    ) ?? "#000000";

  return (
    <>
      <BasicSelectorCombobox
        field={{
          ...field,
          type: "basicSelector",
          optionGroups: [
            ...ThemeOptions[field.options],
            {
              title:
                field.translateOptions === false
                  ? pt("fields.customColor", "Custom Color")
                  : msg("fields.customColor", "Custom Color"),
              options: [
                {
                  label:
                    field.translateOptions === false
                      ? pt("fields.options.other", "Other")
                      : msg("fields.options.other", "Other"),
                  value: CUSTOM_COLOR_OPTION_VALUE,
                  colorStyle: { backgroundColor: customColorHex },
                },
              ],
            },
          ],
          options: undefined,
        }}
        value={
          isCustomThemeColorValue(value) ? CUSTOM_COLOR_OPTION_VALUE : value
        }
        onChange={(nextValue) =>
          onChange(
            nextValue === CUSTOM_COLOR_OPTION_VALUE
              ? toCustomThemeColor(customColorHex)
              : (nextValue as ThemeColor)
          )
        }
      />
      {isCustomThemeColorValue(value) && (
        <div className="ve-mt-3">
          <FieldLabel label={pt("fields.customColor", "Custom Color")} el="div">
            <ColorPickerInput
              ariaLabel={pt("colorPicker.open", "Open color picker")}
              value={customColorHex}
              onChange={(nextColor) => onChange(toCustomThemeColor(nextColor))}
            />
          </FieldLabel>
        </div>
      )}
    </>
  );
};
