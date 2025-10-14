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
} from "@measured/puck";
import React from "react";
import { useState, useRef, useCallback } from "react";
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
import { FaArrowLeft } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { Metadata } from "../../editor/Editor.tsx";
import { AdvancedSettings } from "./AdvancedSettings.tsx";
import { cn } from "../../utils/cn.ts";

const devLogger = new DevLogger();

// Advanced Settings link configuration
const createAdvancedSettingsLink = () => ({
  type: "custom" as const,
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
  const [clearLocalChangesModalOpen, setClearLocalChangesModalOpen] =
    useState<boolean>(false);
  const historyIndex = useRef<number>(0);
  const { i18n } = usePlatformTranslation();

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

        if (layoutSaveState?.hash !== histories[index].id) {
          if (templateMetadata.isDevMode && !templateMetadata.devOverride) {
            devLogger.logFunc("sendDevSaveStateData");
            sendDevSaveStateData({
              payload: {
                devSaveStateData: JSON.stringify(histories[index].state.data),
              },
            });
          } else {
            devLogger.logFunc("saveLayoutSaveState");
            saveLayoutSaveState({
              payload: {
                hash: histories[index].id,
                history: JSON.stringify({
                  data: histories[index].state.data,
                  ui: histories[index].state.ui,
                }),
              },
            });
          }
        }
      }
    },
    [templateMetadata, buildVisualConfigLocalStorageKey, layoutSaveState]
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

  return (
    <EntityTooltipsProvider>
      <Puck
        config={translatedPuckConfigWithRootFields}
        data={{}} // we use puckInitialHistory instead
        initialHistory={puckInitialHistory}
        onChange={change}
        overrides={{
          fields: ({ children }) => {
            const getPuck = useGetPuck();
            const { appState } = getPuck();

            const isAdvancedSettingsSelected =
              appState?.ui?.itemSelector &&
              appState.ui.itemSelector.zone === "root:advanced";

            if (isAdvancedSettingsSelected) {
              const advancedSettingsField = AdvancedSettings.fields?.data;

              if (
                advancedSettingsField &&
                advancedSettingsField.type === "object" &&
                advancedSettingsField.objectFields?.schemaMarkup
              ) {
                const schemaField = advancedSettingsField.objectFields
                  .schemaMarkup as any;

                if (schemaField.type === "custom" && schemaField.render) {
                  return (
                    <div className="ve-p-4 ve-mb-4">
                      {/* Title */}
                      <div className="ve-mb-4">
                        <div className="ve-text-md ve-font-semibold ve-text-gray-900 ve-mb-2">
                          {pt("advancedSettings", "Advanced Settings")}
                        </div>
                      </div>

                      {/* Schema markup field */}
                      {React.createElement(schemaField.render, {
                        onChange: (newValue: string) => {
                          const { dispatch } = getPuck();
                          dispatch({
                            type: "replaceRoot",
                            root: {
                              ...appState.data.root,
                              props: {
                                ...appState.data.root?.props,
                                schemaMarkup: newValue,
                              } as any,
                            },
                          });
                        },
                        value: appState.data.root?.props?.schemaMarkup || "",
                        field: { label: msg("schemaMarkup", "Schema Markup") },
                      })}

                      {/* Back button */}
                      <div className="ve-mt-4">
                        <button
                          onClick={() => {
                            const { dispatch } = getPuck();
                            dispatch({
                              type: "setUi",
                              ui: {
                                ...appState.ui,
                                itemSelector: null,
                                rightSideBarVisible: true,
                              },
                            });
                          }}
                          className="ve-flex ve-items-center ve-gap-2 ve-text-sm ve-text-blue-600 hover:ve-text-blue-800 ve-bg-none ve-border-none ve-cursor-pointer ve-p-0"
                        >
                          <FaArrowLeft className="ve-w-4 ve-h-4" />
                          {pt("back", "Back")}
                        </button>
                      </div>
                    </div>
                  );
                }
              }
            }

            return <>{children}</>;
          },
          header: () => (
            <LayoutHeader
              templateMetadata={templateMetadata}
              clearLocalChangesModalOpen={clearLocalChangesModalOpen}
              setClearLocalChangesModalOpen={setClearLocalChangesModalOpen}
              onClearLocalChanges={handleClearLocalChanges}
              onHistoryChange={handleHistoryChange}
              onPublishLayout={handlePublishLayout}
              onSendLayoutForApproval={handleSendLayoutForApproval}
              isDevMode={templateMetadata.isDevMode}
              localDev={localDev}
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
                  alert("Failed to paste: Invalid component data.");
                  return;
                }

                // If the pasted data has children, we need to generate new ids for them
                const newData = walkTree(pastedData, puckConfig, (contents) =>
                  contents.map((item: ComponentDataOptionalId) => {
                    const id = `${item.type}-${uuidv4()}`;
                    // oxlint-disable-next-line no-unused-vars
                    const { id: _, parentData: __, ...rest } = item.props;

                    return {
                      ...item,
                      props: { ...rest, id },
                    };
                  })
                );
                // preserve the selected component's id and type
                newData.props.id = selectedComponent.props.id;

                dispatch({
                  type: "replace",
                  destinationZone: appState.ui.itemSelector.zone,
                  destinationIndex: appState.ui.itemSelector.index,
                  data: newData,
                });
              } catch (_) {
                alert("Failed to paste: Invalid component data.");
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
