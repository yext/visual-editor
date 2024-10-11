import "./puck.css";
import React from "react";
import { Data, usePuck, type History } from "@measured/puck";
import { PanelLeft, PanelRight, RotateCcw, RotateCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/AlertDialog.tsx";
import { useCallback, useEffect } from "react";
import { Button } from "../ui/button.tsx";
import { Switch } from "../ui/switch.tsx";
import { useEntityField } from "../../../components/EntityField.tsx";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/Tooltip.tsx";
import "../../../components/index.css";
import { ThemeSaveState } from "../../types/themeSaveState.ts";
import {ThemeConfig} from "../../../utils.ts";
import {updateThemeInEditor} from "../../../utils/applyTheme.ts";

export const customHeader = (
  handleClearLocalChanges: () => void,
  handleHistoryChange: (histories: History[], index: number) => void,
  handleSaveData: (data: Data) => Promise<void>,
  isDevMode: boolean,
  isThemeMode: boolean,
  setThemeHistory: (themeHistory: ThemeSaveState) => void,
  themeConfig?: ThemeConfig,
  themeHistory?: ThemeSaveState,
) => {
  const {
    appState,
    history: {
      back,
      forward,
      histories,
      index,
      hasPast,
      hasFuture,
      setHistories,
    },
  } = usePuck();

  useEffect(() => {
    handleHistoryChange(histories, index);
  }, [index, histories, handleHistoryChange]);

  return (
    <header className="puck-header">
      <div className="header-left">
        <ToggleUIButtons />
        <ToggleEntityFields />
      </div>
      <div className="header-center"></div>
      <div className="actions">
        {!isThemeMode && (
          <Button
            variant="ghost"
            size="icon"
            disabled={!hasPast}
            onClick={back}
          >
            <RotateCcw className="sm-icon" />
          </Button>
        )}
        {!isThemeMode && (
          <Button
            variant="ghost"
            size="icon"
            disabled={!hasFuture}
            onClick={forward}
          >
            <RotateCw className="sm-icon" />
          </Button>
        )}
        <ClearLocalChangesButton
          disabled={
            isThemeMode
              ? themeHistory?.history.length === 1
              : histories.length === 1
          }
          onClearLocalChanges={() => {
            handleClearLocalChanges();
            if (isThemeMode) {
              if (themeConfig) {
                updateThemeInEditor(themeHistory?.history[0], themeConfig)
              }
              setThemeHistory({
                history: [themeHistory?.history[0]],
                index: 0
              });
            } else {
              setHistories([
                { id: "root", state: { data: histories[0].state.data } },
              ]);
            }
          }}
        />
        {!isDevMode && (
          <Button
            variant="secondary"
            disabled={
              isThemeMode
                ? themeHistory?.history.length === 1
                : histories.length === 1
            }
            onClick={async () => {
              await handleSaveData(appState.data);
              handleClearLocalChanges();
              if (isThemeMode) {
                setThemeHistory({
                  history: [themeHistory?.history[themeHistory?.history.length - 1]],
                  index: 0
                });
              } else {
                setHistories([{ id: "root", state: { data: appState.data } }]);
              }
            }}
          >
            Publish
          </Button>
        )}
      </div>
    </header>
  );
};

interface ClearLocalChangesButtonProps {
  disabled: boolean;
  onClearLocalChanges: () => void;
}

const ClearLocalChangesButton = ({
  disabled,
  onClearLocalChanges,
}: ClearLocalChangesButtonProps) => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  const handleClearLocalChanges = () => {
    onClearLocalChanges();
    setDialogOpen(false);
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger disabled={disabled} asChild>
        <Button variant="outline">Clear Local Changes</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear Local Changes</AlertDialogTitle>
          <AlertDialogDescription>
            This action will remove your local changes. It cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handleClearLocalChanges}>Confirm</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const ToggleUIButtons = () => {
  const {
    dispatch,
    appState: {
      ui: { leftSideBarVisible, rightSideBarVisible },
    },
  } = usePuck();

  const toggleSidebars = useCallback(
    (sidebar: "left" | "right") => {
      const widerViewport = window.matchMedia("(min-width: 638px)").matches;
      const sideBarVisible =
        sidebar === "left" ? leftSideBarVisible : rightSideBarVisible;
      const oppositeSideBar =
        sidebar === "left" ? "rightSideBarVisible" : "leftSideBarVisible";

      dispatch({
        type: "setUi",
        ui: {
          [`${sidebar}SideBarVisible`]: !sideBarVisible,
          ...(!widerViewport ? { [oppositeSideBar]: false } : {}),
        },
      });
    },
    [dispatch, leftSideBarVisible, rightSideBarVisible]
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          toggleSidebars("left");
        }}
      >
        <PanelLeft className="sm-icon" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          toggleSidebars("right");
        }}
      >
        <PanelRight className="sm-icon" />
      </Button>
    </>
  );
};

const ToggleEntityFields = () => {
  const { toggleTooltips, tooltipsVisible } = useEntityField();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="ve-flex ve-flex-row ve-self-center ve-gap-3 ve-pl-2">
            <Switch
              onCheckedChange={toggleTooltips}
              checked={tooltipsVisible}
            />
            <p className="ve-self-center ve-text-sm">Entity Fields</p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipsVisible ? "Hide Entity Fields" : "Show Entity Fields"}
          <TooltipArrow fill="ve-bg-popover" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
