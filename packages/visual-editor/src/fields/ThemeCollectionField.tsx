import { type BaseField, type FieldProps } from "@puckeditor/core";
import { useThemeData } from "../hooks/useThemeData.ts";
import { BasicSelectorCombobox } from "./BasicSelectorCombobox.tsx";
import { type MsgString } from "../utils/i18n/platform.ts";
import { type ThemeColorReference } from "../types/themeData.ts";

/** A saved identifier is never changed merely because its entry was removed. */
export type ThemeCollectionField = BaseField & {
  type: "themeCollection";
  collection: "colors" | "typography" | "actions";
  channel?: boolean;
  label?: string | MsgString;
  visible?: boolean;
};

export const ThemeCollectionFieldOverride = ({
  field,
  value,
  onChange,
}: FieldProps<
  ThemeCollectionField,
  string | ThemeColorReference | undefined
>) => {
  const theme = useThemeData();
  const entries = theme[field.collection];
  const entryId = typeof value === "string" ? value : value?.colorId;
  const options = entries.map((entry) => ({
    label: entry.label,
    value: entry.id,
  }));
  if (entryId && !entries.some((entry) => entry.id === entryId)) {
    options.push({ label: `${entryId} (unavailable)`, value: entryId });
  }
  const channel = typeof value === "object" ? value.channel : "background";
  return (
    <>
      <BasicSelectorCombobox
        field={{
          type: "basicSelector",
          label: field.label,
          options,
          translateOptions: false,
        }}
        value={entryId ?? entries[0]?.id}
        onChange={(next) =>
          onChange(
            field.channel ? { colorId: String(next), channel } : String(next)
          )
        }
      />
      {field.channel && (
        <select
          aria-label="Color channel"
          value={channel}
          onChange={(event) => {
            const colorId = entryId ?? entries[0]?.id;
            if (colorId) {
              onChange({
                colorId,
                channel: event.target.value as ThemeColorReference["channel"],
              });
            }
          }}
        >
          <option value="background">Background</option>
          <option value="foreground">Foreground</option>
        </select>
      )}
      {entryId && !entries.some((entry) => entry.id === entryId) && (
        <p role="status">
          This selection is unavailable. Rendering uses the first available
          option.
        </p>
      )}
    </>
  );
};
