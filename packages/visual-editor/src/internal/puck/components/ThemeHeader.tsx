import "../ui/puck.css";
import React, { useEffect } from "react";
import { Button } from "../ui/button.tsx";
import "../../../components/editor/index.css";
import { ThemeConfig } from "../../../utils/themeResolver.ts";
import { updateThemeInEditor } from "../../../utils/applyTheme.ts";
import { EntityFieldsToggle } from "../ui/EntityFieldsToggle.tsx";
import { UIButtonsToggle } from "../ui/UIButtonsToggle.tsx";
import { ClearLocalChangesButton } from "../ui/ClearLocalChangesButton.tsx";
import { InitialHistory, usePuck } from "@measured/puck";
import { ThemeData, ThemeHistories } from "../../types/themeData.ts";
import { RotateCcw, RotateCw } from "lucide-react";

type ThemeHeaderProps = {
  onPublishTheme: () => Promise<void>;
  isDevMode: boolean;
  setThemeHistories: (themeHistories: ThemeHistories) => void;
  themeConfig?: ThemeConfig;
  themeHistories?: ThemeHistories;
  clearThemeHistory: () => void;
  puckInitialHistory: InitialHistory | undefined;
  clearLocalChangesModalOpen: boolean;
  setClearLocalChangesModalOpen: (newValue: boolean) => void;
};

export const ThemeHeader = (props: ThemeHeaderProps) => {
  const {
    isDevMode,
    setThemeHistories,
    onPublishTheme,
    themeConfig,
    themeHistories,
    clearThemeHistory,
    puckInitialHistory,
    clearLocalChangesModalOpen,
    setClearLocalChangesModalOpen,
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
      "[class*='PuckLayout-leftSideBar'] h2"
    );
    if (componentList) {
      componentList.innerText = "Mode";
    }
    const fieldListTitle = document.querySelector<HTMLElement>(
      "[class*='PuckLayout-rightSideBar'] > div[class*='SidebarSection--noBorderTop'] > div[class*='SidebarSection-title']"
    );
    if (fieldListTitle) {
      fieldListTitle.style.display = "none";
    }
  }, []);

  const canUndo = (): boolean => {
    if (!themeHistories) {
      return false;
    }
    return themeHistories.index > 0;
  };

  const undo = () => {
    if (!themeHistories) {
      return;
    }
    setThemeHistories({
      histories: themeHistories.histories,
      index: themeHistories.index - 1,
    });
  };

  const canRedo = (): boolean => {
    if (!themeHistories) {
      return false;
    }
    return themeHistories.index < themeHistories.histories.length - 1;
  };

  const redo = () => {
    if (!themeHistories) {
      return;
    }
    setThemeHistories({
      histories: themeHistories.histories,
      index: themeHistories.index + 1,
    });
  };

  return (
    <header className="puck-header">
      <div className="header-left">
        <UIButtonsToggle />
        <EntityFieldsToggle />
      </div>
      <div className="header-center"></div>
      <div className="actions">
        <Button
          variant="ghost"
          size="icon"
          disabled={!canUndo()}
          onClick={undo}
          aria-label="Undo"
        >
          <RotateCcw className="sm-icon" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          disabled={!canRedo()}
          onClick={redo}
          aria-label="Redo"
        >
          <RotateCw className="sm-icon" />
        </Button>
        <ClearLocalChangesButton
          modalOpen={clearLocalChangesModalOpen}
          setModalOpen={setClearLocalChangesModalOpen}
          disabled={themeHistories?.histories?.length === 1}
          onClearLocalChanges={() => {
            clearThemeHistory();
            if (themeConfig) {
              updateThemeInEditor(
                themeHistories?.histories?.[0]?.data as ThemeData,
                themeConfig
              );
            }
            setThemeHistories({
              histories: [
                {
                  id: themeHistories?.histories?.[0]?.id ?? "",
                  data: themeHistories?.histories?.[0]?.data ?? {},
                },
              ],
              index: 0,
            });
          }}
        />
        {!isDevMode && (
          <Button
            variant="secondary"
            disabled={themeHistories?.histories?.length === 1}
            onClick={async () => {
              await onPublishTheme();
            }}
          >
            Publish
          </Button>
        )}
      </div>
    </header>
  );
};
