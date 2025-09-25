import { getContrastingColor } from "../../utils/colors.ts";
import { ThemeConfig, ThemeConfigSection } from "../../utils/themeResolver.ts";
import { ThemeData } from "../types/themeData.ts";

// Helper function to format font-family values for CSS
const formatFontFamilyValue = (value: string): string => {
  // If the value already contains quotes and fallback, return as-is
  if (value.includes("'") && value.includes(",")) {
    return value;
  }

  // If it's just a font name without quotes, add quotes and fallback
  if (!value.includes("'") && !value.includes('"')) {
    return `'${value}', sans-serif`;
  }

  return value;
};

// internalThemeResolver returns a mapping of css variable names to their values
// using the themeConfig to create the list of variable names and applying the saved value
// if it exists for each one. If it does not exist, it falls back on the themeConfig's default field.
export const internalThemeResolver = (
  themeConfig: ThemeConfig,
  savedTheme: ThemeData | undefined
): ThemeData => {
  console.log(
    "🟡 internalThemeResolver called with savedTheme:",
    savedTheme ? Object.keys(savedTheme).length + " keys" : "undefined"
  );

  const themeValues = generateCssVariablesFromThemeConfig(themeConfig);
  console.log(
    "🟡 Generated default theme values:",
    Object.keys(themeValues).length,
    "keys"
  );

  if (!savedTheme) {
    console.log("🟡 No saved theme, returning default values");
    return themeValues;
  }

  // Apply all saved theme values, not just the ones that exist in the default theme
  // This ensures that all overrides are applied, including ones that might not be in the default theme
  const merged = { ...themeValues, ...savedTheme };

  // Process font-family values to ensure they're properly formatted for CSS
  for (const key in merged) {
    if (key.includes("fontFamily") && typeof merged[key] === "string") {
      merged[key] = formatFontFamilyValue(merged[key]);
    }
  }

  console.log("🟡 Merged theme values:", Object.keys(merged).length, "keys");
  console.log(
    "🟡 Font family keys in merged:",
    Object.keys(merged).filter((key) => key.includes("fontFamily"))
  );

  return merged;
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
        const value =
          typeof style.default === "number"
            ? `${style.default}px`
            : style.default;

        // Format font-family values properly for CSS
        if (style.plugin === "fontFamily" && typeof value === "string") {
          defaultValues[`--${style.plugin}-${themeSectionKey}-${styleKey}`] =
            formatFontFamilyValue(value);
        } else {
          defaultValues[`--${style.plugin}-${themeSectionKey}-${styleKey}`] =
            value;
        }
      } else if ("styles" in style) {
        for (const subkey in style.styles) {
          const value =
            typeof style.styles[subkey].default === "number"
              ? `${style.styles[subkey].default}px`
              : style.styles[subkey].default;

          // Format font-family values properly for CSS
          if (style.plugin === "fontFamily" && typeof value === "string") {
            defaultValues[
              `--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}`
            ] = formatFontFamilyValue(value);
          } else {
            defaultValues[
              `--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}`
            ] = value;
          }
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
        // Format font-family values properly for CSS
        if (
          style.plugin === "fontFamily" &&
          typeof fields[styleKey] === "string"
        ) {
          result[`--${style.plugin}-${themeSectionKey}-${styleKey}`] =
            formatFontFamilyValue(fields[styleKey]);
        } else {
          result[`--${style.plugin}-${themeSectionKey}-${styleKey}`] =
            fields[styleKey];
        }
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
          // Format font-family values properly for CSS
          if (
            style.plugin === "fontFamily" &&
            typeof fields[styleKey][subkey] === "string"
          ) {
            result[
              `--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}`
            ] = formatFontFamilyValue(fields[styleKey][subkey]);
          } else {
            result[
              `--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}`
            ] = fields[styleKey][subkey];
          }
        }
      }
    }
  }

  return result;
};
