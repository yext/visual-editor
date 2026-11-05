import type {
  ComboboxOption,
  ComboboxOptionGroup,
} from "../internal/types/combobox.ts";
import { msg, pt } from "./i18n/platform.ts";
import { ThemeOptions } from "./themeConfigOptions.ts";

/** Stable saved width values used by generation and canonical selector groups. */
export const canonicalWidthOptions = [
  { label: msg("default", "Default"), value: "default" },
  {
    label: msg(
      "fields.options.matchOtherSections",
      "Match Other Sections ({{value}})",
      { value: pt("default", "Default") }
    ),
    value: "theme",
  },
  ...ThemeOptions.MAX_WIDTH,
  { label: msg("fields.options.fullWidth", "Full Width"), value: "fullWidth" },
];

/** Resolve only known option keys; never inspect mounted theme or editor state. */
export const resolveCanonicalSelectorGroups = (
  key: keyof typeof ThemeOptions
): ComboboxOptionGroup[] => {
  if (key === "MAX_WIDTH") {
    return [{ options: canonicalWidthOptions }];
  }
  const preset = Object.hasOwn(ThemeOptions, key)
    ? ThemeOptions[key]
    : undefined;
  const options = typeof preset === "function" ? preset() : preset;
  if (!Array.isArray(options)) {
    return [];
  }
  return options.length && "options" in options[0]
    ? (options as ComboboxOptionGroup[])
    : [{ options: options as ComboboxOption[] }];
};
