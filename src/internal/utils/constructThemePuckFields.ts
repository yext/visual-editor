import { NumberField, ObjectField, SelectField } from "@measured/puck";
import { ParentStyle, SavedTheme, Style } from "../../utils/themeResolver.ts";
import { ColorSelector } from "../../components/ColorSelector.tsx";

export const constructThemePuckFields = (parentStyle: ParentStyle) => {
  const field: ObjectField = {
    label: parentStyle.label,
    type: "object",
    objectFields: {},
  };

  Object.entries(parentStyle.styles).forEach(([styleKey, style]) => {
    if ("type" in style) {
      const styleField = convertStyleToPuckField(style);
      if (styleField) {
        field.objectFields[styleKey] = styleField;
      }
    } else {
      field.objectFields[styleKey] = constructThemePuckFields(style);
    }
  });
  return field;
};

export const convertStyleToPuckField = (style: Style) => {
  switch (style.type) {
    case "number":
      return {
        label: style.label,
        type: "number",
      } as NumberField;
    case "select":
      return {
        label: style.label,
        type: "select",
        options: style.options,
      } as SelectField;
    case "color":
      return ColorSelector({ label: style.label });
  }
};

export const constructThemePuckValues = (
  savedThemeValues: SavedTheme | undefined,
  parentStyle: ParentStyle,
  parentKey: string = ""
) => {
  const value: Record<string, any> = {};

  Object.entries(parentStyle.styles).forEach(([styleKey, style]) => {
    if ("type" in style) {
      value[styleKey] =
        savedThemeValues?.[`--${parentKey}-${styleKey}`] ?? style.default;
    } else {
      value[styleKey] = constructThemePuckValues(
        savedThemeValues,
        style,
        `${parentKey}-${styleKey}`
      );
    }
  });
  return value;
};
