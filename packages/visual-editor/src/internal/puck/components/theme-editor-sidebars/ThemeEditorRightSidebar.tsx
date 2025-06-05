import React from "react";
import { Alert, AlertDescription } from "../../ui/atoms/Alert.tsx";
import { ThemeConfig } from "../../../../utils/themeResolver.ts";
import { OnThemeChangeFunc, ThemeHistories } from "../../../types/themeData.ts";
import "@measured/puck/dist/index.css";
import { ThemeFieldsSidebar } from "./ThemeFieldsSidebar.tsx";
import { usePlatformTranslation } from "../../../../utils/i18nPlatform.ts";

type ThemeEditorRightSidebarProps = {
  themeHistoriesRef: React.MutableRefObject<ThemeHistories | undefined>;
  themeConfig?: ThemeConfig;
  onThemeChange: OnThemeChangeFunc;
};

export const ThemeEditorRightSidebar = (
  props: ThemeEditorRightSidebarProps
) => {
  const { themeConfig, themeHistoriesRef, onThemeChange } = props;
  const { t } = usePlatformTranslation();

  if (!themeHistoriesRef.current) {
    return;
  }

  if (!themeConfig) {
    return (
      <div>
        <Alert>
          <AlertDescription>
            {t(
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
          {t(
            "themeSidebar.warning",
            "Changes will affect all page sets and layouts for the entire site."
          )}
        </AlertDescription>
      </Alert>

      <ThemeFieldsSidebar
        themeConfig={themeConfig}
        themeData={themeData}
        onThemeChange={onThemeChange}
      />
    </div>
  );
};
