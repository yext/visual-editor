import { AutoField, FieldLabel } from "@measured/puck";
import React from "react";
import { Alert, AlertDescription } from "../../components/atoms/Alert.tsx";
import {
  ThemeConfig,
  ThemeConfigSection,
} from "../../../utils/themeResolver.ts";
import {
  constructThemePuckFields,
  constructThemePuckValues,
} from "../../utils/constructThemePuckFields.ts";
import { ThemeHistories } from "../../types/themeData.ts";

type ThemeSidebarProps = {
  themeHistoriesRef: React.MutableRefObject<ThemeHistories | undefined>;
  themeConfig?: ThemeConfig;
  onThemeChange: (
    themeSectionKey: string,
    themeSection: ThemeConfigSection,
    value: Record<string, any>
  ) => void;
};

const ThemeSidebar = (props: ThemeSidebarProps) => {
  const { themeConfig, themeHistoriesRef, onThemeChange } = props;

  if (!themeHistoriesRef.current) {
    return;
  }

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

  const themeData =
    themeHistoriesRef.current?.histories[themeHistoriesRef.current?.index].data;

  return (
    <div>
      <Alert>
        <AlertDescription>
          Changes to the theme will affect all templates and layouts for the
          entire site.
        </AlertDescription>
      </Alert>
      {Object.entries(themeConfig).map(([themeSectionKey, themeSection]) => {
        const field = constructThemePuckFields(themeSection);
        const values = constructThemePuckValues(
          themeData,
          themeSection,
          themeSectionKey
        );

        return (
          <FieldLabel
            label={field.label ?? ""}
            className="theme-field"
            key={themeSectionKey}
            el="div"
          >
            <AutoField
              field={field}
              onChange={(value) =>
                onThemeChange(themeSectionKey, themeSection, value)
              }
              value={values}
            />
          </FieldLabel>
        );
      })}
    </div>
  );
};

export default ThemeSidebar;
