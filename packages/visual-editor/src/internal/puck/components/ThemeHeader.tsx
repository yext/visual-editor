import "../ui/puck.css";
import React, { useEffect } from "react";
import { Button } from "../ui/button.tsx";
import "../../../editor/index.css";
import { ThemeConfig } from "../../../utils/themeResolver.ts";
import { updateThemeInEditor } from "../../../utils/applyTheme.ts";
import { UIButtonsToggle } from "../ui/UIButtonsToggle.tsx";
import { ClearLocalChangesButton } from "../ui/ClearLocalChangesButton.tsx";
import { InitialHistory, useGetPuck } from "@puckeditor/core";
import { ThemeData, ThemeHistories } from "../../types/themeData.ts";
import { RotateCcw, RotateCw } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { LocalDevOverrideButtons } from "./LayoutHeader.tsx";
import { pt } from "../../../utils/i18n/platform.ts";
import { HeadDeployStatus } from "../../types/templateMetadata.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/Tooltip.tsx";
import { getPublishTooltipMessageFromHeadDeployStatus } from "../../utils/getPublishTooltipMessageFromHeadDeployStatus.ts";

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
  totalEntityCount: number;
  localDev: boolean;
  headDeployStatus: HeadDeployStatus;
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
    totalEntityCount,
    localDev,
  } = props;

  const getPuck = useGetPuck();

  useEffect(() => {
    const {
      dispatch,
      history: { setHistories },
    } = getPuck();

    setHistories(puckInitialHistory?.histories || []);
    dispatch({
      type: "setUi",
      ui: {
        previewMode: "interactive",
      },
    });
  }, [puckInitialHistory]);

  useEffect(() => {
    // Hide the components list and fields list titles
    const fieldListTitle = document.querySelector<HTMLElement>(
      "[class*='PuckLayout-rightSideBar'] > div[class*='SidebarSection--noBorderTop'] > div[class*='SidebarSection-title']"
    );
    if (fieldListTitle) {
      fieldListTitle.style.display = "none";
    }
    const puckPreview =
      document.querySelector<HTMLIFrameElement>("#preview-frame");
    if (
      puckPreview?.contentDocument?.head &&
      !puckPreview?.contentDocument.getElementById(
        "yext-preview-disable-pointer-events"
      )
    ) {
      // add this style to preview iFrame to prevent clicking or hover effects.
      const style = puckPreview.contentDocument.createElement("style");
      style.id = "yext-preview-disable-pointer-events";
      style.innerHTML = `
        * {
          cursor: default !important;
          pointer-events: none !important;
        }
      `;
      puckPreview.contentDocument.head.appendChild(style);
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

  useEffect(() => {
    const { dispatch } = getPuck();
    dispatch({
      type: "setUi",
      ui: { leftSideBarVisible: false },
    });
  }, []);

  const publishDisabled =
    themeHistories?.histories?.length === 1 ||
    props.headDeployStatus !== "ACTIVE";

  const publishTooltipMessage = getPublishTooltipMessageFromHeadDeployStatus(
    props.headDeployStatus
  );

  return (
    <header className="puck-header">
      <div className="header-left">
        <UIButtonsToggle showLeft={false} />
      </div>
      {localDev && <LocalDevOverrideButtons />}
      <div className="header-center"></div>
      <div className="actions">
        <Button
          variant="ghost"
          size="icon"
          disabled={!canUndo()}
          onClick={undo}
          aria-label={pt("undo", "Undo")}
        >
          <RotateCcw className="sm-icon" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          disabled={!canRedo()}
          onClick={redo}
          aria-label={pt("redo", "Redo")}
        >
          <RotateCw className="sm-icon" />
        </Button>
        <Separator
          orientation="vertical"
          decorative
          className="ve-mx-4 ve-h-7 ve-w-px ve-bg-gray-300 ve-my-auto"
        />
        <ClearLocalChangesButton
          modalOpen={clearLocalChangesModalOpen}
          setModalOpen={setClearLocalChangesModalOpen}
          disabled={themeHistories?.histories?.length === 1}
          onClearLocalChanges={() => {
            clearThemeHistory();
            if (themeConfig) {
              updateThemeInEditor(
                themeHistories?.histories?.[0]?.data as ThemeData,
                themeConfig,
                true
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={publishDisabled ? 0 : -1}
                  className={publishDisabled ? "ve-cursor-not-allowed" : ""}
                  role={publishDisabled ? "button" : undefined}
                  aria-disabled={publishDisabled || undefined}
                >
                  <Button
                    variant="secondary"
                    disabled={publishDisabled}
                    onClick={async () => {
                      await onPublishTheme();
                    }}
                    className={publishDisabled ? "ve-pointer-events-none" : ""}
                  >
                    {
                      // TODO: translation concatenation
                      `${pt("update", "Update")} ${totalEntityCount} ${totalEntityCount === 1 ? pt("page", "Page") : pt("pages", "Pages")}`
                    }
                  </Button>
                </span>
              </TooltipTrigger>
              {publishTooltipMessage && (
                <TooltipContent className="ve-max-w-[320px] ve-whitespace-pre-line ve-text-left">
                  <p>{publishTooltipMessage}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </header>
  );
};
