import React from "react";
import { Alert, AlertDescription } from "../../ui/atoms/Alert.tsx";
import { OnThemeChangeFunc, ThemeHistories } from "../../../types/themeData.ts";
import "@puckeditor/core/dist/index.css";
import { ThemeFieldsSidebar } from "./ThemeFieldsSidebar.tsx";
import { pt } from "../../../../utils/i18n/platform.ts";
import { FontRegistry } from "../../../../utils/fonts/visualEditorFonts.ts";

type ThemeEditorRightSidebarProps = {
  themeHistoriesRef: React.MutableRefObject<ThemeHistories | undefined>;
  onThemeChange: OnThemeChangeFunc;
  customFonts?: FontRegistry;
};

export const ThemeEditorRightSidebar = (
  props: ThemeEditorRightSidebarProps
) => {
  const { themeHistoriesRef, onThemeChange, customFonts } = props;

  if (!themeHistoriesRef.current) {
    return;
  }

  const themeData =
    themeHistoriesRef.current?.histories[themeHistoriesRef.current?.index].data;

  return (
    <div className="theme-editor-sidebar">
      <Alert>
        <AlertDescription>
          {pt(
            "themeSidebar.warning",
            "Changes will affect all page sets and layouts for the entire site."
          )}
        </AlertDescription>
      </Alert>

      <ThemeFieldsSidebar
        themeData={themeData}
        onThemeChange={onThemeChange}
        customFonts={customFonts}
      />
    </div>
  );
};
