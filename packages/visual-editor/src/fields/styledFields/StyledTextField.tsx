import React from "react";
import { BaseField, type FieldProps } from "@puckeditor/core";
import { pt, type MsgString } from "../../utils/i18n/platform.ts";
import { ThemeColorFieldOverride } from "../ThemeColorField.tsx";
import { type ThemeColor } from "../../utils/themeConfigOptions.ts";
import {
  BaseTextStyles,
  BaseTypographyFields,
  defaultBaseTextStyles,
  useTypographyOptions,
} from "./baseText.tsx";

export type StyledTextValue = BaseTextStyles & {
  color?: ThemeColor;
};

export type StyledTextField = BaseField & {
  type: "styledText";
  /** Converts authored typography and color choices into CSS styles. */
  transform?: boolean;
  label?: string | MsgString;
  visible?: boolean;
  includeColor?: boolean;
  colorLabel?: string | MsgString;
};

type StyledTextFieldProps = FieldProps<StyledTextField, StyledTextValue>;

export const StyledTextFieldOverride = ({
  field,
  value,
  onChange,
}: StyledTextFieldProps) => {
  const currentTextValue: StyledTextValue = {
    ...defaultBaseTextStyles,
    ...value,
  };

  const handleTextChange = (nextValue: BaseTextStyles): void => {
    onChange({
      ...nextValue,
      ...(value?.color ? { color: value.color } : {}),
    });
  };

  const typographyOptions = useTypographyOptions(
    currentTextValue,
    handleTextChange
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
          <BaseTypographyFields
            currentValue={currentTextValue}
            typographyOptions={typographyOptions}
          />
          {field.includeColor ? (
            <ThemeColorFieldOverride
              field={{
                type: "themeColor",
                label: field.colorLabel ?? pt("fields.fontColor", "Font Color"),
                options: "SITE_COLOR",
              }}
              value={value?.color}
              onChange={(nextValue) =>
                onChange({
                  ...currentTextValue,
                  color: nextValue as ThemeColor | undefined,
                })
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
