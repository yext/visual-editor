import { useThemeData } from "../../hooks/useThemeData.ts";
import { resolveThemeEntry } from "../../utils/dynamicTheme.ts";
import { ThemeCollectionFieldOverride } from "../ThemeCollectionField.tsx";

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
  typographyId?: string;
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
      typographyId: value?.typographyId,
      ...(value?.color ? { color: value.color } : {}),
    });
  };

  const theme = useThemeData();
  const typography = resolveThemeEntry(theme.typography, value?.typographyId);
  const typographyOptions = useTypographyOptions(
    currentTextValue,
    handleTextChange,
    typography.fontFamily
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
          <ThemeCollectionFieldOverride
            field={{
              type: "themeCollection",
              collection: "typography",
              label: "Typography",
            }}
            value={value?.typographyId}
            onChange={(typographyId) =>
              onChange({
                ...currentTextValue,
                typographyId: String(typographyId),
              })
            }
          />
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
