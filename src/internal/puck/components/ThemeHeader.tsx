import "../ui/puck.css";
import React, { useEffect } from "react";
import { Button } from "../ui/button.tsx";
import "../../../components/index.css";
import { ThemeSaveState } from "../../types/themeSaveState.ts";
import { ThemeConfig } from "../../../utils/themeResolver.ts";
import { updateThemeInEditor } from "../../../utils/applyTheme.ts";
import { EntityFieldsToggle } from "../ui/EntityFieldsToggle.tsx";
import { UIButtonsToggle } from "../ui/UIButtonsToggle.tsx";
import { ClearLocalChangesButton } from "../ui/ClearLocalChangesButton.tsx";
import { InitialHistory, usePuck } from "@measured/puck";

type ThemeHeaderProps = {
  onPublishTheme: () => Promise<void>;
  isDevMode: boolean;
  setThemeHistory: (themeHistory: ThemeSaveState) => void;
  themeConfig?: ThemeConfig;
  themeHistory?: ThemeSaveState;
  clearThemeHistory: () => void;
  puckInitialHistory: InitialHistory | undefined;
};

export const ThemeHeader = (props: ThemeHeaderProps) => {
  const {
    isDevMode,
    setThemeHistory,
    onPublishTheme,
    themeConfig,
    themeHistory,
    clearThemeHistory,
    puckInitialHistory,
  } = props;

  const {
    history: { setHistories },
  } = usePuck();

  useEffect(() => {
    setHistories(puckInitialHistory?.histories || []);
  }, [puckInitialHistory]);

  useEffect(() => {
    // Hide the components list and fields list titles
    const componentList = document.querySelector<HTMLElement>(
      "[class*='PuckLayout-leftSideBar'] > div[class*='SidebarSection--noBorderTop']"
    );
    if (componentList) {
      componentList.style.display = "none";
    }
    const fieldListTitle = document.querySelector<HTMLElement>(
      "[class*='PuckLayout-rightSideBar'] > div[class*='SidebarSection--noBorderTop'] > div[class*='SidebarSection-title']"
    );
    if (fieldListTitle) {
      fieldListTitle.style.display = "none";
    }
  }, []);

  return (
    <header className="puck-header">
      <div className="header-left">
        <UIButtonsToggle />
        <EntityFieldsToggle />
      </div>
      <div className="header-center"></div>
      <div className="actions">
        <ClearLocalChangesButton
          disabled={themeHistory?.history.length === 1}
          onClearLocalChanges={() => {
            clearThemeHistory();
            if (themeConfig) {
              updateThemeInEditor(themeHistory?.history[0], themeConfig);
            }
            setThemeHistory({
              history: [themeHistory?.history[0]],
              index: 0,
            });
          }}
        />
        {!isDevMode && (
          <Button
            variant="secondary"
            disabled={themeHistory?.history.length === 1}
            onClick={async () => {
              await onPublishTheme();
              setThemeHistory({
                history: [
                  themeHistory?.history[themeHistory?.history.length - 1],
                ],
                index: 0,
              });
            }}
          >
            Publish
          </Button>
        )}
      </div>
    </header>
  );
};
