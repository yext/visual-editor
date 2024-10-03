import {
  NumberField,
  ObjectField,
  SelectField,
  TextField,
} from "@measured/puck";
import { ParentStyle, Style } from "../../utils/themeResolver.ts";

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
      // TODO: add color picker
      return {
        label: style.label,
        type: "text",
      } as TextField;
  }
};

export const constructThemePuckValues = (
  savedThemeValues: any,
  parentStyle: ParentStyle
) => {
  const value: Record<string, any> = {};

  Object.entries(parentStyle.styles).forEach(([styleKey, style]) => {
    if ("type" in style) {
      value[styleKey] = savedThemeValues?.[styleKey] ?? style.default;
    } else {
      value[styleKey] = constructThemePuckValues(
        savedThemeValues?.[styleKey],
        style
      );
    }
  });
  return value;
};
