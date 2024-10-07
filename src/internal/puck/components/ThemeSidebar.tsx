import { AutoFieldPrivate } from "@measured/puck";
import React from "react";
import { Alert, AlertDescription } from "../../components/atoms/Alert.tsx";
import { ThemeConfig, SavedTheme } from "../../../utils/themeResolver.ts";
import {
  constructThemePuckFields,
  constructThemePuckValues,
} from "../../utils/constructThemePuckFields.ts";
import { updateThemeInEditor } from "../../../utils/applyTheme.ts";
import { generateCssVariablesFromPuckFields } from "../../utils/internalThemeResolver.ts";

type ThemeSidebarProps = {
  savedThemeValues: SavedTheme | undefined;
  themeConfig?: ThemeConfig;
  saveTheme: (savedThemeValues: SavedTheme) => void;
};

const ThemeSidebar = (props: ThemeSidebarProps) => {
  const { saveTheme, themeConfig, savedThemeValues } = props;
  if (!themeConfig) {
    return (
      <div>
        <Alert>
          <AlertDescription>
            Please contact your developer to set up theme management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleChange = (topLevelKey: string, newValue: any) => {
    const newThemeValues = {
      ...savedThemeValues,
      ...generateCssVariablesFromPuckFields(newValue, topLevelKey),
    };
    updateThemeInEditor(newThemeValues, themeConfig);
    saveTheme(newThemeValues);
  };

  return (
    <div>
      <Alert>
        <AlertDescription>
          Changes to the theme will affect all templates and layouts for the
          entire site.
        </AlertDescription>
      </Alert>
      {Object.entries(themeConfig).map(([parentStyleKey, parentStyle]) => {
        const field = constructThemePuckFields(parentStyle);
        const values = constructThemePuckValues(
          savedThemeValues,
          parentStyle,
          parentStyleKey
        );

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
