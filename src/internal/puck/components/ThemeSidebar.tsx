import { AutoFieldPrivate } from "@measured/puck";
import React from "react";
import { Alert, AlertDescription } from "../../components/atoms/Alert.tsx";
import { ThemeConfig } from "../../../utils/themeResolver.ts";
import {
  constructThemePuckFields,
  constructThemePuckValues,
} from "../../utils/constructThemePuckFields.ts";

type ThemeSidebarProps = {
  themeConfig?: ThemeConfig;
  themeValues: Record<string, any>;
  onThemeChange: (parentStyleKey: string, value: Record<string, any>) => void;
};

const ThemeSidebar = (props: ThemeSidebarProps) => {
  const { themeConfig, themeValues, onThemeChange } = props;
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
          themeValues,
          parentStyle,
          parentStyleKey
        );

        return (
          <AutoFieldPrivate
            key={parentStyleKey}
            field={field}
            onChange={(value) => onThemeChange(parentStyleKey, value)}
            value={values}
          />
        );
      })}
    </div>
  );
};

export default ThemeSidebar;
