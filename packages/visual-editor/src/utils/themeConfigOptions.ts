import { borderRadiusOptions } from "../components/editor/BorderRadiusSelector.tsx";
import { fontSizeOptions } from "../components/editor/FontSizeSelector.tsx";
import { spacingOptions } from "../components/editor/SpacingSelector.tsx";

const getFontSizeOptions = (includeLargeSizes = true) => {
  return fontSizeOptions(includeLargeSizes).map((option) => {
    return {
      label: option.label + ` (${option.px}px)`,
      value: `${option.px}px`,
    };
  });
};

const getBorderRadiusOptions = () => {
  return borderRadiusOptions.map((option) => {
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

export type BackgroundStyle = {
  bgColor: string;
  textColor: string;
};

type BackgroundOption = {
  label: string;
  value: BackgroundStyle;
};

export const backgroundColors: Record<string, BackgroundOption> = {
  background1: {
    label: "Background 1",
    value: { bgColor: "bg-white", textColor: "text-black" },
  },
  background2: {
    label: "Background 2",
    value: {
      bgColor: "bg-palette-primary-light",
      textColor: "text-black",
    },
  },
  background3: {
    label: "Background 3",
    value: {
      bgColor: "bg-palette-secondary-light",
      textColor: "text-black",
    },
  },
  background4: {
    label: "Background 4",
    value: {
      bgColor: "bg-palette-tertiary-light",
      textColor: "text-black",
    },
  },
  background5: {
    label: "Background 5",
    value: {
      bgColor: "bg-palette-quaternary-light",
      textColor: "text-black",
    },
  },
  background6: {
    label: "Background 6",
    value: {
      bgColor: "bg-palette-primary-dark",
      textColor: "text-white",
    },
  },
  background7: {
    label: "Background 7",
    value: {
      bgColor: "bg-palette-secondary-dark",
      textColor: "text-white",
    },
  },
};

// When used in BasicSelector, the color is displayed in the dropdown.
const backgroundColorOptions = Object.values(backgroundColors).map(
  ({ label, value }) => ({
    label,
    value,
    color: value.bgColor,
  })
);

const darkBackgroundColorOptions = Object.values({
  background6: backgroundColors.background6,
  background7: backgroundColors.background7,
}).map(({ label, value }) => ({
  label,
  value,
  color: value.bgColor,
}));

// Defines the valid levels for the heading element
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
    "body-sm-fontSize": "calc(var(--fontSize-body-fontSize) - 2px)",
    "body-lg-fontSize": "calc(var(--fontSize-body-fontSize) + 2px)",
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
  { label: "Normal", value: "none" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
];

const ctaVariantOptions = [
  { label: "Primary", value: "primary" },
  { label: "Secondary", value: "secondary" },
  { label: "Link", value: "link" },
];

const alignmentOptions = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

const justifyContentOptions = [
  { label: "Start", value: "start" },
  { label: "Center", value: "center" },
  { label: "End", value: "end" },
];

const bodyVariantOptions = [
  { label: "Small", value: "sm" },
  { label: "Base", value: "base" },
  { label: "Large", value: "lg" },
];

const hoursOptions = [
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
  { label: "Sunday", value: "sunday" },
  { label: "Today", value: "today" },
];

const phoneOptions = [
  { label: "Domestic", value: "domestic" },
  { label: "International", value: "international" },
];

export const ThemeOptions = {
  HEADING_LEVEL: headingLevelOptions,
  TEXT_TRANSFORM: textTransformOptions,
  LETTER_SPACING: letterSpacingOptions,
  BACKGROUND_COLOR: backgroundColorOptions,
  DARK_BACKGROUND_COLOR: darkBackgroundColorOptions,
  CTA_VARIANT: ctaVariantOptions,
  ALIGNMENT: alignmentOptions,
  JUSTIFY_CONTENT: justifyContentOptions,
  BODY_VARIANT: bodyVariantOptions,
  BORDER_RADIUS: getBorderRadiusOptions,
  SPACING: getSpacingOptions,
  FONT_SIZE: getFontSizeOptions,
  HOURS_OPTIONS: hoursOptions,
  PHONE_OPTIONS: phoneOptions,
};
