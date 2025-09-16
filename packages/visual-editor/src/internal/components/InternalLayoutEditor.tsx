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
import { v4 as uuidv4 } from "uuid";
import { Metadata } from "../../editor/Editor.tsx";
import { Link } from "@yext/pages-components";
import { AdvancedSettings } from "./AdvancedSettings.tsx";

const devLogger = new DevLogger();

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
  const [canEdit, setCanEdit] = useState<boolean>(false);
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

    // Add the Advanced Settings component back
    translatedComponents["AdvancedSettings"] = {
      ...AdvancedSettings,
      label: pt("advancedSettings", "Advanced Settings"),
    };

    // Add a PageSettings component that will act as parent for breadcrumbs
    translatedComponents["PageSettings"] = {
      label: pt("page", "Page"),
      fields: {},
      defaultProps: {
        data: { title: "Page Settings" },
      },
      render: () => <div style={{ display: "none" }} />, // Hidden component
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
          // Add advanced settings link as a custom field
          __advancedSettingsLink: {
            type: "custom",
            render: () => {
              const getPuck = useGetPuck();

              return (
                <div
                  style={{
                    padding: "16px",
                    borderTop: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Advanced Settings link clicked");

                      const { appState, dispatch } = getPuck();

                      // Create a proper component hierarchy for breadcrumbs
                      const advancedSettingsId = `AdvancedSettings-${Date.now()}`;

                      // Create a parent component that will show "Page" in breadcrumb
                      const parentComponent = {
                        type: "PageSettings",
                        props: {
                          id: `PageSettings-${Date.now()}`,
                          data: { title: "Page Settings" },
                        },
                      };

                      // Create the AdvancedSettings component as a child
                      const advancedSettingsComponent = {
                        type: "AdvancedSettings",
                        props: {
                          id: advancedSettingsId,
                          data: { schemaMarkup: "" },
                        },
                      };

                      // Add both components to the content
                      const newData = {
                        ...appState.data,
                        content: [
                          ...(appState.data.content || []),
                          parentComponent,
                          advancedSettingsComponent,
                        ],
                        // Create a zone for the AdvancedSettings under the parent
                        zones: {
                          ...appState.data.zones,
                          [`${parentComponent.props.id}:advanced`]: [
                            advancedSettingsComponent,
                          ],
                        },
                      };

                      dispatch({ type: "setData", data: newData });

                      // Select the AdvancedSettings component
                      setTimeout(() => {
                        dispatch({
                          type: "setUi",
                          ui: {
                            ...appState.ui,
                            itemSelector: {
                              zone: `${parentComponent.props.id}:advanced`,
                              index: 0,
                            },
                            rightSideBarVisible: true,
                          },
                        });
                        console.log(
                          "Advanced Settings created with proper hierarchy"
                        );
                      }, 100);
                    }}
                    style={{
                      color: "#3b82f6",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {pt("advancedSettings", "Advanced Settings")}
                  </Link>
                </div>
              );
            },
          },
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
          ...puckConfig.root?.defaultProps,
          __advancedSettingsLink: null,
        },
      },
    } as Config;
  }, [puckConfig, i18n.language]);

  // Set up the translation effect
  React.useEffect(() => {
    const translatePuckSidebars = () => {
      // Translate the static left sidebar titles
      const leftSideBarTitles = document.querySelectorAll<HTMLElement>(
        "[class*='PuckLayout-leftSideBar'] h2[class*='_Heading']"
      );
      if (leftSideBarTitles[0]) {
        leftSideBarTitles[0].innerText = pt(
          "components.components",
          "Components"
        );
      }
      if (leftSideBarTitles[1]) {
        leftSideBarTitles[1].innerText = pt("outline", "Outline");
      }

      // Translate the component category labels
      const componentCategoryTitles = document.querySelectorAll<HTMLElement>(
        "button[class*='ComponentList-title'] > div"
      );
      if (componentCategoryTitles?.length) {
        componentCategoryTitles.forEach((title) => {
          if (title.innerText === "PAGE SECTIONS") {
            title.innerText = pt("categories.pageSections", "PAGE SECTIONS");
          } else if (title.innerText === "OTHER") {
            title.innerText = pt("categories.other", "OTHER");
          }
        });
      }

      // Handle dynamic translation of right sidebar
      const rightSidebar = document.querySelector(
        "[class*='PuckLayout-rightSideBar']"
      );
      if (!rightSidebar) {
        return;
      }

      const observer = new MutationObserver(() => {
        // Translate main heading
        const fieldListSingleTitle = document.querySelector<HTMLElement>(
          "[class*='PuckLayout-rightSideBar'] div[class*='_SidebarSection-heading']:first-child > h2"
        );
        if (fieldListSingleTitle) {
          const currentText = fieldListSingleTitle.innerText;
          if (currentText === "Page" && currentText !== pt("page", "Page")) {
            fieldListSingleTitle.innerText = pt("page", "Page");
          } else if (
            currentText === "Advanced Settings" &&
            currentText !== pt("advancedSettings", "Advanced Settings")
          ) {
            fieldListSingleTitle.innerText = pt(
              "advancedSettings",
              "Advanced Settings"
            );
          }
        }

        // Translate any existing Puck breadcrumb button text
        const breadcrumbButton = document.querySelector<HTMLElement>(
          "[class*='PuckLayout-rightSideBar'] div[class*='_SidebarSection-breadcrumb'] button"
        );
        if (breadcrumbButton) {
          const buttonText = breadcrumbButton.innerText.trim();
          if (buttonText === "Page") {
            breadcrumbButton.innerText = pt("page", "Page");
          } else if (buttonText === "Advanced Settings") {
            breadcrumbButton.innerText = pt(
              "advancedSettings",
              "Advanced Settings"
            );
          } else if (buttonText.includes(" > ")) {
            // Handle breadcrumb chains like "Page > Advanced Settings"
            const parts = buttonText.split(" > ");
            const translatedParts = parts.map((part) => {
              if (part.trim() === "Page") {
                return pt("page", "Page");
              } else if (part.trim() === "Advanced Settings") {
                return pt("advancedSettings", "Advanced Settings");
              }
              return part;
            });
            breadcrumbButton.innerText = translatedParts.join(" > ");
          }
        }

        // Puck's native breadcrumb system will handle the breadcrumbs automatically
      });

      observer.observe(rightSidebar, {
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
      };
    };

    return translatePuckSidebars();
  }, [i18n.language]);

  return (
    <EntityTooltipsProvider>
      <Puck
        config={translatedPuckConfigWithRootFields}
        data={{}}
        initialHistory={puckInitialHistory}
        onChange={change}
        overrides={{
          fields: ({ children }) => {
            const getPuck = useGetPuck();
            const { appState } = getPuck();

            // Check if AdvancedSettings component is selected in the proper hierarchy
            const isAdvancedSettingsSelected =
              appState?.ui?.itemSelector &&
              appState.ui.itemSelector.zone?.includes(":advanced") &&
              appState.ui.itemSelector.zone !== "root";

            console.log(
              "Fields override - isAdvancedSettingsSelected:",
              isAdvancedSettingsSelected
            );
            console.log(
              "Fields override - current selection:",
              appState?.ui?.itemSelector
            );
            console.log(
              "Fields override - selected component:",
              appState?.ui?.itemSelector
                ? appState.data.content?.[appState.ui.itemSelector.index]
                : null
            );

            if (isAdvancedSettingsSelected) {
              console.log("Rendering Advanced Settings fields");
              return (
                <div style={{ padding: "16px" }}>
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      {pt("schemaMarkup", "Schema Markup")}
                    </label>
                    <textarea
                      style={{
                        width: "100%",
                        minHeight: "120px",
                        padding: "8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontFamily: "monospace",
                      }}
                      placeholder="Enter JSON-LD schema markup..."
                    />
                  </div>
                </div>
              );
            }

            return (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
              </div>
            );
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

                const newData = walkTree(pastedData, puckConfig, (contents) =>
                  contents.map((item: ComponentDataOptionalId) => {
                    const id = `${item.type}-${uuidv4()}`;
                    return {
                      ...item,
                      props: { ...item.props, id },
                    };
                  })
                );
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
        }}
        metadata={metadata}
      />
    </EntityTooltipsProvider>
  );
};

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
