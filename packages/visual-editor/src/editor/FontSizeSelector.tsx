import React from "react";
import { Field, FieldLabel } from "@puckeditor/core";
import { useTailwindConfig } from "../hooks/useTailwindConfig.tsx";
import { TailwindConfig } from "../utils/themeResolver.ts";
import { Combobox } from "../internal/puck/ui/Combobox.tsx";
import { pt } from "../utils/i18n/platform.ts";
import { fontSizeOptions } from "../utils/themeConfigOptions.ts";

export const convertToPixels = (fontSize: string): number => {
  // If the font size is already in px, just extract the number
  if (fontSize.endsWith("px")) {
    return parseFloat(fontSize);
  }

  // If the font size is in rem, convert it to pixels based on the root font size
  if (fontSize.endsWith("rem")) {
    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    return parseFloat(fontSize) * rootFontSize;
  }

  // If the font size is in em, convert it based on the parent font size
  if (fontSize.endsWith("em")) {
    const parentFontSize = parseFloat(getComputedStyle(document.body).fontSize);
    return parseFloat(fontSize) * parentFontSize;
  }

  // If the font size is in % (relative to parent), convert it similarly to em
  if (fontSize.endsWith("%")) {
    const parentFontSize = parseFloat(getComputedStyle(document.body).fontSize);
    return (parseFloat(fontSize) / 100) * parentFontSize;
  }

  // If no unit recognized, throw an error
  throw new Error("Unknown font size unit");
};

export const getCustomFontSize = (
  tailwindConfig: TailwindConfig,
  value: string
): number => {
  const customFontSize = tailwindConfig?.theme?.extend?.fontSize[value];
  if (typeof customFontSize == "string") {
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

export const FontSizeSelector = (
  label?: string,
  includeLargeSizes = true
): Field => {
  return {
    type: "custom",
    render: ({ value, onChange }) => {
      const tailwindConfig: TailwindConfig = useTailwindConfig();
      const options = convertDefaultFontSizesToOptions(
        [
          {
            label: pt("fontSizeDefaultLabel", "Default"),
            value: "default",
            px: "",
          },
          ...fontSizeOptions(includeLargeSizes).map((o) => ({
            ...o,
            label: pt(o.label),
          })),
        ],
        tailwindConfig
      );

      return (
        <FieldLabel label={label ?? pt("fontSize", "Font Size")}>
          <Combobox
            selectedOption={
              options.find((option) => option.value === value) ?? options[0]
            }
            onChange={(option: any) => onChange(option)}
            optionGroups={[{ options }]}
          />
        </FieldLabel>
      );
    },
  };
};
