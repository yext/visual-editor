import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { Combobox } from "../../internal/puck/ui/Combobox.tsx";
import { pt, type MsgString } from "../../utils/i18n/platform.ts";
import {
  type ImageBorderRadius,
  ThemeOptions,
} from "../../utils/themeConfigOptions.ts";
import { imageAspectRatioOptions } from "../../components/contentBlocks/image/styling.ts";
import { withDefaultOption } from "./baseText.tsx";

export type StyledImageValue = {
  borderRadius: ImageBorderRadius | "default";
  /** A positive ratio, or "default" to inherit the component's sizing. */
  aspectRatio?: number | "default";
};

export type StyledImageField = BaseField & {
  type: "styledImage";
  /** Converts the authored border radius and aspect ratio into CSS styles. */
  transform?: boolean;
  label?: string | MsgString;
  visible?: boolean;
  /** Shows the aspect-ratio control. Defaults to false. */
  includeAspectRatio?: boolean;
};

type StyledImageFieldProps = FieldProps<StyledImageField, StyledImageValue>;

const defaultStyledImageValue: StyledImageValue = {
  borderRadius: "default",
};

export const StyledImageFieldOverride = ({
  field,
  value,
  onChange,
}: StyledImageFieldProps) => {
  const currentValue: StyledImageValue = {
    ...defaultStyledImageValue,
    ...value,
  };

  const borderRadiusOptions = withDefaultOption(
    ThemeOptions.IMAGE_BORDER_RADIUS.map((option) => ({
      ...option,
      label: pt(option.label),
    }))
  );

  const aspectRatioOptions = [
    { label: pt("default", "Default"), value: "default" },
    ...imageAspectRatioOptions,
  ];

  return (
    <div>
      {field.label && (
        <div className="ve-mb-3 ve-text-sm ve-font-medium">
          {pt(field.label)}
        </div>
      )}
      <div className="ObjectField">
        <div className="ObjectField-fieldset ve-flex ve-flex-col ve-gap-3">
          <FieldLabel label={pt("theme.borderRadius", "Border Radius")}>
            <Combobox
              selectedOption={
                borderRadiusOptions.find(
                  (option) => option.value === currentValue.borderRadius
                ) ?? borderRadiusOptions[0]
              }
              onChange={(nextValue) =>
                onChange({ ...currentValue, borderRadius: nextValue })
              }
              optionGroups={[{ options: borderRadiusOptions }]}
              disableSearch
            />
          </FieldLabel>
          {field.includeAspectRatio ? (
            <FieldLabel
              label={pt("fields.options.aspectRatio", "Aspect Ratio")}
            >
              <Combobox
                selectedOption={
                  aspectRatioOptions.find(
                    (option) => option.value === currentValue.aspectRatio
                  ) ?? aspectRatioOptions[0]
                }
                onChange={(nextValue) =>
                  onChange({ ...currentValue, aspectRatio: nextValue })
                }
                optionGroups={[{ options: aspectRatioOptions }]}
                disableSearch
              />
            </FieldLabel>
          ) : null}
        </div>
      </div>
    </div>
  );
};
