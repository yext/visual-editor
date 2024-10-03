import { AutoFieldPrivate } from "@measured/puck";
import React from "react";
import { ThemeConfig } from "../../../utils/themeResolver.ts";
import {
  constructThemePuckFields,
  constructThemePuckValues,
} from "../../utils/constructThemePuckFields.ts";

type ThemeSidebarProps = {
  savedThemeValues: any;
  themeConfig?: ThemeConfig;
  saveTheme: (theme: ThemeConfig) => void;
};

const ThemeSidebar = (props: ThemeSidebarProps) => {
  const { saveTheme, themeConfig, savedThemeValues } = props;
  if (!themeConfig) {
    return <></>;
  }

  const handleChange = (themeCategoryKey: string, newValue: any) => {
    const updatedConfig: ThemeConfig = {
      ...themeConfig,
      [themeCategoryKey]: {
        ...themeConfig[themeCategoryKey],
        styles: newValue,
      },
    };
    saveTheme(updatedConfig);
  };

  return (
    <div>
      {Object.entries(themeConfig).map(([parentStyleKey, parentStyle]) => {
        const field = constructThemePuckFields(parentStyle);
        const values = constructThemePuckValues(savedThemeValues, parentStyle);

        return (
          <AutoFieldPrivate
            key={parentStyleKey}
            field={field}
            onChange={(value) => handleChange(parentStyleKey, value)}
            value={values}
          />
        );
      })}
    </div>
  );
};

export default ThemeSidebar;
