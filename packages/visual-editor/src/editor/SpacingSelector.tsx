import React from "react";
import { AutoField, Field, FieldLabel } from "@puckeditor/core";
import { useTailwindConfig } from "../hooks/useTailwindConfig.tsx";
import { TailwindConfig } from "../utils/themeResolver.ts";
import { pt } from "../utils/i18n/platform.ts";
import { spacingOptions } from "../utils/themeConfigOptions.ts";

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

export const SpacingSelector = <T,>(
  label: string,
  spacingType: "padding" | "gap",
  includeDefault: boolean
): Field<T> => {
  return {
    type: "custom",
    render: ({ value, onChange }) => {
      const tailwindConfig: TailwindConfig = useTailwindConfig();

      return (
        <FieldLabel label={label}>
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
                        label: pt("spacingDefaultLabel", "Default"),
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
