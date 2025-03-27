import { borderRadiusOptions } from "../components/editor/BorderRadiusSelector.tsx";
import { fontSizeOptions } from "../components/editor/FontSizeSelector.tsx";
import { spacingOptions } from "../components/editor/SpacingSelector.tsx";

export const getFontSizeOptions = (includeLargeSizes = true) => {
  return fontSizeOptions(includeLargeSizes).map((option) => {
    return {
      label: option.label + ` (${option.px}px)`,
      value: `${option.px}px`,
    };
  });
};

export const getBorderRadiusOptions = () => {
  return borderRadiusOptions.map((option) => {
    return {
      label: option.label + ` (${option.px}px)`,
      value: `${option.px}px`,
    };
  });
};

export const getSpacingOptions = () => {
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
};

export const letterSpacingOptions = [
  { label: "Tighter", value: "-0.05em" },
  { label: "Tight", value: "-0.025em" },
  { label: "Normal", value: "0em" },
  { label: "Wide", value: "0.025em" },
  { label: "Wider", value: "0.05em" },
  { label: "Widest", value: "0.1em" },
];

export const textTransformOptions = [
  { label: "Normal", value: "none" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
];
