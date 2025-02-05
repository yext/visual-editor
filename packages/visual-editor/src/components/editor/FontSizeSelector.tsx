import React from "react";
import { AutoField, Field, FieldLabel } from "@measured/puck";
import { useTailwindConfig } from "../../hooks/useTailwindConfig.tsx";
import { TailwindConfig } from "../../utils/themeResolver.ts";
import { ChevronDown } from "lucide-react";

export const fontSizeOptions = (includeLargeSizes = true) => {
  const fontSizeOptions = [
    { label: "XS", value: "xs", px: "12" },
    { label: "SM", value: "sm", px: "14" },
    { label: "Base", value: "base", px: "16" },
    { label: "LG", value: "lg", px: "18" },
    { label: "XL", value: "xl", px: "20" },
    { label: "2XL", value: "2xl", px: "24" },
    { label: "3XL", value: "3xl", px: "30" },
    { label: "4XL", value: "4xl", px: "36" },
  ];
  const largeFontSizeOptions = [
    { label: "5XL", value: "5xl", px: "48" },
    { label: "6XL", value: "6xl", px: "60" },
    { label: "7XL", value: "7xl", px: "72" },
    { label: "8XL", value: "8xl", px: "96" },
    { label: "9XL", value: "9xl", px: "128" },
  ];
  return includeLargeSizes
    ? [...fontSizeOptions, ...largeFontSizeOptions]
    : fontSizeOptions;
};

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

      return (
        <FieldLabel
          label={label ?? "Font Size"}
          icon={<ChevronDown size={16} />}
        >
          <AutoField
            value={value}
            onChange={onChange}
            field={{
              type: "select",
              options: convertDefaultFontSizesToOptions(
                [
                  { label: "Default", value: "default", px: "" },
                  ...fontSizeOptions(includeLargeSizes),
                ],
                tailwindConfig
              ),
            }}
          />
        </FieldLabel>
      );
    },
  };
};
