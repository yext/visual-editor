import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { useTailwindConfig } from "../hooks/useTailwindConfig.tsx";
import { Combobox } from "../internal/puck/ui/Combobox.tsx";
import { pt, type MsgString } from "../utils/i18n/platform.ts";
import { fontSizeOptions } from "../utils/themeConfigOptions.ts";
import { type TailwindConfig } from "../utils/themeResolver.ts";

export const convertToPixels = (fontSize: string): number => {
  if (fontSize.endsWith("px")) {
    return parseFloat(fontSize);
  }

  if (fontSize.endsWith("rem")) {
    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    return parseFloat(fontSize) * rootFontSize;
  }

  if (fontSize.endsWith("em")) {
    const parentFontSize = parseFloat(getComputedStyle(document.body).fontSize);
    return parseFloat(fontSize) * parentFontSize;
  }

  if (fontSize.endsWith("%")) {
    const parentFontSize = parseFloat(getComputedStyle(document.body).fontSize);
    return (parseFloat(fontSize) / 100) * parentFontSize;
  }

  throw new Error("Unknown font size unit");
};

export const getCustomFontSize = (
  tailwindConfig: TailwindConfig,
  value: string
): number => {
  const customFontSize = tailwindConfig?.theme?.extend?.fontSize?.[value];
  if (typeof customFontSize === "string") {
    return convertToPixels(customFontSize);
  }
  if (Array.isArray(customFontSize) && customFontSize.length > 0) {
    return convertToPixels(customFontSize[0]);
  }
  return 0;
};

type FontSizeOption = {
  label: string;
  value: string;
  px: string;
};

export const convertDefaultFontSizesToOptions = (
  fontSizes: FontSizeOption[],
  tailwindConfig: TailwindConfig
) => {
  return fontSizes.map((option) => {
    const customFontSize = getCustomFontSize(tailwindConfig, option.value);
    const fontSizePx = customFontSize ? customFontSize.toString() : option.px;

    return {
      label: option.label + (option.px ? ` (${fontSizePx}px)` : ""),
      value: option.value,
    };
  });
};

export type FontSizeSelectorField = BaseField & {
  type: "fontSizeSelector";
  label?: string | MsgString;
  visible?: boolean;
  includeLargeSizes?: boolean;
};

type FontSizeSelectorFieldProps = FieldProps<FontSizeSelectorField>;

export const FontSizeSelectorFieldOverride = ({
  field,
  value,
  onChange,
}: FontSizeSelectorFieldProps) => {
  const tailwindConfig: TailwindConfig = useTailwindConfig();
  const options = convertDefaultFontSizesToOptions(
    [
      {
        label: pt("fontSizeDefaultLabel", "Default"),
        value: "default",
        px: "",
      },
      ...fontSizeOptions(field.includeLargeSizes ?? true).map((option) => ({
        ...option,
        label: pt(option.label),
      })),
    ],
    tailwindConfig
  );

  return (
    <FieldLabel
      label={field.label ? pt(field.label) : pt("fontSize", "Font Size")}
    >
      <Combobox
        selectedOption={
          options.find((option) => option.value === value) ?? options[0]
        }
        onChange={onChange}
        optionGroups={[{ options }]}
      />
    </FieldLabel>
  );
};
