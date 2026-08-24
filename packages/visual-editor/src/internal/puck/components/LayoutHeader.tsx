import React from "react";
import {
  createUsePuck,
  Data,
  useGetPuck,
  type History,
} from "@puckeditor/core";
import { Info, RotateCcw, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "../ui/button.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/Tooltip.tsx";
import { UIButtonsToggle } from "../ui/UIButtonsToggle.tsx";
import { ClearLocalChangesButton } from "../ui/ClearLocalChangesButton.tsx";
import { LayoutApprovalModal } from "../../components/modals/LayoutApprovalModal.tsx";
import { TemplateMetadata } from "../../types/templateMetadata.ts";
import "../ui/puck.css";
import "../../../editor/index.css";
import { migrate } from "../../../utils/migrate.ts";
import { migrationRegistry } from "../../../components/migrations/migrationRegistry.ts";
import {
  i18nComponentsInstance,
  loadComponentTranslations,
} from "../../../utils/i18n/components.ts";
import {
  i18nPlatformInstance,
  usePlatformTranslation,
  pt,
  loadPlatformTranslations,
} from "../../../utils/i18n/platform.ts";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { DevLogger } from "../../../utils/devLogger.ts";
import {
  type ErrorDetail,
  type ErrorSource,
} from "../../../contexts/ErrorContext.tsx";
import { getPublishErrorMessage } from "../../../utils/publishErrors.ts";
import { getPublishTooltipMessageFromHeadDeployStatus } from "../../utils/getPublishTooltipMessageFromHeadDeployStatus.ts";
import { EntityFieldsToggle } from "../ui/EntityFieldsToggle.tsx";
import { validateDynamicConfig } from "../../ai/validateDynamicConfig.ts";
import {
  normalizeDynamicConfig,
  normalizeDynamicData,
} from "../../ai/normalizeDynamicConfig.ts";

const usePuck = createUsePuck();
const devLogger = new DevLogger();

type LayoutHeaderProps = {
  templateMetadata: TemplateMetadata;
  onClearLocalChanges: () => void;
  onHistoryChange: (histories: History[], index: number) => void;
  puckApiRef: React.MutableRefObject<ReturnType<typeof useGetPuck> | undefined>;
  onPublishLayout: (data: Data) => Promise<void>;
  onSendLayoutForApproval: (data: Data, comment: string) => void;
  localDev: boolean;
  showLocalDevOverrideButtons: boolean;
  hasErrors: boolean;
  errorSources: ErrorSource[];
  errorDetails: Partial<Record<ErrorSource, ErrorDetail>>;
};

export const LayoutHeader = (props: LayoutHeaderProps) => {
  const {
    templateMetadata,
    onClearLocalChanges,
    onHistoryChange,
    puckApiRef,
    onPublishLayout,
    onSendLayoutForApproval,
    localDev,
    showLocalDevOverrideButtons,
    hasErrors,
    errorSources,
    errorDetails,
  } = props;
  const streamDocument = useDocument();
  const getPuck = useGetPuck();

  React.useEffect(() => {
    puckApiRef.current = getPuck;
  }, [getPuck, puckApiRef]);

  const [approvalModalOpen, setApprovalModalOpen] =
    React.useState<boolean>(false);
  const [clearLocalChangesModalOpen, setClearLocalChangesModalOpen] =
    React.useState<boolean>(false);
  const { i18n } = usePlatformTranslation();
  const histories = usePuck((s) => s.history.histories);
  const index = usePuck((s) => s.history.index);
  const hasFuture = usePuck((s) => s.history.hasFuture);
  const hasPast = usePuck((s) => s.history.hasPast);

  useEffect(() => {
    onHistoryChange(histories, index);
  }, [index, histories, onHistoryChange]);

  useEffect(translatePuckSidebars, [i18n.language]);

  const buttonText = (() => {
    if (templateMetadata.assignment === "ALL") {
      // TODO: translation concatenation
      const pageText =
        templateMetadata.entityCount === 1
          ? pt("page", "Page")
          : pt("pages", "Pages");
      return `${pt("update", "Update")} ${templateMetadata.entityCount} ${pageText}`;
    } else if (templateMetadata.assignment === "ENTITY") {
      if (templateMetadata.layoutTaskApprovals) {
        return pt("approvals.send", "Send for Approval");
      }
      return pt("updatePage", "Update Page");
    }
  })();

  const onButtonClick = async () => {
    const {
      appState,
      history: { setHistories },
    } = getPuck();

    if (
      templateMetadata.assignment == "ENTITY" &&
      templateMetadata.layoutTaskApprovals
    ) {
      setApprovalModalOpen(true);
    } else {
      await onPublishLayout(appState.data);
      onClearLocalChanges();
      setHistories([
        { id: "root", state: { data: appState.data, ui: appState.ui } },
      ]);
    }
  };

  const publishDisabled =
    histories.length === 1 ||
    hasErrors ||
    templateMetadata.headDeployStatus !== "ACTIVE";
  const publishTooltipMessage =
    (hasErrors ?? getPublishErrorMessage(errorSources, errorDetails)) ||
    getPublishTooltipMessageFromHeadDeployStatus(
      templateMetadata.headDeployStatus
    );
  const showDynamicConfigButtons =
    localDev &&
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  const upsertDynamicConfig = (
    transform: (components: Record<string, any>) => Record<string, any>
  ) => {
    const { appState, dispatch } = getPuck();
    const existingRootProps =
      typeof appState.data.root?.props === "object" && appState.data.root.props
        ? (appState.data.root.props as Record<string, any>)
        : {};
    const existingDynamicConfig =
      typeof existingRootProps._dynamicConfig === "object" &&
      existingRootProps._dynamicConfig
        ? existingRootProps._dynamicConfig
        : {};
    const existingDynamicComponents =
      typeof existingDynamicConfig.components === "object" &&
      existingDynamicConfig.components
        ? existingDynamicConfig.components
        : {};

    dispatch({
      type: "setData",
      recordHistory: true,
      data: {
        ...appState.data,
        root: {
          ...appState.data.root,
          props: {
            ...existingRootProps,
            _dynamicConfig: {
              ...existingDynamicConfig,
              components: transform(existingDynamicComponents),
            },
          },
        },
      } as Data & {
        root: {
          props: Record<string, any>;
        };
      },
    });
  };

  const copyDynamicConfig = async () => {
    try {
      const { appState } = getPuck();
      const dynamicConfig =
        typeof appState.data.root?.props === "object" &&
        appState.data.root?.props &&
        "_dynamicConfig" in appState.data.root.props
          ? (appState.data.root.props as Record<string, any>)._dynamicConfig
          : {};

      await navigator.clipboard.writeText(
        JSON.stringify(dynamicConfig, null, 2)
      );
    } catch {
      alert(pt("failedToCopyDynamicConfig", "Failed to copy dynamic config."));
    }
  };

  const normalizeCurrentDynamicConfig = () => {
    const puckApi = getPuck();
    const normalized = normalizeDynamicData(
      puckApi.appState.data,
      puckApi.config
    );

    if (!normalized.changed) {
      return;
    }

    puckApi.dispatch({
      type: "setData",
      recordHistory: true,
      data: normalized.data,
    });
  };

  const pasteDynamicConfig = async () => {
    try {
      const rawClipboardText = await navigator.clipboard.readText();
      const pastedDynamicConfig = JSON.parse(rawClipboardText);

      if (
        !pastedDynamicConfig ||
        typeof pastedDynamicConfig !== "object" ||
        !pastedDynamicConfig.components ||
        typeof pastedDynamicConfig.components !== "object"
      ) {
        alert(
          pt(
            "failedToPasteDynamicConfigInvalidData",
            "Failed to paste: Invalid dynamic config."
          )
        );
        return;
      }

      const normalized = normalizeDynamicConfig(pastedDynamicConfig);
      const validationErrors = validateDynamicConfig(normalized.dynamicConfig);
      if (validationErrors.length > 0) {
        alert(validationErrors.join("\n"));
        return;
      }

      upsertDynamicConfig((existingDynamicComponents) => ({
        ...existingDynamicComponents,
        ...(normalized.dynamicConfig as { components: Record<string, any> })
          .components,
      }));
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        alert(
          pt(
            "failedToPasteDynamicConfigPermissionDenied",
            "Failed to paste: Clipboard access is blocked. Enable paste permissions and try again."
          )
        );
        return;
      }

      alert(
        pt("failedToPasteDynamicConfig", "Failed to paste dynamic config.")
      );
    }
  };

  return (
    <>
      <LayoutApprovalModal
        open={approvalModalOpen}
        setOpen={setApprovalModalOpen}
        onSendLayoutForApproval={(comment: string) => {
          const { appState } = getPuck();
          onSendLayoutForApproval(appState.data, comment);
        }}
      />
      <header className="puck-header">
        <div className="header-left ve-items-center">
          <UIButtonsToggle showLeft={true} />
          <Separator
            orientation="vertical"
            decorative
            className="ve-mx-4 ve-h-7 ve-w-px ve-bg-gray-300 ve-my-auto"
          />
          <Button
            variant="outline"
            onClick={async () => {
              const { appState } = getPuck();

              try {
                navigator.clipboard.writeText(
                  JSON.stringify(appState.data, null, 2)
                );
              } catch {
                alert(pt("failedToCopyLayout", "Failed to copy layout."));
              }
            }}
            className="mr-2"
          >
            {pt("copyLayout", "Copy Layout")}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const { dispatch, config } = getPuck();
                const rawClipboardText = await navigator.clipboard.readText();
                const pastedData = JSON.parse(rawClipboardText);

                if (
                  !pastedData ||
                  typeof pastedData !== "object" ||
                  pastedData.root === undefined ||
                  pastedData.content === undefined
                ) {
                  alert(
                    pt(
                      "failedToPasteLayoutInvalidData",
                      "Failed to paste: Invalid layout data."
                    )
                  );
                  return;
                }

                const migratedPastedData = migrate(
                  pastedData,
                  migrationRegistry,
                  config,
                  streamDocument
                );

                devLogger.logData("PASTED_DATA", migratedPastedData);
                dispatch({
                  type: "setData",
                  data: migratedPastedData,
                });
              } catch (err) {
                if (
                  err instanceof DOMException &&
                  err.name === "NotAllowedError"
                ) {
                  alert(
                    pt(
                      "failedToPasteLayoutPermissionDenied",
                      "Failed to paste: Clipboard access is blocked. Enable paste permissions and try again."
                    )
                  );
                  return;
                }

                alert(pt("failedToPasteLayout", "Failed to paste layout."));
                return;
              }
            }}
          >
            {pt("pasteLayout", "Paste Layout")}
          </Button>
          <Separator
            orientation="vertical"
            decorative
            className="ve-mx-4 ve-h-7 ve-w-px ve-bg-gray-300 ve-my-auto"
          />
          <EntityFieldsToggle />
          {showDynamicConfigButtons && (
            <>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={pt(
                        "dynamicConfigLocalOnly",
                        "Dynamic config buttons are only shown in local editor"
                      )}
                      className="ve-ml-3 ve-flex ve-h-5 ve-w-5 ve-items-center ve-justify-center ve-rounded-full ve-text-gray-500 hover:ve-text-gray-700"
                    >
                      <Info className="ve-h-4 ve-w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {pt(
                      "dynamicConfigLocalOnly",
                      "Dynamic config buttons are only shown in local editor"
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="outline"
                onClick={copyDynamicConfig}
                className="ve-ml-2 ve-border-red-500 ve-text-red-600 hover:ve-bg-red-50 hover:ve-text-red-700"
              >
                {pt("copyDynamicConfig", "Copy Dynamic Config")}
              </Button>
              <Button
                variant="outline"
                onClick={pasteDynamicConfig}
                className="ve-ml-2 ve-border-red-500 ve-text-red-600 hover:ve-bg-red-50 hover:ve-text-red-700"
              >
                {pt("pasteDynamicConfig", "Paste Dynamic Config")}
              </Button>
              <Button
                variant="outline"
                onClick={normalizeCurrentDynamicConfig}
                className="ve-ml-2 ve-border-red-500 ve-text-red-600 hover:ve-bg-red-50 hover:ve-text-red-700"
              >
                {pt("normalizeDynamicConfig", "Normalize Dynamic Config")}
              </Button>
            </>
          )}
          {localDev && showLocalDevOverrideButtons && (
            <LocalDevOverrideButtons />
          )}
        </div>
        <div className="header-center"></div>
        <div className="actions">
          <Button
            variant="ghost"
            size="icon"
            disabled={!hasPast}
            onClick={() => {
              const {
                history: { back },
              } = getPuck();
              back();
            }}
            aria-label={pt("undo", "Undo")}
          >
            <RotateCcw className="sm-icon" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={!hasFuture}
            onClick={() => {
              const {
                history: { forward },
              } = getPuck();
              forward();
            }}
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
            disabled={histories.length === 1}
            onClearLocalChanges={() => {
              const {
                history: { setHistories },
              } = getPuck();
              onClearLocalChanges();
              setHistories([{ ...histories[0] }]);
            }}
          />
          {!templateMetadata.isDevMode && (
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
                      onClick={onButtonClick}
                      className={
                        publishDisabled ? "ve-pointer-events-none" : ""
                      }
                    >
                      {buttonText}
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
    </>
  );
};

export const LocalDevOverrideButtons = () => {
  const getPuck = useGetPuck();
  const streamDocument = useDocument();

  return (
    <>
      <Button
        onClick={() => {
          const { appState } = getPuck();
          console.log(JSON.stringify(appState.data));
        }}
        variant="outline"
        className="ve-ml-4"
      >
        Log Layout Data
      </Button>
      <Button
        onClick={() => {
          const {
            history: { setHistories, histories },
            config,
          } = getPuck();
          let data = { root: {}, content: [] };
          try {
            data = JSON.parse(prompt("Enter layout data:") ?? "{}");
          } finally {
            const migratedData = migrate(
              data,
              migrationRegistry,
              config,
              streamDocument
            );
            setHistories([...histories, { state: { data: migratedData } }]);
          }
        }}
        variant="outline"
        className="ve-ml-4"
      >
        Set Layout Data
      </Button>
      <Button
        onClick={async () => {
          const locale = prompt("Enter components locale:") || "en";
          await loadComponentTranslations(locale);
          i18nComponentsInstance.changeLanguage(locale);
        }}
        variant="outline"
        className="ve-ml-4"
      >
        Set Components Locale
      </Button>
      <Button
        onClick={async () => {
          const locale = prompt("Enter platform locale:") || "en";
          await loadPlatformTranslations(locale);
          i18nPlatformInstance.changeLanguage(locale);
        }}
        variant="outline"
        className="ve-ml-4"
      >
        Set Platform Locale
      </Button>
    </>
  );
};

const translatePuckSidebars = () => {
  // Translate the static left sidebar titles
  const leftSideBarTitles = document.querySelectorAll<HTMLElement>(
    "[class*='PuckLayout-leftSideBar'] h2[class*='_Heading']"
  );
  if (leftSideBarTitles[0]) {
    leftSideBarTitles[0].innerText = pt("components.components", "Components");
  }
  if (leftSideBarTitles[1]) {
    leftSideBarTitles[1].innerText = pt("outline", "Outline");
  }

  // Translate the right sidebar title on load
  const fieldListSingleTitle = document.querySelector<HTMLElement>(
    "[class*='PuckLayout-rightSideBar'] div[class*='_SidebarSection-heading']:first-child > h2"
  );
  if (fieldListSingleTitle) {
    fieldListSingleTitle.innerText = pt("page", "Page");
  }

  // Translate the component category labels
  // These will only translate on initial load
  const componentCategoryTitles = document.querySelectorAll<HTMLElement>(
    "button[class*='ComponentList-title'] > div"
  );
  if (componentCategoryTitles?.length) {
    componentCategoryTitles.forEach((title) => {
      if (title.innerText === "STANDARD SECTIONS") {
        title.innerText = pt(
          "categories.standardSections",
          "Standard Sections"
        ).toUpperCase();
      } else if (title.innerText === "OTHER") {
        title.innerText = pt("categories.other", "Other").toUpperCase();
      }
    });
  }

  // Dynamically translate the right sidebar title as it updates
  const rightSidebar = document.querySelector(
    "[class*='PuckLayout-rightSideBar']"
  );
  if (!rightSidebar) {
    return;
  }

  const observer = new MutationObserver(() => {
    const fieldListSingleTitle = document.querySelector<HTMLElement>(
      "[class*='PuckLayout-rightSideBar'] div[class*='_SidebarSection-heading']:first-child > h2"
    );
    if (
      fieldListSingleTitle &&
      fieldListSingleTitle.innerText !== pt("page", "Page")
    ) {
      fieldListSingleTitle.innerText = pt("page", "Page");
    }

    const fieldListBreadcrumbTitle = document.querySelector<HTMLElement>(
      "[class*='PuckLayout-rightSideBar'] div[class*='_SidebarSection-breadcrumb'] button"
    );
    if (
      fieldListBreadcrumbTitle &&
      fieldListBreadcrumbTitle.innerText !== pt("page", "Page")
    ) {
      fieldListBreadcrumbTitle.innerText = pt("page", "Page");
    }
  });

  observer.observe(rightSidebar, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
};
