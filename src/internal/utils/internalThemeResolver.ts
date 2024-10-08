import {
  ParentStyle,
  ThemeConfig,
  SavedTheme,
} from "../../utils/themeResolver.ts";

// internalThemeResolver returns a mapping of css variable names to their values
// using the themeConfig to create the list of variable names and applying the saved value
// if it exists for each one. If it does not exist, it falls back on the themeConfig's default field.
export const internalThemeResolver = (
  themeConfig: ThemeConfig,
  savedTheme: SavedTheme | undefined
): SavedTheme => {
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

const extractCssVariablesFromThemeConfig = (
  parentStyle: ParentStyle,
  parentKey: string,
  result: SavedTheme
) => {
  Object.entries(parentStyle.styles).forEach(([styleKey, style]) => {
    if ("default" in style) {
      result[`--${parentKey}-${styleKey}`] = style.default;
    } else {
      extractCssVariablesFromThemeConfig(
        style,
        `${parentKey}-${styleKey}`,
        result
      );
    }
  });
  return result;
};

// generateCssVariablesFromThemeConfig flattens the themeConfig, creating an object
// mapping css variable names to the themeConfig's default values
export const generateCssVariablesFromThemeConfig = (
  themeConfig: ThemeConfig
) => {
  const result: SavedTheme = {};
  for (const category in themeConfig) {
    extractCssVariablesFromThemeConfig(themeConfig[category], category, result);
  }
  return result;
};

type PuckThemeFields = {
  [key: string]: string | PuckThemeFields;
};

// generateCssVariablesFromPuckFields flattens the puck sidebar fields, creating an object
// mapping css variable names to the current puck values
export const generateCssVariablesFromPuckFields = (
  fields: PuckThemeFields,
  parentKey = "",
  result: SavedTheme = {}
) => {
  for (const fieldKey in fields) {
    const fieldValue = fields[fieldKey];
    if (typeof fieldValue === "object") {
      generateCssVariablesFromPuckFields(
        fieldValue,
        `${parentKey}-${fieldKey}`,
        result
      );
    } else {
      result[`--${parentKey}-${fieldKey}`] = fieldValue;
    }
  }
  return result;
};
