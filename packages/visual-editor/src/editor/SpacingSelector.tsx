import React from "react";
import { AutoField, Field, FieldLabel } from "@measured/puck";
import { useTailwindConfig } from "../hooks/useTailwindConfig.tsx";
import { TailwindConfig } from "../utils/themeResolver.ts";
import { ChevronDown } from "lucide-react";
import { usePlatformTranslation } from "../utils/i18nPlatform.ts";

export const spacingOptions = [
  { label: "0", value: "0", px: "0" },
  { label: "0.5", value: "0.5", px: "2" },
  { label: "1", value: "1", px: "4" },
  { label: "1.5", value: "1.5", px: "6" },
  { label: "2", value: "2", px: "8" },
  { label: "2.5", value: "2.5", px: "10" },
  { label: "3", value: "3", px: "12" },
  { label: "3.5", value: "3.5", px: "14" },
  { label: "4", value: "4", px: "16" },
  { label: "5", value: "5", px: "20" },
  { label: "6", value: "6", px: "24" },
  { label: "7", value: "7", px: "28" },
  { label: "8", value: "8", px: "32" },
  { label: "9", value: "9", px: "36" },
  { label: "10", value: "10", px: "40" },
  { label: "11", value: "11", px: "44" },
  { label: "12", value: "12", px: "48" },
  { label: "14", value: "14", px: "56" },
  { label: "16", value: "16", px: "64" },
  { label: "20", value: "20", px: "80" },
  { label: "24", value: "24", px: "96" },
];

const convertToPixels = (spacing: string): number => {
  if (spacing.endsWith("px")) {
    return parseFloat(spacing);
  }

  // If no unit recognized, throw an error
  throw new Error("Unknown spacing unit");
};

const getCustomSpacing = (
  spacingType: "padding" | "gap",
  tailwindConfig: TailwindConfig,
  value: string
): number => {
  const customSpacing = tailwindConfig?.theme?.extend?.[spacingType]?.[value];
  if (typeof customSpacing == "string") {
    return convertToPixels(customSpacing);
  }
  if (Array.isArray(customSpacing) && customSpacing.length > 0) {
    return convertToPixels(customSpacing[0]);
  }
  return 0;
};

type SpacingOption = {
  label: string;
  value: string;
  px: string;
};

const convertDefaultSpacingsToOptions = (
  spacingType: "padding" | "gap",
  spacings: SpacingOption[],
  tailwindConfig: TailwindConfig
) => {
  return spacings.map((option) => {
    const customSpacing = getCustomSpacing(
      spacingType,
      tailwindConfig,
      option.value
    );
    const spacingPx = customSpacing ? customSpacing.toString() : option.px;
    return {
      label: option.px ? `${spacingPx}px` : option.label,
      value: option.value,
    };
  });
};

export const SpacingSelector = (
  label: string,
  spacingType: "padding" | "gap",
  includeDefault: boolean
): Field => {
  return {
    type: "custom",
    render: ({ value, onChange }) => {
      const { t } = usePlatformTranslation();
      const tailwindConfig: TailwindConfig = useTailwindConfig();

      return (
        <FieldLabel label={label} icon={<ChevronDown size={16} />}>
          <AutoField
            value={value}
            onChange={onChange}
            field={{
              type: "select",
              options: convertDefaultSpacingsToOptions(
                spacingType,
                includeDefault
                  ? [
                      {
                        label: t("spacingDefaultLabel", "Default"),
                        value: "default",
                        px: "",
                      },
                      ...spacingOptions,
                    ]
                  : spacingOptions,
                tailwindConfig
              ),
            }}
          />
        </FieldLabel>
      );
    },
  };
};
