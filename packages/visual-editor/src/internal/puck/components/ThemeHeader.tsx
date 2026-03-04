import "../ui/puck.css";
import React, { useEffect } from "react";
import { Button } from "../ui/button.tsx";
import "../../../editor/index.css";
import { ThemeConfig } from "../../../utils/themeResolver.ts";
import {
  PUCK_PREVIEW_IFRAME_ID,
  updateThemeInEditor,
} from "../../../utils/applyTheme.ts";
import { UIButtonsToggle } from "../ui/UIButtonsToggle.tsx";
import { ClearLocalChangesButton } from "../ui/ClearLocalChangesButton.tsx";
import { InitialHistory, createUsePuck, useGetPuck } from "@puckeditor/core";
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

const SIDEBAR_HIDE_STYLE_ID = "yext-theme-hide-sidebar-breadcrumbs";
const usePuck = createUsePuck();

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
    headDeployStatus,
  } = props;

  const getPuck = useGetPuck();
  const previewMode = usePuck((s) => s.appState.ui.previewMode);

  useEffect(() => {
    // Initialize Puck history and set preview mode to "interactive" on mount
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
    // Prevents the "Page" / breadcrumb from appearing over the right sidebar
    if (!document.getElementById(SIDEBAR_HIDE_STYLE_ID)) {
      const style = document.createElement("style");
      style.id = SIDEBAR_HIDE_STYLE_ID;
      style.innerHTML = `
        [class*='SidebarSection-breadcrumbs'] {
          display: none !important;
        }
        [class*='SidebarSection-title'] {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      document.getElementById(SIDEBAR_HIDE_STYLE_ID)?.remove();
    };
  }, []);

  useEffect(() => {
    // Prevent user from clicking links, but allow hover/focus
    let detachLinkNavigationBlock: (() => void) | undefined;
    let activeFrame: HTMLIFrameElement | null = null;

    const attachLinkNavigationBlock = (previewDocument: Document) => {
      const previewWindow = previewDocument.defaultView;

      const isLinkLikeTarget = (event: Event) => {
        const targetElement = event.target;
        if (!(targetElement instanceof Element)) {
          return false;
        }

        return !!targetElement.closest("a, area, [role='link']");
      };

      const preventLinkNavigation = (event: Event) => {
        if (!isLinkLikeTarget(event)) {
          return;
        }

        if (event instanceof KeyboardEvent) {
          if (event.key !== "Enter" && event.key !== " ") {
            return;
          }
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      };

      const disableAnchorNavigationAttributes = () => {
        previewDocument
          .querySelectorAll("a[href], area[href]")
          .forEach((el) => {
            if (!el.hasAttribute("data-ve-original-href")) {
              el.setAttribute(
                "data-ve-original-href",
                el.getAttribute("href") ?? ""
              );
            }

            el.removeAttribute("href");

            if (el.hasAttribute("target")) {
              el.setAttribute(
                "data-ve-original-target",
                el.getAttribute("target") ?? ""
              );
              el.removeAttribute("target");
            }
          });
      };

      disableAnchorNavigationAttributes();
      const anchorObserver = new MutationObserver(() => {
        disableAnchorNavigationAttributes();
      });
      anchorObserver.observe(previewDocument.documentElement, {
        childList: true,
        subtree: true,
      });

      const eventTypes = [
        "click",
        "auxclick",
        "mousedown",
        "mouseup",
        "pointerdown",
        "pointerup",
        "touchstart",
        "keydown",
      ] as const;

      eventTypes.forEach((eventType) => {
        previewDocument.addEventListener(
          eventType,
          preventLinkNavigation,
          true
        );
        previewWindow?.addEventListener(eventType, preventLinkNavigation, true);
      });

      return () => {
        anchorObserver.disconnect();

        previewDocument
          .querySelectorAll(
            "a[data-ve-original-href], area[data-ve-original-href]"
          )
          .forEach((el) => {
            const originalHref = el.getAttribute("data-ve-original-href");
            if (originalHref !== null) {
              el.setAttribute("href", originalHref);
            }
            el.removeAttribute("data-ve-original-href");

            if (el.hasAttribute("data-ve-original-target")) {
              const originalTarget = el.getAttribute("data-ve-original-target");
              if (originalTarget !== null) {
                el.setAttribute("target", originalTarget);
              }
              el.removeAttribute("data-ve-original-target");
            }
          });

        eventTypes.forEach((eventType) => {
          previewDocument.removeEventListener(
            eventType,
            preventLinkNavigation,
            true
          );
          previewWindow?.removeEventListener(
            eventType,
            preventLinkNavigation,
            true
          );
        });
      };
    };

    const attachToPreviewFrame = (frame: HTMLIFrameElement) => {
      if (activeFrame === frame) {
        return;
      }

      activeFrame?.removeEventListener("load", onPreviewFrameLoad);
      detachLinkNavigationBlock?.();

      activeFrame = frame;
      activeFrame.addEventListener("load", onPreviewFrameLoad);
      if (activeFrame.contentDocument) {
        detachLinkNavigationBlock = attachLinkNavigationBlock(
          activeFrame.contentDocument
        );
      }
    };

    const onPreviewFrameLoad = () => {
      detachLinkNavigationBlock?.();
      if (activeFrame?.contentDocument) {
        detachLinkNavigationBlock = attachLinkNavigationBlock(
          activeFrame.contentDocument
        );
      }
    };

    const syncPreviewFrame = () => {
      const previewFrame = document.getElementById(
        PUCK_PREVIEW_IFRAME_ID
      ) as HTMLIFrameElement | null;
      if (!previewFrame) {
        return;
      }

      attachToPreviewFrame(previewFrame);
    };

    const iframeObserver = new MutationObserver(syncPreviewFrame);
    iframeObserver.observe(document, {
      childList: true,
      subtree: true,
    });

    syncPreviewFrame();

    return () => {
      iframeObserver.disconnect();
      activeFrame?.removeEventListener("load", onPreviewFrameLoad);
      detachLinkNavigationBlock?.();
      activeFrame = null;
    };
  }, []);

  useEffect(() => {
    // Keep theme mode in interactive preview so links/buttons are hoverable
    // and Puck component selection is disabled.
    if (previewMode !== "interactive") {
      const { dispatch } = getPuck();
      dispatch({
        type: "setUi",
        ui: { previewMode: "interactive" },
      });
    }
  }, [previewMode, getPuck]);

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
    themeHistories?.histories?.length === 1 || headDeployStatus !== "ACTIVE";

  const publishTooltipMessage =
    getPublishTooltipMessageFromHeadDeployStatus(headDeployStatus);

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
          <TooltipProvider delayDuration={0}>
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
