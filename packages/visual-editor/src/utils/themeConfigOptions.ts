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

// Defines the valid levels for the heading element
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// Provides a mapping of label to value for BasicSelector
export const headingLevelOptions = [
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
