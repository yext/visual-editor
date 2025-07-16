import { getContrastingColor } from "../../utils/colors.ts";
import { ThemeConfig, ThemeConfigSection } from "../../utils/themeResolver.ts";
import { ThemeData } from "../types/themeData.ts";

// internalThemeResolver returns a mapping of css variable names to their values
// using the themeConfig to create the list of variable names and applying the saved value
// if it exists for each one. If it does not exist, it falls back on the themeConfig's default field.
export const internalThemeResolver = (
  themeConfig: ThemeConfig,
  savedTheme: ThemeData | undefined
): ThemeData => {
  const themeValues = generateCssVariablesFromThemeConfig(themeConfig);

  if (!savedTheme) {
    return themeValues;
  }

  Object.entries(themeValues).forEach(([cssVariable]) => {
    if (savedTheme[cssVariable]) {
      themeValues[cssVariable] = savedTheme[cssVariable];
    }
  });
  return themeValues;
};

// generateCssVariablesFromThemeConfig flattens the themeConfig, creating an object
// mapping css variable names to the themeConfig's default values
export const generateCssVariablesFromThemeConfig = (
  themeConfig: ThemeConfig
) => {
  const defaultValues: ThemeData = {};
  for (const themeSectionKey in themeConfig) {
    const themeSection = themeConfig[themeSectionKey].styles;

    for (const styleKey in themeSection) {
      const style = themeSection[styleKey];

      if ("default" in style) {
        defaultValues[`--${style.plugin}-${themeSectionKey}-${styleKey}`] =
          typeof style.default === "number"
            ? `${style.default}px`
            : style.default;
      } else if ("styles" in style) {
        for (const subkey in style.styles) {
          defaultValues[
            `--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}`
          ] =
            typeof style.styles[subkey].default === "number"
              ? `${style.styles[subkey].default}px`
              : style.styles[subkey].default;
        }
      }
    }
  }
  return defaultValues;
};

// generateCssVariablesFromPuckFields flattens the puck sidebar fields, creating an object
// mapping css variable names to the current puck values
export const generateCssVariablesFromPuckFields = (
  fields: Record<string, any>,
  themeSectionKey: string,
  themeSection: ThemeConfigSection
) => {
  const result: ThemeData = {};

  for (const styleKey in themeSection.styles) {
    const style = themeSection.styles[styleKey];
    if ("default" in style) {
      if (style.type === "number") {
        result[`--${style.plugin}-${themeSectionKey}-${styleKey}`] =
          fields[styleKey] + "px";
      } else if (style.type === "color") {
        result[`--${style.plugin}-${themeSectionKey}-${styleKey}`] =
          fields[styleKey];
        result[`--${style.plugin}-${themeSectionKey}-${styleKey}-contrast`] =
          getContrastingColor(fields[styleKey], 12, 400);
      } else {
        result[`--${style.plugin}-${themeSectionKey}-${styleKey}`] =
          fields[styleKey];
      }
    } else {
      for (const subkey in style.styles) {
        const substyle = style.styles[subkey];
        if (substyle.type === "number") {
          result[`--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}`] =
            fields[styleKey][subkey] + "px";
        } else if (substyle.type === "color") {
          result[`--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}`] =
            fields[styleKey][subkey];
          result[
            `--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}-contrast`
          ] = getContrastingColor(fields[styleKey][subkey], 12, 400);
        } else {
          result[`--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}`] =
            fields[styleKey][subkey];
        }
      }
    }
  }

  return result;
};
