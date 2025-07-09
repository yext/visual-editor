import { useTranslation } from "react-i18next";
import React from "react";
import { AutoField, Field, FieldLabel } from "@measured/puck";
import { useTailwindConfig } from "../hooks/useTailwindConfig.tsx";
import { TailwindConfig } from "../utils/themeResolver.ts";
import { ChevronDown } from "lucide-react";
import { msg } from "../utils";

export const borderRadiusOptions = [
  { label: "None", value: "none", px: "0" },
  { label: "XS", value: "xs", px: "2" },
  { label: "SM", value: "sm", px: "4" },
  { label: "MD", value: "md", px: "6" },
  { label: "LG", value: "lg", px: "8" },
  { label: "XL", value: "xl", px: "12" },
  {
    label: msg("theme.radius.pill", "Pill", { context: "shape" }),
    value: "pill",
    px: "10000",
  },
];

export const convertToPixels = (borderRadius: string): number => {
  // If the border radius is already in px, just extract the number
  if (borderRadius.endsWith("px")) {
    return parseFloat(borderRadius);
  }

  // If the border radius is in rem, convert it to pixels based on the root border radius
  if (borderRadius.endsWith("rem")) {
    const rootBorderRadius = parseFloat(
      getComputedStyle(document.documentElement).borderRadius
    );
    return parseFloat(borderRadius) * rootBorderRadius;
  }

  // If the border radius is in em, convert it based on the parent border radius
  if (borderRadius.endsWith("em")) {
    const parentBorderRadius = parseFloat(
      getComputedStyle(document.body).borderRadius
    );
    return parseFloat(borderRadius) * parentBorderRadius;
  }

  // If the border radius is in % (relative to parent), convert it similarly to em
  if (borderRadius.endsWith("%")) {
    const parentBorderRadius = parseFloat(
      getComputedStyle(document.body).borderRadius
    );
    return (parseFloat(borderRadius) / 100) * parentBorderRadius;
  }

  // If no unit recognized, throw an error
  throw new Error("Unknown border radius unit");
};

export const getCustomBorderRadius = (
  tailwindConfig: TailwindConfig,
  value: string
): number => {
  const customBorderRadius = tailwindConfig?.theme?.extend?.borderRadius[value];
  if (typeof customBorderRadius == "string") {
    return convertToPixels(customBorderRadius);
  }
  if (Array.isArray(customBorderRadius) && customBorderRadius.length > 0) {
    return convertToPixels(customBorderRadius[0]);
  }
  return 0;
};

type BorderRadiusOption = {
  label: string;
  value: string;
  px: string;
};

export const convertDefaultBorderRadiusToOptions = (
  borderRadius: BorderRadiusOption[],
  tailwindConfig: TailwindConfig
) => {
  return borderRadius.map((option) => {
    const customBorderRadius = getCustomBorderRadius(
      tailwindConfig,
      option.value
    );
    const borderRadiusPx = customBorderRadius
      ? customBorderRadius.toString()
      : option.px;
    return {
      label: option.label + (option.px ? ` (${borderRadiusPx}px)` : ""),
      value: option.value,
    };
  });
};

export const BorderRadiusSelector = (label?: string): Field => {
  return {
    type: "custom",
    render: ({ value, onChange }) => {
      const { t } = useTranslation();
      const tailwindConfig: TailwindConfig = useTailwindConfig();

      return (
        <FieldLabel
          label={label ?? "Border Radius"}
          icon={<ChevronDown size={16} />}
        >
          <AutoField
            value={value}
            onChange={onChange}
            field={{
              type: "select",
              options: convertDefaultBorderRadiusToOptions(
                [
                  {
                    label: t("borderRadiusDefaultLabel", "Default"),
                    value: "default",
                    px: "",
                  },
                  ...borderRadiusOptions,
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
