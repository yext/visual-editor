import { AutoFieldPrivate, Config, Field } from "@measured/puck";
import React from "react";

type ThemeSidebarProps = {
  puckConfig: Config;
  saveTheme: (theme: ThemeConfig) => void;
};

// Temporary types until we have a defined config
type StyleSelectOptions = {
  label: string;
  value: string;
};
type StyleValue = string | number;
type StyleFieldValues = { [styleKey: string]: StyleValue };
type Style =
  | {
      label: string;
      type: "number";
      value: number;
    }
  | {
      label: string;
      type: "select";
      value: string;
      options: StyleSelectOptions[];
    };
export type ThemeCategory = {
  label: string;
  styles: {
    [styleKey: string]: Style;
  };
};
export type ThemeConfig = {
  [themeCategoryKey: string]: ThemeCategory;
};

const exampleThemeConfig: ThemeConfig = {
  text: {
    label: "Text",
    styles: {
      color: {
        label: "Font Weight",
        type: "select",
        value: "",
        options: [
          { label: "Light", value: "300" },
          { label: "Normal", value: "400" },
          { label: "Bold", value: "700" },
          { label: "Extra Bold", value: "800" },
        ],
      },
      size: {
        label: "Font Size",
        type: "number",
        value: 12,
      },
    },
  },
  heading: {
    label: "Headings",
    styles: {
      color: {
        label: "Heading Color",
        type: "number",
        value: 0,
      },
    },
  },
};

const ThemeSidebar = (props: ThemeSidebarProps) => {
  const { saveTheme } = props;
  const themeConfig = exampleThemeConfig;

  const handleChange = (
    themeCategoryKey: string,
    newValue: any
    // value: any
  ) => {
    const updatedConfig: ThemeConfig = {
      ...themeConfig,
      [themeCategoryKey]: {
        ...themeConfig[themeCategoryKey],
        styles: newValue,
      },
    };
    console.log("Updating", themeCategoryKey, "to ", newValue);
    console.log("New config", updatedConfig);

    saveTheme(updatedConfig);
  };

  return (
    <div>
      {Object.entries(themeConfig).map(([themeCategoryKey, themeCategory]) => {
        const field: Field = {
          label: themeCategory.label,
          type: "object",
          objectFields: {},
        };

        Object.entries(themeCategory.styles).forEach(([styleKey, style]) => {
          switch (style.type) {
            case "number":
              field.objectFields[styleKey] = {
                label: style.label,
                type: "number",
              };
              break;
            case "select":
              field.objectFields[styleKey] = {
                label: style.label,
                type: "select",
                options: style.options,
              };
              break;
          }
        });

        const values: StyleFieldValues = {};
        Object.entries(themeCategory.styles).forEach(([styleKey, style]) => {
          values[styleKey] = style.value;
        });

        return (
          <AutoFieldPrivate
            key={themeCategoryKey}
            field={field}
            onChange={(value) => handleChange(themeCategoryKey, value)}
            value={values}
          />
        );
      })}
    </div>
  );
};

export default ThemeSidebar;
