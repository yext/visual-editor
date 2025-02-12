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
