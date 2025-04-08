import {
  ObjectField,
  SelectField,
  NumberField,
  CustomField,
} from "@measured/puck";
import { CoreStyle, ThemeConfigSection } from "../../utils/themeResolver.ts";
import { ColorSelector } from "../puck/components/ColorSelector.tsx";
import { ThemeData } from "../types/themeData.ts";
import { FontSelector } from "../puck/components/FontSelector.tsx";
import { useCallback } from "react";

type RenderProps = Parameters<CustomField<any>["render"]>[0];

// Converts a ThemeConfigSection into a Puck fields object
export const constructThemePuckFields = (themeSection: ThemeConfigSection) => {
  const field: ObjectField = {
    label: themeSection.label,
    type: "object",
    objectFields: {},
  };

  Object.entries(themeSection.styles).forEach(([styleKey, style]) => {
    if ("type" in style) {
      const styleField = convertStyleToPuckField(style, style.plugin);
      if (styleField) {
        field.objectFields[styleKey] = styleField;
      }
    } else {
      const styleGroupFields: ObjectField = {
        label: style.label,
        type: "object",
        objectFields: {},
      };
      for (const subkey in style.styles) {
        styleGroupFields.objectFields[subkey] = convertStyleToPuckField(
          style.styles[subkey],
          style.plugin
        );
      }
      field.objectFields[styleKey] = styleGroupFields;
    }
  });
  return field;
};

// Determines which Puck field type to use for a style
export const convertStyleToPuckField = (style: CoreStyle, plugin: string) => {
  switch (style.type) {
    case "number":
      return {
        label: style.label,
        type: "number",
      } as NumberField;
    case "select":
      if (plugin === "fontFamily") {
        return {
          label: style.label,
          type: "custom",
          options: style.options,
          render: useCallback(
            ({ onChange, value }: RenderProps) =>
              FontSelector({
                label: style.label,
                options:
                  typeof style.options === "function"
                    ? style.options()
                    : style.options,
                value,
                onChange,
              }),
            []
          ),
        } as CustomField;
      } else {
        return {
          label: style.label,
          type: "select",
          options:
            typeof style.options === "function"
              ? style.options()
              : style.options,
        } as SelectField;
      }
    case "color":
      return {
        label: style.label,
        type: "custom",
        render: ColorSelector,
      } as CustomField;
  }
};

// Converts a ThemeConfigSection into a Puck values object
export const constructThemePuckValues = (
  savedThemeValues: ThemeData | undefined,
  themeSection: ThemeConfigSection,
  sectionKey: string = ""
) => {
  const value: Record<string, any> = {};

  Object.entries(themeSection.styles).forEach(([styleKey, style]) => {
    if ("type" in style) {
      const storedValue =
        savedThemeValues?.[`--${style.plugin}-${sectionKey}-${styleKey}`];
      value[styleKey] = assignValue(style, storedValue);
    } else {
      const styleGroupValues: Record<string, any> = {};
      for (const subkey in style.styles) {
        const substyle = style.styles[subkey];
        const storedValue =
          savedThemeValues?.[
            `--${style.plugin}-${sectionKey}-${styleKey}-${subkey}`
          ];
        styleGroupValues[subkey] = assignValue(substyle, storedValue);
      }
      value[styleKey] = styleGroupValues;
    }
  });
  return value;
};

// Determines whether to use the default or stored value
// Also removes "px" from stored number values to send to puck
export const assignValue = (
  style: CoreStyle,
  storedValue: string | undefined
) => {
  if (storedValue) {
    if (style.type === "number") {
      const convertedNumber = Number.parseInt(storedValue);
      return isNaN(convertedNumber) ? style.default : convertedNumber;
    } else {
      return storedValue;
    }
  } else {
    return style.default;
  }
};
