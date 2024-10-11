import { AutoFieldPrivate } from "@measured/puck";
import React from "react";
import { Alert, AlertDescription } from "../../components/atoms/Alert.tsx";
import { ThemeConfig } from "../../../utils/themeResolver.ts";
import {
  constructThemePuckFields,
  constructThemePuckValues,
} from "../../utils/constructThemePuckFields.ts";
import { updateThemeInEditor } from "../../../utils/applyTheme.ts";
import { generateCssVariablesFromPuckFields } from "../../utils/internalThemeResolver.ts";
import { ThemeSaveState } from "../../types/themeSaveState.ts";
import { Payload } from "../../hooks/useMessage.ts";

type ThemeSidebarProps = {
  themeConfig?: ThemeConfig;
  saveTheme: (themeSaveState: Payload) => void;
  themeHistory: ThemeSaveState;
  setThemeHistory: (themeHistory: ThemeSaveState) => void;
};

const ThemeSidebar = (props: ThemeSidebarProps) => {
  const { saveTheme, themeConfig, themeHistory, setThemeHistory } = props;
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
      ...themeHistory.history[themeHistory.index],
      ...generateCssVariablesFromPuckFields(newValue, topLevelKey),
    };
    updateThemeInEditor(newThemeValues, themeConfig);
    const newHistory = {
      history: [...themeHistory.history, newThemeValues],
      index: themeHistory.index + 1,
    };
    saveTheme({
      payload: {
        history: JSON.stringify(newHistory.history),
        index: newHistory.index,
      },
    });
    setThemeHistory(newHistory);
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
          themeHistory.history[themeHistory.index],
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
