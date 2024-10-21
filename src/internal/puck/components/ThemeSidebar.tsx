import { AutoField, FieldLabel } from "@measured/puck";
import React from "react";
import { Alert, AlertDescription } from "../../components/atoms/Alert.tsx";
import { ThemeConfig } from "../../../utils/themeResolver.ts";
import {
  constructThemePuckFields,
  constructThemePuckValues,
} from "../../utils/constructThemePuckFields.ts";
import { ThemeHistory } from "../../types/themeData.ts";

type ThemeSidebarProps = {
  themeConfig?: ThemeConfig;
  themeHistory: ThemeHistory[];
  onThemeChange: (parentStyleKey: string, value: Record<string, any>) => void;
};

const ThemeSidebar = (props: ThemeSidebarProps) => {
  const { themeConfig, themeHistory, onThemeChange } = props;
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
          themeHistory[themeHistory.length - 1]?.data,
          parentStyle,
          parentStyleKey
        );

        return (
          <FieldLabel
            label={field.label ?? ""}
            className="theme-field"
            key={parentStyleKey}
          >
            <AutoField
              field={field}
              onChange={(value) => onThemeChange(parentStyleKey, value)}
              value={values}
            />
          </FieldLabel>
        );
      })}
    </div>
  );
};

export default ThemeSidebar;
