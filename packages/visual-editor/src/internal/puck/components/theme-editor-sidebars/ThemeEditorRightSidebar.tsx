import React from "react";
import { Alert, AlertDescription } from "../../ui/atoms/Alert.tsx";
import { OnThemeChangeFunc, ThemeHistories } from "../../../types/themeData.ts";
import "@puckeditor/core/dist/index.css";
import { ThemeFieldsSidebar } from "./ThemeFieldsSidebar.tsx";
import { pt } from "../../../../utils/i18n/platform.ts";
import { FontRegistry } from "../../../../utils/fonts/visualEditorFonts.ts";

type ThemeEditorRightSidebarProps = {
  themeHistories?: ThemeHistories;
  onThemeChange: OnThemeChangeFunc;
  customFonts?: FontRegistry;
};

export const ThemeEditorRightSidebar = (
  props: ThemeEditorRightSidebarProps
) => {
  const { themeHistories, onThemeChange, customFonts } = props;

  if (!themeHistories) {
    return;
  }

  const themeData = themeHistories.histories[themeHistories.index]?.data ?? {};

  return (
    <div>
      <Alert>
        <AlertDescription>
          {pt(
            "themeSidebar.warning",
            "Changes will affect all page groups and layouts for the entire site."
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
