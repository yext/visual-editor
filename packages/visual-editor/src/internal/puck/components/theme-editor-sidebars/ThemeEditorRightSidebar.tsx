import React from "react";
import { Alert, AlertDescription } from "../../ui/atoms/Alert.tsx";
import { ThemeConfig } from "../../../../utils/themeResolver.ts";
import { OnThemeChangeFunc, ThemeHistories } from "../../../types/themeData.ts";
import "@puckeditor/core/dist/index.css";
import { ThemeFieldsSidebar } from "./ThemeFieldsSidebar.tsx";
import { pt } from "../../../../utils/i18n/platform.ts";
import { FontRegistry } from "../../../../utils/fonts/visualEditorFonts.ts";

type ThemeEditorRightSidebarProps = {
  themeHistoriesRef: React.MutableRefObject<ThemeHistories | undefined>;
  themeConfig?: ThemeConfig;
  onThemeChange: OnThemeChangeFunc;
  customFonts?: FontRegistry;
};

export const ThemeEditorRightSidebar = (
  props: ThemeEditorRightSidebarProps
) => {
  const { themeConfig, themeHistoriesRef, onThemeChange, customFonts } = props;

  if (!themeHistoriesRef.current) {
    return;
  }

  if (!themeConfig) {
    return (
      <div>
        <Alert>
          <AlertDescription>
            {pt(
              "themeSidebar.noTheme",
              "Please contact your developer to set up theme management."
            )}
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
          {pt(
            "themeSidebar.warning",
            "Changes will affect all page sets and layouts for the entire site."
          )}
        </AlertDescription>
      </Alert>

      <ThemeFieldsSidebar
        themeConfig={themeConfig}
        themeData={themeData}
        onThemeChange={onThemeChange}
        customFonts={customFonts}
      />
    </div>
  );
};
