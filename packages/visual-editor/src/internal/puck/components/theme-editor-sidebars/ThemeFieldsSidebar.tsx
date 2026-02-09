import React, { useEffect, useState } from "react";
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
import {
  buildCustomFontPreloads,
  CUSTOM_FONT_PRELOADS_KEY,
  loadCustomFontCssIndex,
  removeCustomFontPreloads,
  type CustomFontCssIndex,
} from "../../../utils/customFontPreloads.ts";
import { FontRegistry } from "../../../../utils/fonts/visualEditorFonts.ts";

type ThemeFieldsSidebarProps = {
  themeConfig: ThemeConfig;
  themeData: ThemeData;
  onThemeChange: OnThemeChangeFunc;
  customFonts?: FontRegistry;
};

export const ThemeFieldsSidebar = ({
  themeConfig,
  themeData,
  onThemeChange,
  customFonts,
}: ThemeFieldsSidebarProps) => {
  const headerSectionKeys = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const hasHeadersSection = "headers" in themeConfig;

  const [customFontCssIndex, setCustomFontCssIndex] =
    useState<CustomFontCssIndex | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadIndex = async () => {
      // Build a cached index of @font-face rules for custom fonts to map weights -> files.
      if (!customFonts || Object.keys(customFonts).length === 0) {
        if (isActive) {
          setCustomFontCssIndex(null);
        }
        return;
      }

      const index = await loadCustomFontCssIndex(customFonts);
      if (isActive) {
        setCustomFontCssIndex(index);
      }
    };

    loadIndex();

    return () => {
      isActive = false;
    };
  }, [customFonts]);

  const handleThemeChange = (
    themeSectionKey: string,
    themeSection: ThemeConfigSection,
    newValue: Record<string, any>
  ) => {
    let newThemeValues: ThemeData = {
      ...themeData,
      ...generateCssVariablesFromPuckFields(
        newValue,
        themeSectionKey,
        themeSection
      ),
    };

    if (customFonts && customFontCssIndex) {
      const preloads = buildCustomFontPreloads({
        themeConfig,
        themeValues: newThemeValues,
        customFonts,
        customFontCssIndex,
      });
      if (preloads.length > 0) {
        newThemeValues = {
          ...newThemeValues,
          [CUSTOM_FONT_PRELOADS_KEY]: preloads,
        };
      } else {
        newThemeValues = removeCustomFontPreloads(newThemeValues);
      }
    } else if (!customFonts && CUSTOM_FONT_PRELOADS_KEY in newThemeValues) {
      newThemeValues = removeCustomFontPreloads(newThemeValues);
    }

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

  // Avoid rendering H1-H6 twice when we also show them nested under Headers.
  // If the themeConfig has a "headers" section (which it usually will),
  // we will render H1-H6 as part of that section and skip them in the main loop below.
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
