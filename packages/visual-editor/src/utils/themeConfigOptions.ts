import { ComboboxOptionGroup } from "../internal/puck/ui/Combobox.tsx";
import { fontSizeOptions } from "../editor/FontSizeSelector.tsx";
import { spacingOptions } from "../editor/SpacingSelector.tsx";
import { msg } from "./i18n/platform.ts";

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
 * Applies a theme color as the background of a page section
 * @ai This value MUST be one of the following
 * { bgColor: "bg-white", textColor: "text-black" }
 * { bgColor: "bg-palette-primary-light", textColor: "text-black", isDarkBackground: false }
 * { bgColor: "bg-palette-secondary-light", textColor: "text-black", isDarkBackground: false }
 * { bgColor: "bg-palette-tertiary-light", textColor: "text-black", isDarkBackground: false }
 * { bgColor: "bg-palette-quaternary-light", textColor: "text-black", isDarkBackground: false }
 * { bgColor: "bg-palette-primary-dark", textColor: "text-white", isDarkBackground: true }
 * { bgColor: "bg-palette-secondary-dark", textColor: "text-white", isDarkBackground: true }
 */
export type BackgroundStyle = {
  /** The tailwind background color class */
  bgColor: string;
  /** The tailwind text color class */
  textColor: string;
  /** Whether the background color is dark (for adjusting other styles based on background) */
  isDarkBackground?: boolean;
};

type BackgroundOption = {
  label: string;
  value: BackgroundStyle;
};

export const backgroundColors: Record<string, BackgroundOption> = {
  background1: {
    label: msg("theme.bg.bg1", "Background 1"),
    value: { bgColor: "bg-white", textColor: "text-black" },
  },
  background2: {
    label: msg("theme.bg.bg2", "Background 2"),
    value: {
      bgColor: "bg-palette-primary-light",
      textColor: "text-black",
    },
  },
  background3: {
    label: msg("theme.bg.bg3", "Background 3"),
    value: {
      bgColor: "bg-palette-secondary-light",
      textColor: "text-black",
    },
  },
  background4: {
    label: msg("theme.bg.bg4", "Background 4"),
    value: {
      bgColor: "bg-palette-tertiary-light",
      textColor: "text-black",
    },
  },
  background5: {
    label: msg("theme.bg.bg5", "Background 5"),
    value: {
      bgColor: "bg-palette-quaternary-light",
      textColor: "text-black",
    },
  },
  background6: {
    label: msg("theme.bg.bg6", "Background 6"),
    value: {
      bgColor: "bg-palette-primary-dark",
      textColor: "text-white",
    },
  },
  background7: {
    label: msg("theme.bg.bg7", "Background 7"),
    value: {
      bgColor: "bg-palette-secondary-dark",
      textColor: "text-white",
    },
  },
  color1: {
    label: msg("theme.bg.color1", "Color 1"),
    value: {
      bgColor: "bg-palette-primary",
      textColor: "text-palette-primary-contrast",
    },
  },
  color2: {
    label: msg("theme.bg.color2", "Color 2"),
    value: {
      bgColor: "bg-palette-secondary",
      textColor: "text-palette-secondary-contrast",
    },
  },
  color3: {
    label: msg("theme.bg.color3", "Color 3"),
    value: {
      bgColor: "bg-palette-tertiary",
      textColor: "text-palette-tertiary-contrast",
    },
  },
  color4: {
    label: msg("theme.bg.color4", "Color 4"),
    value: {
      bgColor: "bg-palette-quaternary",
      textColor: "text-palette-quaternary-contrast",
    },
  },
};

// When used in BasicSelector, the color is displayed in the dropdown.
const backgroundColorOptions: ComboboxOptionGroup[] = [
  {
    title: msg("recommendedColors", "Recommended Colors"),
    description: msg(
      "theme.colors.recommendedDescription",
      "Optimize color contrast for accessibility with these backgrounds."
    ),
    options: Object.entries(backgroundColors)
      .map(([key, { label, value }]) => {
        if (key.includes("background")) {
          return {
            label,
            value,
            color: value.bgColor,
          };
        }
      })
      .filter((o) => !!o),
  },
  {
    title: msg("siteColors", "Site Colors"),
    options: Object.entries(backgroundColors)
      .map(([key, { label, value }]) => {
        if (key.includes("color")) {
          return {
            label,
            value,
            color: value.bgColor,
          };
        }
      })
      .filter((o) => !!o),
  },
];

/** Corresponds to the different semantic heading levels */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// Provides a mapping of label to value for BasicSelector
const headingLevelOptions: { label: string; value: HeadingLevel }[] = [
  { label: "H1", value: 1 },
  { label: "H2", value: 2 },
  { label: "H3", value: 3 },
  { label: "H4", value: 4 },
  { label: "H5", value: 5 },
  { label: "H6", value: 6 },
];

// Tailwind Theme Extensions (https://v3.tailwindcss.com/docs/theme#extending-the-default-theme)
// to use in the tailwind.config.ts in conjunction with themeResolver and the theme.config
export const defaultThemeTailwindExtensions = {
  colors: {
    "palette-primary-light": "hsl(from var(--colors-palette-primary) h s 98)",
    "palette-secondary-light":
      "hsl(from var(--colors-palette-secondary) h s 98)",
    "palette-tertiary-light": "hsl(from var(--colors-palette-tertiary) h s 98)",
    "palette-quaternary-light":
      "hsl(from var(--colors-palette-quaternary) h s 98)",
    "palette-primary-dark": "hsl(from var(--colors-palette-primary) h s 20)",
    "palette-secondary-dark":
      "hsl(from var(--colors-palette-secondary) h s 20)",
    "palette-primary-contrast": "var(--colors-palette-primary-contrast)",
    "palette-secondary-contrast": "var(--colors-palette-secondary-contrast)",
    "palette-tertiary-contrast": "var(--colors-palette-tertiary-contrast)",
    "palette-quaternary-contrast": "var(--colors-palette-quaternary-contrast)",
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
  fontSize: {
    "body-xs-fontSize": "calc(var(--fontSize-body-fontSize) - 4px)",
    "body-sm-fontSize": "calc(var(--fontSize-body-fontSize) - 2px)",
    "body-lg-fontSize": "calc(var(--fontSize-body-fontSize) + 2px)",
    "link-xs-fontSize": "calc(var(--fontSize-link-fontSize) - 4px)",
    "link-sm-fontSize": "calc(var(--fontSize-link-fontSize) - 2px)",
    "3xl": "32px",
    "4xl": "40px",
  },
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

type BorderRadiusOption = {
  label: string;
  value: string;
};

const buttonBorderRadiusOptions: BorderRadiusOption[] = [
  { label: msg("theme.options.none", "None"), value: "0px" },
  { label: "XS (2px)", value: "2px" },
  { label: "SM (4px)", value: "4px" },
  { label: "MD (6px)", value: "6px" },
  { label: "LG (8px)", value: "8px" },
  { label: "XL (12px)", value: "12px" },
  { label: msg("theme.options.pill", "Pill"), value: "9999px" },
];

const imageBorderRadiusOptions: BorderRadiusOption[] = [
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
];

const ctaVariantOptions = [
  {
    label: msg("fields.options.ctaVariant.primary", "Primary"),
    value: "primary",
  },
  {
    label: msg("fields.options.ctaVariant.secondary", "Secondary"),
    value: "secondary",
  },
  { label: msg("fields.options.ctaVariant.link", "Link"), value: "link" },
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

const justifyContentOptions = [
  { label: msg("fields.options.start", "Start"), value: "start" },
  { label: msg("fields.options.center", "Center"), value: "center" },
  { label: msg("fields.options.end", "End"), value: "end" },
];

const bodyVariantOptions = [
  {
    label: msg("fields.options.small", "Small", { context: "text size" }),
    value: "sm",
  },
  {
    label: msg("fields.options.base", "Base", { context: "text size" }),
    value: "base",
  },
  {
    label: msg("fields.options.large", "Large", { context: "text size" }),
    value: "lg",
  },
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

export const ThemeOptions = {
  HEADING_LEVEL: headingLevelOptions,
  TEXT_TRANSFORM: textTransformOptions,
  LETTER_SPACING: letterSpacingOptions,
  BACKGROUND_COLOR: backgroundColorOptions,
  CTA_VARIANT: ctaVariantOptions,
  ALIGNMENT: alignmentOptions,
  JUSTIFY_CONTENT: justifyContentOptions,
  BODY_VARIANT: bodyVariantOptions,
  BUTTON_BORDER_RADIUS: buttonBorderRadiusOptions,
  IMAGE_BORDER_RADIUS: imageBorderRadiusOptions,
  SPACING: getSpacingOptions,
  FONT_SIZE: getFontSizeOptions,
  HOURS_OPTIONS: hoursOptions,
  PHONE_OPTIONS: phoneOptions,
  MAX_WIDTH: maxWidthOptions,
};

// Content path for applying tailwind config to visual-editor components
export const VisualEditorComponentsContentPath =
  "node_modules/@yext/visual-editor/dist/**/*.js";
