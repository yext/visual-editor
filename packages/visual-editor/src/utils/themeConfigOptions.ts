import { ComboboxOptionGroup } from "../internal/types/combobox.ts";
import { msg, pt } from "./i18n/platform.ts";
import { PresetImageType } from "../types/types.ts";

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

export const fontSizeOptions = (includeLargeSizes = true) => {
  const fontSizeOptions = [
    { label: "XS", value: "xs", px: "12" },
    { label: "SM", value: "sm", px: "14" },
    { label: pt("base", "Base"), value: "base", px: "16" },
    { label: "LG", value: "lg", px: "18" },
    { label: "XL", value: "xl", px: "20" },
    { label: "2XL", value: "2xl", px: "24" },
    { label: "3XL", value: "3xl", px: "32" },
    { label: "4XL", value: "4xl", px: "40" },
  ];
  const largeFontSizeOptions = [
    { label: "5XL", value: "5xl", px: "48" },
    { label: "6XL", value: "6xl", px: "60" },
    { label: "7XL", value: "7xl", px: "72" },
    { label: "8XL", value: "8xl", px: "96" },
    { label: "9XL", value: "9xl", px: "128" },
  ];
  return includeLargeSizes
    ? [...fontSizeOptions, ...largeFontSizeOptions]
    : fontSizeOptions;
};

const getFontSizeOptions = (includeLargeSizes = true) => {
  return fontSizeOptions(includeLargeSizes).map((option) => {
    return {
      label: option.label + ` (${option.px}px)`,
      value: `${option.px}px`,
    };
  });
};

const getSpacingOptions = () => {
  return spacingOptions.map((option) => {
    return {
      label: option.label + ` (${option.px}px)`,
      value: `${option.px}px`,
    };
  });
};

/**
 * An object representing a color based on the theme specified by the user.
 */
export type ThemeColor =
  | {
      colorId: string;
      channel: "background" | "foreground";
      selectedColor?: never;
      contrastingColor?: string;
      isDarkColor?: boolean;
    }
  | {
      selectedColor: string;
      contrastingColor: string;
      isDarkColor?: boolean;
      colorId?: never;
      channel?: never;
    };

// Historical migrations retain this import path; runtime selectors use saved collections.
export { backgroundColors } from "../components/migrations/legacyThemeColors.ts";
const backgroundColorOptions: ComboboxOptionGroup[] = [];
export const siteColorOptions: ComboboxOptionGroup[] = [];

/** Corresponds to the different semantic heading levels */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// Provides a mapping of label to value for the basicSelector field
const headingLevelOptions: { label: string; value: HeadingLevel }[] = [
  { label: "H1", value: 1 },
  { label: "H2", value: 2 },
  { label: "H3", value: 3 },
  { label: "H4", value: 4 },
  { label: "H5", value: 5 },
  { label: "H6", value: 6 },
];

// Tailwind Theme Extensions (https://v3.tailwindcss.com/docs/theme#extending-the-default-theme)
// Ordinary utility tokens; theme entries generate their CSS directly.
export const defaultThemeTailwindExtensions = {
  colors: {
    gray: {
      100: "#F9F9F9",
      200: "#EDEDED",
      300: "#D4D4D4",
      400: "#BABABA",
      500: "#7A7A7A",
      600: "#2B2B2B",
      800: "#1F1F1F",
      900: "#121212",
    },
  },
  fontSize: { "3xl": "32px", "4xl": "40px" },
};

const letterSpacingOptions = [
  { label: "Tighter (-0.05em)", value: "-0.05em" },
  { label: "Tight (-0.025em)", value: "-0.025em" },
  { label: "Normal (0em)", value: "0em" },
  { label: "Wide (0.025em)", value: "0.025em" },
  { label: "Wider (0.05em)", value: "0.05em" },
  { label: "Widest (0.1em)", value: "0.1em" },
];

const textTransformOptions = [
  { label: msg("theme.textTransform.normal", "Normal"), value: "none" },
  {
    label: msg("theme.textTransform.uppercase", "Uppercase"),
    value: "uppercase",
  },
  {
    label: msg("theme.textTransform.lowercase", "Lowercase"),
    value: "lowercase",
  },
  {
    label: msg("theme.textTransform.capitalize", "Capitalize"),
    value: "capitalize",
  },
];

export const fontStyleOptions = [
  { label: msg("fields.options.normal", "Normal"), value: "normal" },
  { label: msg("fields.options.italic", "Italic"), value: "italic" },
];

type BorderRadiusOption = {
  label: string;
  value: string;
};

const defineBorderRadiusOptions = <
  const T extends readonly BorderRadiusOption[],
>(
  options: T
) => [...options];

const buttonBorderRadiusOptions: BorderRadiusOption[] = [
  { label: msg("theme.options.none", "None"), value: "0px" },
  { label: "XS (2px)", value: "2px" },
  { label: "SM (4px)", value: "4px" },
  { label: "MD (6px)", value: "6px" },
  { label: "LG (8px)", value: "8px" },
  { label: "XL (12px)", value: "12px" },
  { label: msg("theme.options.pill", "Pill"), value: "9999px" },
];

const imageBorderRadiusOptions = defineBorderRadiusOptions([
  { label: msg("theme.options.none", "None"), value: "0px" },
  { label: "XS (2px)", value: "2px" },
  { label: "SM (4px)", value: "4px" },
  { label: "MD (6px)", value: "6px" },
  { label: "LG (8px)", value: "8px" },
  { label: "XL (12px)", value: "12px" },
  { label: "2XL (16px)", value: "16px" },
  { label: "3XL (24px)", value: "24px" },
  { label: "4XL (32px)", value: "32px" },
  {
    label: msg("theme.options.circle", "Circle"),
    value: "9999px",
  },
] satisfies readonly BorderRadiusOption[]);

export type ImageBorderRadius =
  (typeof imageBorderRadiusOptions)[number]["value"];

const presetImageTypeOptions: {
  label: string;
  value: PresetImageType;
}[] = [
  {
    label: "App Store",
    value: "app-store",
  },
  {
    label: "Google Play",
    value: "google-play",
  },
  {
    label: "Galaxy Store",
    value: "galaxy-store",
  },
  {
    label: "App Gallery",
    value: "app-gallery",
  },
  { label: "Deliveroo", value: "deliveroo" },
  { label: "DoorDash", value: "doordash" },
  { label: "Grubhub", value: "grubhub" },
  { label: "Skip The Dishes", value: "skip-the-dishes" },
  { label: "Postmates", value: "postmates" },
  { label: "Uber Eats", value: "uber-eats" },
  { label: "ezCater", value: "ezcater" },
];

const alignmentOptions = [
  {
    label: msg("fields.options.left", "Left", { context: "direction" }),
    value: "left",
  },
  {
    label: msg("fields.options.center", "Center", { context: "direction" }),
    value: "center",
  },
  {
    label: msg("fields.options.right", "Right", { context: "direction" }),
    value: "right",
  },
];

const verticalPositionOptions = [
  {
    label: msg("fields.options.top", "Top", { context: "direction" }),
    value: "top",
  },
  {
    label: msg("fields.options.bottom", "Bottom", { context: "direction" }),
    value: "bottom",
  },
];

const justifyContentOptions = [
  { label: msg("fields.options.start", "Start"), value: "start" },
  { label: msg("fields.options.center", "Center"), value: "center" },
  { label: msg("fields.options.end", "End"), value: "end" },
];

const hoursOptions = [
  { label: msg("fields.options.monday", "Monday"), value: "monday" },
  { label: msg("fields.options.tuesday", "Tuesday"), value: "tuesday" },
  { label: msg("fields.options.wednesday", "Wednesday"), value: "wednesday" },
  { label: msg("fields.options.thursday", "Thursday"), value: "thursday" },
  { label: msg("fields.options.friday", "Friday"), value: "friday" },
  { label: msg("fields.options.saturday", "Saturday"), value: "saturday" },
  { label: msg("fields.options.sunday", "Sunday"), value: "sunday" },
  { label: msg("fields.options.today", "Today"), value: "today" },
];

const phoneOptions = [
  {
    label: msg("fields.options.domestic", "Domestic", {
      context: "phone number",
    }),
    value: "domestic",
  },
  {
    label: msg("fields.options.international", "International", {
      context: "phone number",
    }),
    value: "international",
  },
];

const maxWidthOptions = [
  {
    label: msg("theme.contentWidth.compact", "Compact (768px)"),
    value: "768px",
  },
  {
    label: msg("theme.contentWidth.narrow", "Narrow (960px)"),
    value: "960px",
  },
  {
    label: msg("theme.contentWidth.standard", "Standard (1024px)"),
    value: "1024px",
  },
  {
    label: msg("theme.contentWidth.wide", "Wide (1280px)"),
    value: "1280px",
  },
  {
    label: msg("theme.contentWidth.extraWide", "Extra Wide (1440px)"),
    value: "1440px",
  },
];

const showHideOptions = [
  { label: msg("fields.options.show", "Show"), value: true },
  { label: msg("fields.options.hide", "Hide"), value: false },
];

export const ThemeOptions = {
  HEADING_LEVEL: headingLevelOptions,
  TEXT_TRANSFORM: textTransformOptions,
  FONT_STYLE: fontStyleOptions,
  LETTER_SPACING: letterSpacingOptions,
  BACKGROUND_COLOR: backgroundColorOptions,
  SITE_COLOR: siteColorOptions,
  PRESET_IMAGE: presetImageTypeOptions,
  ALIGNMENT: alignmentOptions,
  VERTICAL_POSITION: verticalPositionOptions,
  JUSTIFY_CONTENT: justifyContentOptions,
  BUTTON_BORDER_RADIUS: buttonBorderRadiusOptions,
  IMAGE_BORDER_RADIUS: imageBorderRadiusOptions,
  SPACING: getSpacingOptions,
  FONT_SIZE: getFontSizeOptions,
  HOURS_OPTIONS: hoursOptions,
  PHONE_OPTIONS: phoneOptions,
  MAX_WIDTH: maxWidthOptions,
  SHOW_HIDE: showHideOptions,
};

// Static class safelist so Tailwind content scanning always includes
// the theme classes generated dynamically at runtime.
export const VisualEditorThemeClassSafelist = [
  "bg-white",
  "bg-black",
  "text-white",
  "text-black",
  "bg-[#00000099]",
];

// Content path for applying tailwind config to visual-editor components
export const VisualEditorComponentsContentPath =
  "node_modules/@yext/visual-editor/dist/**/*.js";
