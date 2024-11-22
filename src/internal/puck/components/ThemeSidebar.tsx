import { AutoField } from "@measured/puck";
import React from "react";
import { Alert, AlertDescription } from "../ui/atoms/Alert.tsx";
import {
  ThemeConfig,
  ThemeConfigSection,
} from "../../../utils/themeResolver.ts";
import {
  constructThemePuckFields,
  constructThemePuckValues,
} from "../../utils/constructThemePuckFields.ts";
import { ThemeHistories } from "../../types/themeData.ts";
import { ChevronDown, ChevronUp } from "lucide-react";
import "@measured/puck/dist/index.css";

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

  const [collapsedSections, setCollapsedSections] = React.useState<{
    [x: string]: boolean;
  }>(
    Object.keys(themeConfig).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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

        const isCollapsed = collapsedSections[themeSectionKey];

        return (
          <div key={themeSectionKey} className="theme-field">
            <button
              className="ve-flex ve-items-center ve-w-full ve-justify-between"
              onClick={() => toggleSection(themeSectionKey)}
            >
              {`${field.label ?? ""}`}
              <div>
                {isCollapsed ? (
                  <ChevronDown size={12} />
                ) : (
                  <ChevronUp size={12} />
                )}
              </div>
            </button>
            {!isCollapsed && (
              <AutoField
                field={field}
                onChange={(value) =>
                  onThemeChange(themeSectionKey, themeSection, value)
                }
                value={values}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ThemeSidebar;
