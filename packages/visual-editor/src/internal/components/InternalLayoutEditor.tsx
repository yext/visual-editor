import {
  Puck,
  Data,
  Config,
  type History,
  InitialHistory,
  AppState,
  ActionBar,
  useGetPuck,
  walkTree,
  ComponentDataOptionalId,
  FieldLabel,
  createUsePuck,
  resolveAllData,
  blocksPlugin,
  outlinePlugin,
} from "@puckeditor/core";
import React, { useState, useRef, useCallback, useMemo } from "react";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { EntityTooltipsProvider } from "../../editor/EntityField.tsx";
import { LayoutSaveState } from "../types/saveState.ts";
import { LayoutHeader } from "../puck/components/LayoutHeader.tsx";
import { DevLogger } from "../../utils/devLogger.ts";
import { YextEntityFieldSelector } from "../../editor/YextEntityFieldSelector.tsx";
import { loadMapboxIntoIframe } from "../utils/loadMapboxIntoIframe.tsx";
import * as lzstring from "lz-string";
import { msg, pt, usePlatformTranslation } from "../../utils/i18n/platform.ts";
import { ClipboardCopyIcon, ClipboardPasteIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Metadata } from "../../editor/Editor.tsx";
import { AdvancedSettings } from "./AdvancedSettings.tsx";
import { cn } from "../../utils/cn.ts";
import { removeDuplicateActionBars } from "../utils/removeDuplicateActionBars.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { fieldsOverride } from "../puck/components/FieldsOverride.tsx";
import { isDeepEqual } from "../../utils/deepEqual.ts";
import { useErrorContext } from "../../contexts/ErrorContext.tsx";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import { preparePuckAiRequest } from "../../utils/ai/prepareRequest.ts";

const devLogger = new DevLogger();
const usePuck = createUsePuck();
const blocks = blocksPlugin();
const outline = outlinePlugin();

// Advanced Settings link configuration
const createAdvancedSettingsLink = () => ({
  type: "custom" as const,
  ai: {
    exclude: true,
  },
  render: () => {
    const getPuck = useGetPuck();

    return (
      <div className="ve-p-4 ve-flex ve-justify-center ve-items-center">
        <button
          onClick={() => {
            const { dispatch } = getPuck();
            dispatch({
              type: "setUi",
              ui: {
                itemSelector: {
                  zone: "root:advanced",
                  index: 0,
                },
                rightSideBarVisible: true,
              },
            });
          }}
          className={cn(
            "ve-bg-none ve-border-none ve-text-blue-600 ve-no-underline ve-text-sm ve-font-medium ve-cursor-pointer ve-p-0"
          )}
        >
          {pt("advancedSettings", "Advanced Settings")}
        </button>
      </div>
    );
  },
});

type InternalLayoutEditorProps = {
  puckConfig: Config;
  puckInitialHistory: InitialHistory | undefined;
  isLoading: boolean;
  clearHistory: () => void;
  templateMetadata: TemplateMetadata;
  layoutSaveState: LayoutSaveState | undefined;
  saveLayoutSaveState: (data: any) => void;
  publishLayout: (data: any) => void;
  sendLayoutForApproval: (data: any) => void;
  sendDevSaveStateData: (data: any) => void;
  buildVisualConfigLocalStorageKey: () => string;
  localDev: boolean;
  metadata?: Metadata;
};

// Render Puck editor
export const InternalLayoutEditor = ({
  puckConfig,
  puckInitialHistory,
  isLoading,
  clearHistory,
  templateMetadata,
  layoutSaveState,
  saveLayoutSaveState,
  publishLayout,
  sendLayoutForApproval,
  sendDevSaveStateData,
  buildVisualConfigLocalStorageKey,
  localDev,
  metadata,
}: InternalLayoutEditorProps) => {
  const [canEdit, setCanEdit] = useState<boolean>(false); // helps sync puck preview and save state
  const historyIndex = useRef<number>(0);
  const { i18n } = usePlatformTranslation();
  const streamDocument = useDocument();
  const { errorCount } = useErrorContext();
  const aiPlugin = useMemo(
    () =>
      templateMetadata.aiPageGeneration
        ? createAiPlugin(
            localDev
              ? {
                  host: "http://127.0.0.1:8787/api/puck/chat",
                  prepareRequest: preparePuckAiRequest,
                }
              : {
                  host: "https://puck-ai-backend.sitescdn-cdntest.workers.dev/api/puck/chat",
                  prepareRequest: preparePuckAiRequest,
                }
          )
        : undefined,
    [templateMetadata.aiPageGeneration, localDev]
  );

  /**
   * When the Puck history changes save it to localStorage and send a message
   * to the parent which saves the state to the VES database.
   */
  const handleHistoryChange = useCallback(
    (histories: History<Partial<AppState>>[], index: number) => {
      if (
        index !== 0 &&
        historyIndex.current !== index &&
        histories.length > 0
      ) {
        devLogger.logFunc("handleHistoryChange");
        devLogger.logData("PUCK_INDEX", index);
        devLogger.logData("PUCK_HISTORY", histories);
        historyIndex.current = index;

        if (localDev || templateMetadata.isDevMode) {
          devLogger.logFunc("saveLayoutToLocalStorage");
          window.localStorage.setItem(
            buildVisualConfigLocalStorageKey(),
            lzstring.compress(JSON.stringify(histories))
          );
          if (localDev) {
            return;
          }
        }

        const current = histories[index];

        if (!current?.state) {
          return;
        }

        if (layoutSaveState?.hash !== current.id) {
          if (templateMetadata.isDevMode && !templateMetadata.devOverride) {
            devLogger.logFunc("sendDevSaveStateData");
            sendDevSaveStateData({
              payload: {
                devSaveStateData: JSON.stringify(current.state.data),
              },
            });
          } else {
            devLogger.logFunc("saveLayoutSaveState");
            saveLayoutSaveState({
              payload: {
                hash: current.id,
                history: JSON.stringify({
                  data: current.state.data,
                  ui: current.state.ui,
                }),
              },
            });
          }
        }
      }
    },
    [
      templateMetadata,
      buildVisualConfigLocalStorageKey,
      layoutSaveState,
      saveLayoutSaveState,
    ]
  );

  const handleClearLocalChanges = () => {
    clearHistory();
    historyIndex.current = 0;
  };

  const handlePublishLayout = async (data: Data) => {
    publishLayout({
      payload: { layoutData: JSON.stringify(data) },
    });
  };

  const handleSendLayoutForApproval = async (data: Data, comment: string) => {
    sendLayoutForApproval({
      payload: {
        layoutData: JSON.stringify(data),
        comment: comment,
      },
    });
  };

  const change = async () => {
    if (isLoading) {
      return;
    }
    if (!canEdit) {
      setCanEdit(true);
      return;
    }
  };

  const translatedPuckConfigWithRootFields = React.useMemo(() => {
    const translatedComponents: Config["components"] = {};
    Object.entries(puckConfig.components).forEach(
      ([componentKey, component]) => {
        translatedComponents[componentKey] = {
          ...component,
          label: pt(component.label ?? ""),
        };
      }
    );

    translatedComponents["AdvancedSettings"] = {
      ...AdvancedSettings,
      label: pt("advancedSettings", "Advanced Settings"),
    };

    translatedComponents["PageSettings"] = {
      label: pt("page", "Page"),
      fields: {},
      defaultProps: {
        data: { title: "Page Settings" },
      },
      render: () => <></>,
    };

    return {
      categories: puckConfig.categories,
      components: translatedComponents,
      root: {
        ...puckConfig.root,
        fields: {
          title: YextEntityFieldSelector<any, string>({
            label: msg("fields.metaTitle", "Meta Title"),
            filter: {
              types: ["type.string"],
            },
          }),
          description: YextEntityFieldSelector<any, string>({
            label: msg("fields.metaDescription", "Meta Description"),
            filter: {
              types: ["type.string"],
            },
          }),
          ...puckConfig.root?.fields,
          __advancedSettingsLink: createAdvancedSettingsLink(),
        },
        defaultProps: {
          title: {
            field: "name",
            constantValue: "",
            constantValueEnabled: false,
          },
          description: {
            field: "description",
            constantValue: "",
            constantValueEnabled: false,
          },
          schemaMarkup: "",
          ...puckConfig.root?.defaultProps,
          __advancedSettingsLink: null,
        },
      },
    } as Config;
  }, [puckConfig, i18n.language]);

  // Resolve all data and slots when the document changes
  // Implemented as an override so that the getPuck hook is available
  const reloadDataOnDocumentChange = React.useCallback(
    (props: { children: React.ReactNode }): React.ReactElement => {
      const getPuck = useGetPuck();

      React.useEffect(() => {
        const resolveData = async () => {
          devLogger.logFunc("reloadDataOnDocumentChange");
          const { appState, config, dispatch } = getPuck();

          const resolvedData = await resolveAllData(appState.data, config, {
            streamDocument,
          });

          devLogger.logData("RESOLVED_LAYOUT_DATA", resolvedData);

          if (isDeepEqual(appState.data, resolvedData)) {
            devLogger.log(
              "reloadDataOnDocumentChange - no layout changes detected"
            );
            return;
          }

          dispatch({ type: "setData", data: resolvedData });
        };

        resolveData();
      }, [streamDocument]);

      return <>{props.children}</>;
    },
    [streamDocument]
  );

  // Prevent setPointerCapture errors by wrapping the native method, this is a workaround for a bug in the Puck library where the pointer gets stuck in a drag state when it is no longer active.
  React.useEffect(() => {
    const originalSetPointerCapture = Element.prototype.setPointerCapture;
    let failedCaptureAttempts = new Set<number>();

    // Wrap setPointerCapture to handle cases where the pointer is no longer active
    Element.prototype.setPointerCapture = function (pointerId: number): void {
      try {
        originalSetPointerCapture.call(this, pointerId);
        failedCaptureAttempts.delete(pointerId);
      } catch (error) {
        // If it's a NotFoundError (pointer no longer active), handle it gracefully
        if (error instanceof DOMException && error.name === "NotFoundError") {
          failedCaptureAttempts.add(pointerId);

          // Reset Puck's drag state by dispatching pointer events
          setTimeout(() => {
            const cancelEvent = new PointerEvent("pointercancel", {
              bubbles: true,
              cancelable: true,
              pointerId: pointerId,
            });
            this.dispatchEvent(cancelEvent);

            const upEvent = new PointerEvent("pointerup", {
              bubbles: true,
              cancelable: true,
              pointerId: pointerId,
            });

            this.dispatchEvent(upEvent);
            document.dispatchEvent(cancelEvent);
            document.dispatchEvent(upEvent);
          }, 0);

          return;
        }
        throw error;
      }
    };

    // Global listeners to detect and reset stuck drag states
    const handleGlobalPointerUp = (event: PointerEvent) => {
      if (failedCaptureAttempts.has(event.pointerId)) {
        failedCaptureAttempts.delete(event.pointerId);
        const cancelEvent = new PointerEvent("pointercancel", {
          bubbles: true,
          cancelable: true,
          pointerId: event.pointerId,
        });
        document.dispatchEvent(cancelEvent);
      }
    };

    const handleMouseDown = () => {
      if (failedCaptureAttempts.size > 0) {
        failedCaptureAttempts.forEach((pointerId) => {
          const cancelEvent = new PointerEvent("pointercancel", {
            bubbles: true,
            cancelable: true,
            pointerId: pointerId,
          });
          document.dispatchEvent(cancelEvent);
        });
        failedCaptureAttempts.clear();
      }
    };

    document.addEventListener("pointerup", handleGlobalPointerUp, true);
    document.addEventListener("pointercancel", handleGlobalPointerUp, true);
    document.addEventListener("mousedown", handleMouseDown, true);

    return () => {
      Element.prototype.setPointerCapture = originalSetPointerCapture;
      document.removeEventListener("pointerup", handleGlobalPointerUp, true);
      document.removeEventListener(
        "pointercancel",
        handleGlobalPointerUp,
        true
      );
      document.removeEventListener("mousedown", handleMouseDown, true);
    };
  }, []);

  return (
    <EntityTooltipsProvider>
      <Puck
        config={translatedPuckConfigWithRootFields}
        data={{}} // we use puckInitialHistory instead
        initialHistory={puckInitialHistory}
        onChange={change}
        plugins={[
          { ...blocks, label: pt("sections", "Sections") },
          outline,
          ...(aiPlugin ? [aiPlugin] : []),
        ]}
        overrides={{
          fields: fieldsOverride,
          header: () => (
            <LayoutHeader
              templateMetadata={templateMetadata}
              onClearLocalChanges={handleClearLocalChanges}
              onHistoryChange={handleHistoryChange}
              onPublishLayout={handlePublishLayout}
              onSendLayoutForApproval={handleSendLayoutForApproval}
              localDev={localDev}
              hasErrors={errorCount > 0}
            />
          ),
          iframe: loadMapboxIntoIframe,
          fieldTypes: {
            array: TranslatePuckArrayFieldLabels,
            number: TranslatePuckFieldLabels,
            object: TranslatePuckFieldLabels,
            radio: TranslatePuckFieldLabels,
            select: TranslatePuckFieldLabels,
            text: TranslatePuckFieldLabels,
            textarea: TranslatePuckFieldLabels,
          },
          actionBar: ({ children, label }) => {
            const getPuck = useGetPuck();
            const { appState } = getPuck();
            const itemSelectorState = usePuck(
              (s) => s.appState.ui.itemSelector
            );

            React.useEffect(removeDuplicateActionBars, [itemSelectorState]);

            const isAdvancedSettingsSelected =
              appState?.ui?.itemSelector &&
              appState.ui.itemSelector.zone === "root:advanced";

            if (isAdvancedSettingsSelected) {
              return <></>;
            }

            const copyToClipboard = () => {
              const { appState, getItemBySelector } = getPuck();

              if (!appState.ui.itemSelector) {
                return;
              }

              const selectedComponent = getItemBySelector(
                appState.ui.itemSelector
              );
              navigator.clipboard.writeText(
                JSON.stringify(selectedComponent, null, 2)
              );
            };

            const pasteFromClipboard = async () => {
              const { appState, dispatch, getItemBySelector } = getPuck();

              if (
                !appState?.ui?.itemSelector?.zone ||
                appState?.ui?.itemSelector?.index === undefined
              ) {
                return;
              }

              const selectedComponent = getItemBySelector({
                index: appState.ui.itemSelector?.index,
                zone: appState.ui.itemSelector?.zone,
              });

              if (!selectedComponent) {
                return;
              }

              try {
                const rawClipboardText = await navigator.clipboard.readText();
                const pastedData = JSON.parse(rawClipboardText);
                if (
                  !pastedData.props ||
                  !pastedData.type ||
                  pastedData.type !== selectedComponent?.type
                ) {
                  alert(
                    pt(
                      "failedToPasteComponentInvalidData",
                      "Failed to paste: Invalid component data."
                    )
                  );
                  return;
                }

                // If the pasted data has children, we need to generate new ids for them
                const newData = walkTree(pastedData, puckConfig, (contents) =>
                  contents.map((item: ComponentDataOptionalId) => {
                    const id = `${item.type}-${uuidv4()}`;
                    // oxlint-disable-next-line no-unused-vars
                    const { id: _, parentData: __, ...rest } = item.props;

                    // CardsWrappers need to have their children's ids preserved in the constantValue array
                    if (item.type.includes("CardsWrapper")) {
                      if (
                        "data" in rest &&
                        "constantValue" in rest.data &&
                        "slots" in rest &&
                        "CardSlot" in rest.slots
                      ) {
                        const constantValue = rest.data.constantValue;
                        if (
                          Array.isArray(constantValue) &&
                          constantValue.every(
                            (cv: unknown) =>
                              typeof cv === "object" && cv && "id" in cv
                          )
                        ) {
                          constantValue.forEach((cv, i) => {
                            cv.id =
                              rest?.slots?.CardSlot[i]?.props?.id || cv.id;
                          });
                        }
                      }
                    }

                    return {
                      ...item,
                      props: { ...rest, id },
                    };
                  })
                );
                // preserve the selected component's id and type
                newData.props.id = selectedComponent.props.id;

                devLogger.logData("PASTED_DATA", newData);
                dispatch({
                  type: "replace",
                  destinationZone: appState.ui.itemSelector.zone,
                  destinationIndex: appState.ui.itemSelector.index,
                  data: newData,
                });
              } catch (_) {
                alert(
                  pt(
                    "failedToPasteComponentInvalidData",
                    "Failed to paste: Invalid component data."
                  )
                );
              }
            };

            const additionalActions = (
              <>
                <ActionBar.Action
                  label={pt("actions.copyToClipboard", "Copy to Clipboard")}
                  onClick={copyToClipboard}
                >
                  <ClipboardCopyIcon size={16} />
                </ActionBar.Action>
                <ActionBar.Action
                  label={pt(
                    "actions.pasteFromClipboard",
                    "Paste from Clipboard"
                  )}
                  onClick={pasteFromClipboard}
                >
                  <ClipboardPasteIcon size={16} />
                </ActionBar.Action>
              </>
            );

            return (
              <ActionBar label={label}>
                <ActionBar.Group>
                  {additionalActions}
                  {children}
                </ActionBar.Group>
              </ActionBar>
            );
          },
          // oxlint-disable-next-line no-unused-vars removed all icons from all field labels
          fieldLabel: ({ icon, children, ...rest }) => (
            <FieldLabel {...rest}>{children}</FieldLabel>
          ),
          puck: reloadDataOnDocumentChange,
        }}
        metadata={metadata}
      />
    </EntityTooltipsProvider>
  );
};

// TranslatePuckFieldLabels recursively walks the React component tree
// created by Puck fields and replaces labels with their translations.
const TranslatePuckFieldLabels = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const replaceText = (child: React.ReactNode): React.ReactNode => {
    if (React.isValidElement(child)) {
      if (typeof child.props.children === "string") {
        return React.cloneElement(
          child as React.ReactElement<{
            children?: React.ReactNode;
          }>,
          {
            ...child.props,
            children: pt(child.props.children),
          }
        );
      }

      if ("label" in child.props || "title" in child.props) {
        const newChildren = {
          ...child.props,
          children: React.Children.map(child.props.children, replaceText),
          label: child.props.label ? pt(child.props.label) : undefined,
          title: child.props.title ? pt(child.props.title) : undefined,
        };

        // Radio and Select options need to be translated as well
        if (
          child.props.field?.type === "radio" ||
          child.props.field?.type === "select"
        ) {
          const originalField = child.props.field;
          const originalOptions = originalField.options || [];

          const translatedOptions = originalOptions.map((option: any) => ({
            ...option,
            label: pt(option.label),
          }));

          newChildren.field = {
            ...originalField,
            options: translatedOptions,
          };
        }

        return React.cloneElement(
          child as React.ReactElement<{
            children?: React.ReactNode;
          }>,
          newChildren
        );
      } else {
        return React.cloneElement(
          child as React.ReactElement<{ children?: React.ReactNode }>,
          {
            children: React.Children.map(child.props.children, replaceText),
          }
        );
      }
    }

    return child;
  };

  return <>{React.Children.map(children, replaceText)}</>;
};

// Array fields are mostly handled by the children
// field types but need an override for the array label.
const TranslatePuckArrayFieldLabels = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      label: pt(children.props.label),
    });
  }
};
