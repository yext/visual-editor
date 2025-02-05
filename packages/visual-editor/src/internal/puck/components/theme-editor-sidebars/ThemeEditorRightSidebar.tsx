import React from "react";
import { Alert, AlertDescription } from "../../ui/atoms/Alert.tsx";
import { ThemeConfig } from "../../../../utils/themeResolver.ts";
import { OnThemeChangeFunc, ThemeHistories } from "../../../types/themeData.ts";
import "@measured/puck/dist/index.css";
import { ThemeFieldsSidebar } from "./ThemeFieldsSidebar.tsx";
import { AnalyticsFieldsSidebar } from "./AnalyticsFieldsSidebar.tsx";
import { ThemeEditorModes } from "./ThemeEditorLeftSidebar.tsx";

type ThemeEditorRightSidebarProps = {
  themeHistoriesRef: React.MutableRefObject<ThemeHistories | undefined>;
  themeConfig?: ThemeConfig;
  onThemeChange: OnThemeChangeFunc;
  modeRef: React.MutableRefObject<ThemeEditorModes>;
};

export const ThemeEditorRightSidebar = (
  props: ThemeEditorRightSidebarProps
) => {
  const { themeConfig, themeHistoriesRef, onThemeChange, modeRef } = props;

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
          Changes will affect all page sets and layouts for the entire site.
        </AlertDescription>
      </Alert>

      {modeRef.current === "theme" && (
        <ThemeFieldsSidebar
          themeConfig={themeConfig}
          themeData={themeData}
          onThemeChange={onThemeChange}
        />
      )}

      {modeRef.current === "analytics" && (
        <AnalyticsFieldsSidebar
          themeData={themeData}
          onThemeChange={onThemeChange}
        />
      )}
    </div>
  );
};
