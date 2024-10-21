import "../ui/puck.css";
import React, { useEffect } from "react";
import { Button } from "../ui/button.tsx";
import "../../../components/index.css";
import { SavedTheme, ThemeConfig } from "../../../utils/themeResolver.ts";
import { updateThemeInEditor } from "../../../utils/applyTheme.ts";
import { EntityFieldsToggle } from "../ui/EntityFieldsToggle.tsx";
import { UIButtonsToggle } from "../ui/UIButtonsToggle.tsx";
import { ClearLocalChangesButton } from "../ui/ClearLocalChangesButton.tsx";
import { InitialHistory, usePuck } from "@measured/puck";
import { ThemeHistories } from "../../types/themeData.ts";

type ThemeHeaderProps = {
  onPublishTheme: () => Promise<void>;
  isDevMode: boolean;
  setThemeHistory: (themeHistory: ThemeHistories) => void;
  themeConfig?: ThemeConfig;
  themeHistory?: ThemeHistories;
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
          disabled={themeHistory?.histories?.length === 1}
          onClearLocalChanges={() => {
            clearThemeHistory();
            if (themeConfig) {
              updateThemeInEditor(
                themeHistory?.histories?.[0]?.state?.data as SavedTheme,
                themeConfig
              );
            }
            setThemeHistory({
              histories: [
                {
                  id: themeHistory?.histories?.[0]?.id ?? "",
                  state: { data: themeHistory?.histories?.[0]?.state?.data },
                },
              ],
              index: 0,
            });
          }}
        />
        {!isDevMode && (
          <Button
            variant="secondary"
            disabled={themeHistory?.histories?.length === 1}
            onClick={async () => {
              await onPublishTheme();
              setThemeHistory({
                histories: [
                  {
                    id:
                      themeHistory?.histories[
                        themeHistory?.histories?.length - 1
                      ]?.id ?? "",
                    state: {
                      data: themeHistory?.histories?.[
                        themeHistory?.histories?.length - 1
                      ]?.state?.data,
                    },
                  },
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
