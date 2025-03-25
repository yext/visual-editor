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
