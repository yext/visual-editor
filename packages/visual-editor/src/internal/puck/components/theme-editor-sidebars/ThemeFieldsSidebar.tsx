import React from "react";
import { AutoField } from "@puckeditor/core";
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
import { pt } from "../../../../utils/i18n/platform.ts";

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
  const headerSectionKeys = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const hasHeadersSection = "headers" in themeConfig;
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

  const renderThemeSection = (
    themeSectionKey: string,
    themeSection: ThemeConfigSection,
    extraClassName: string = ""
  ) => {
    const field = constructThemePuckFields(themeSection, pt);
    const values = constructThemePuckValues(
      themeData,
      themeSection,
      themeSectionKey
    );

    const isCollapsed = collapsedSections[themeSectionKey];

    return (
      <div
        key={themeSectionKey}
        className={`theme-field${extraClassName ? ` ${extraClassName}` : ""}`}
      >
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
  };

  const sectionsToSkip = new Set<string>();
  if (hasHeadersSection) {
    headerSectionKeys.forEach((key) => sectionsToSkip.add(key));
  }

  const headerSection = themeConfig.headers;
  const renderedSections: JSX.Element[] = [];

  if (hasHeadersSection && headerSection) {
    const isHeadersCollapsed = collapsedSections.headers;
    const headerField = constructThemePuckFields(headerSection, pt);
    const headerValues = constructThemePuckValues(
      themeData,
      headerSection,
      "headers"
    );

    renderedSections.push(
      <div key="headers" className="theme-field">
        <button
          className="ve-flex ve-items-center ve-w-full ve-justify-between"
          onClick={() => toggleSection("headers")}
        >
          {`${headerField.label ?? ""}`}
          <div>
            {isHeadersCollapsed ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronUp size={12} />
            )}
          </div>
        </button>
        {!isHeadersCollapsed && (
          <div className="ve-mt-2">
            <AutoField
              field={headerField}
              onChange={(value) =>
                handleThemeChange("headers", headerSection, value)
              }
              value={headerValues}
            />
            <div className="ve-mt-3">
              {headerSectionKeys
                .filter((key) => key in themeConfig)
                .map((key) =>
                  renderThemeSection(key, themeConfig[key], "ve-mt-2")
                )}
            </div>
          </div>
        )}
      </div>
    );
  }

  Object.entries(themeConfig).forEach(([themeSectionKey, themeSection]) => {
    if (themeSectionKey === "headers" || sectionsToSkip.has(themeSectionKey)) {
      return;
    }
    renderedSections.push(renderThemeSection(themeSectionKey, themeSection));
  });

  return renderedSections;
};
