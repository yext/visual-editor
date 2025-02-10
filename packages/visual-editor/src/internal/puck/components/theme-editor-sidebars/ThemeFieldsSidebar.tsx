import React from "react";
import { AutoField } from "@measured/puck";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  ThemeConfig,
  ThemeConfigSection,
} from "../../../../utils/themeResolver.ts";
import { OnThemeChangeFunc, ThemeData } from "../../../types/themeData.ts";
import {
  constructThemePuckFields,
  constructThemePuckValues,
} from "../../../utils/constructThemePuckFields.ts";
import { generateCssVariablesFromPuckFields } from "../../../utils/internalThemeResolver.ts";

type ThemeFieldsSidebarProps = {
  themeConfig: ThemeConfig;
  themeData: ThemeData;
  onThemeChange: OnThemeChangeFunc;
};

export const ThemeFieldsSidebar = ({
  themeConfig,
  themeData,
  onThemeChange,
}: ThemeFieldsSidebarProps) => {
  const handleThemeChange = (
    themeSectionKey: string,
    themeSection: ThemeConfigSection,
    newValue: Record<string, any>
  ) => {
    const newThemeValues = {
      ...themeData,
      ...generateCssVariablesFromPuckFields(
        newValue,
        themeSectionKey,
        themeSection
      ),
    };
    onThemeChange(newThemeValues);
  };
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

  return Object.entries(themeConfig).map(([themeSectionKey, themeSection]) => {
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
            {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </div>
        </button>
        {!isCollapsed && (
          <AutoField
            field={field}
            onChange={(value) =>
              handleThemeChange(themeSectionKey, themeSection, value)
            }
            value={values}
          />
        )}
      </div>
    );
  });
};
