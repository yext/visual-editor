import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { Combobox } from "../../internal/puck/ui/Combobox.tsx";
import { pt, type MsgString } from "../../utils/i18n/platform.ts";
import { ThemeOptions } from "../../utils/themeConfigOptions.ts";
import { withDefaultOption } from "./baseText.tsx";

export type StyledImageValue = {
  borderRadius: string;
};

export type StyledImageField = BaseField & {
  type: "styledImage";
  label?: string | MsgString;
  visible?: boolean;
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
              onChange={(nextValue) => onChange({ borderRadius: nextValue })}
              optionGroups={[{ options: borderRadiusOptions }]}
              disableSearch
            />
          </FieldLabel>
        </div>
      </div>
    </div>
  );
};
