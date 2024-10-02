import { AutoFieldPrivate, Config, Field } from "@measured/puck";
import React from "react";

type ThemeSidebarProps = {
  puckConfig: Config;
  saveTheme: (theme: ThemeConfig) => void;
};

// Temporary types until we have a defined config
type StyleValue = string | number;
type StyleFieldValues = { [styleKey: string]: StyleValue };
type Style = {
  label: string;
  type: "number" | "string";
  value: StyleValue;
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
        label: "Text Color",
        type: "string",
        value: "#0000ff",
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
        type: "string",
        value: "#ff0000",
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
            case "string":
              field.objectFields[styleKey] = {
                label: style.label,
                type: "text",
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
