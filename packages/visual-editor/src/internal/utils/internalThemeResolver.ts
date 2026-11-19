import {
  getPickerContrastHex,
  parsePickerGradient,
} from "../../utils/colorPicker.ts";
import { themeFields, type ThemeFields } from "../theme/themeFields.ts";
import { ThemeData } from "../types/themeData.ts";

export const readThemeValues = (
  data: ThemeData = {},
  fields: ThemeFields = themeFields
): ThemeData => {
  const result: ThemeData = {};
  for (const [fieldKey, field] of Object.entries(fields)) {
    const value = data[fieldKey];
    const hasSavedValue =
      field.type === "number"
        ? typeof value === "number" && Number.isFinite(value)
        : typeof value === "string" && value !== "";
    result[fieldKey] = hasSavedValue ? value : field.default;
  }
  return result;
};

export const themeValuesToCss = (
  data: ThemeData = {},
  fields: ThemeFields = themeFields
): Record<string, string> => {
  const values = readThemeValues(data, fields);
  const variables: Record<string, string> = Object.fromEntries(
    Object.entries(fields).map(([fieldKey, field]) => [
      field.variable,
      field.type === "number" ? `${values[fieldKey]}px` : values[fieldKey],
    ])
  );

  // A surface can paint a gradient, while SVG currentColor and native control
  // accents require a solid color. Match the sample used for surface contrast.
  for (const color of ["primary", "secondary", "accent", "muted"]) {
    const token = `--ve-color-${color}`;
    const value = variables[token];
    if (value !== undefined) {
      variables[`${token}-solid`] = parsePickerGradient(value)
        ? getPickerContrastHex(value)
        : value;
    }
  }

  return variables;
};
