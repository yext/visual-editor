import { useThemeData } from "../hooks/useThemeData.ts";

import { BaseField, type FieldProps } from "@puckeditor/core";
import { type ThemeColor } from "../utils/themeConfigOptions.ts";
import { pt, type MsgString } from "../utils/i18n/platform.ts";
import { ColorPickerInput } from "./ColorSelector.tsx";
import { getContrastingColor } from "../utils/colors.ts";

import { BasicSelectorCombobox } from "./BasicSelectorCombobox.tsx";

/** Theme colors always retain authored tokens and resolve both CSS colors. */
export type ThemeColorField = BaseField & {
  type: "themeColor";
  /** Selects site or background palette choices. */
  options: "SITE_COLOR" | "BACKGROUND_COLOR";
  label?: string | MsgString;
  visible?: boolean;
  translateOptions?: boolean;
  noOptionsPlaceholder?: string | MsgString;
  noOptionsMessage?: string | MsgString;
  disableSearch?: boolean;
};

export const ThemeColorFieldOverride = ({
  field,
  value,
  onChange,
}: FieldProps<ThemeColorField, ThemeColor | undefined>) => {
  const theme = useThemeData();
  const isBackground = field.options === "BACKGROUND_COLOR";
  const custom = value?.selectedColor?.startsWith("[") === true;
  const customColor = custom ? value!.selectedColor!.slice(1, -1) : "#000000";
  const options = theme.colors.flatMap((entry) =>
    (isBackground
      ? ["background" as const]
      : ["background" as const, "foreground" as const]
    ).map((channel) => ({
      label: isBackground ? entry.label : `${entry.label} — ${channel}`,
      value: { colorId: entry.id, channel },
      colorStyle: { background: entry[channel] },
    }))
  );
  // Match shared references by identity/channel, independently of property order
  // or additional authored contrast metadata. This only normalizes the display.
  const selectedColor =
    options.find(
      (option) =>
        option.value.colorId === value?.colorId &&
        option.value.channel === value?.channel
    )?.value ?? value;
  const missing =
    value?.colorId !== undefined &&
    !theme.colors.some((entry) => entry.id === value.colorId);
  const selectedEntry = theme.colors.find(
    (entry) => entry.id === value?.colorId
  );
  const incompatible =
    !isBackground &&
    value?.channel &&
    selectedEntry?.[value.channel].includes("gradient(");
  return (
    <>
      <BasicSelectorCombobox
        field={{
          ...field,
          type: "basicSelector",
          translateOptions: false,
          options: [
            ...(!isBackground
              ? [{ label: pt("default", "Default"), value: undefined }]
              : []),
            ...options,
            ...(missing
              ? [{ label: `${value.colorId} (unavailable)`, value }]
              : []),
            { label: "Custom color", value: "__custom__" },
          ],
          optionGroups: undefined,
        }}
        value={
          custom
            ? "__custom__"
            : (selectedColor ?? (isBackground ? options[0]?.value : undefined))
        }
        onChange={(next) =>
          onChange(
            next === "__custom__"
              ? {
                  selectedColor: `[${customColor}]`,
                  contrastingColor: getContrastingColor(customColor, 12, 400),
                }
              : (next as ThemeColor | undefined)
          )
        }
      />
      {(missing || incompatible) && (
        <p role="status">
          This color is unavailable. Rendering uses the first compatible color.
        </p>
      )}
      {custom && (
        <ColorPickerInput
          ariaLabel="Custom color"
          value={customColor}
          alpha
          onChange={(next) =>
            onChange({
              selectedColor: `[${next}]`,
              contrastingColor: value?.contrastingColor ?? "#000000",
            })
          }
        />
      )}
    </>
  );
};
