import React from "react";
import { FieldLabel, type BaseField, type FieldProps } from "@puckeditor/core";
import { msg, pt, type MsgString } from "../utils/i18n/platform.ts";
import {
  type SurfaceValue,
  surfaceRoleOptions,
} from "../utils/themeOptions.ts";
import {
  getThemeColorCssValue,
  getThemeColorHexValue,
} from "../utils/colors.ts";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { BasicSelectorCombobox } from "./BasicSelectorCombobox.tsx";
import { ColorPickerInput } from "./ColorSelector.tsx";
import { toCustomThemeColor } from "./ThemeColorField.tsx";

/** One background choice: a semantic variant or a custom color/gradient. */
export type SurfaceField = BaseField & {
  type: "surface";
  label?: string | MsgString;
  visible?: boolean;
  disableSearch?: boolean;
  /** Section backgrounds must establish their own surface. Defaults to true for nested content. */
  allowInherit?: boolean;
};
const CUSTOM_SURFACE = "__visual_editor_custom_surface__";

export const SurfaceFieldOverride = ({
  field,
  value,
  onChange,
}: FieldProps<SurfaceField, SurfaceValue | undefined>) => {
  const context = React.useContext(TemplatePropsContext);

  const custom = typeof value === "object" && value !== null;
  const customCss = custom ? getThemeColorCssValue(value) : undefined;
  const customColor =
    (customCss?.includes("var(") && custom
      ? getThemeColorHexValue(value.selectedColor, context?.document)
      : customCss) ?? "#000000";

  return (
    <>
      <BasicSelectorCombobox
        field={{
          ...field,
          type: "basicSelector",
          label:
            field.label ?? msg("fields.backgroundColor", "Background Color"),
          options: [
            ...(field.allowInherit !== false
              ? [
                  {
                    label: msg("fields.inheritSurface", "Inherit Parent"),
                    value: "inherit",
                  },
                ]
              : []),
            ...surfaceRoleOptions,
            {
              label: msg("fields.options.other", "Other"),
              value: CUSTOM_SURFACE,
              colorStyle: { background: customColor },
            },
          ],
        }}
        value={custom ? CUSTOM_SURFACE : value}
        onChange={(nextValue) =>
          onChange(
            nextValue === CUSTOM_SURFACE
              ? toCustomThemeColor(customColor)
              : nextValue
          )
        }
      />
      {custom && (
        <div className="ve-mt-3">
          <FieldLabel label={pt("fields.customColor", "Custom Color")} el="div">
            <ColorPickerInput
              ariaLabel={pt("colorPicker.open", "Open color picker")}
              allowGradient
              value={customColor}
              onChange={(nextColor) => onChange(toCustomThemeColor(nextColor))}
            />
          </FieldLabel>
        </div>
      )}
    </>
  );
};
