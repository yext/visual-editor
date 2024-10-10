import {
  Puck,
  Data,
  Config,
  usePuck,
  type History,
  InitialHistory,
} from "@measured/puck";
import React, { useEffect } from "react";
import { customHeader } from "../puck/components/Header.tsx";
import { useState, useRef, useCallback } from "react";
import { getLocalStorageKey } from "../utils/localStorageHelper.ts";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { EntityFieldProvider } from "../../components/EntityField.tsx";
import { SaveState } from "../types/saveState.ts";
import { DevLogger } from "../../utils/devLogger.ts";
import ThemeSidebar from "../puck/components/ThemeSidebar.tsx";
import { ThemeConfig } from "../../utils/themeResolver.ts";

interface InternalEditorProps {
  puckConfig: Config;
  puckInitialHistory: InitialHistory | undefined;
  isLoading: boolean;
  clearHistory: () => void;
  templateMetadata: TemplateMetadata;
  saveState: SaveState;
  saveSaveState: (data: any) => void;
  saveVisualConfigData: (data: any) => void;
  sendDevSaveStateData: (data: any) => void;
  saveThemeData: (data: any) => void;
  buildLocalStorageKey: () => string;
  devLogger: DevLogger;
  themeConfig?: ThemeConfig;
}

// Render Puck editor
export const InternalEditor = ({
  puckConfig,
  puckInitialHistory,
  isLoading,
  clearHistory,
  templateMetadata,
  saveState,
  saveSaveState,
  saveVisualConfigData,
  sendDevSaveStateData,
  saveThemeData,
  buildLocalStorageKey,
  devLogger,
  themeConfig,
}: InternalEditorProps) => {
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const historyIndex = useRef<number>(0);
  const isThemeMode = templateMetadata.isThemeMode;

  /**
   * When the Puck history changes save it to localStorage and send a message
   * to the parent which saves the state to the VES database.
   */
  const handleHistoryChange = useCallback(
    (histories: History[], index: number) => {
      if (
        index !== 0 &&
        historyIndex.current !== index &&
        histories.length > 0
      ) {
        devLogger.logFunc("handleHistoryChange");
        devLogger.logData("PUCK_INDEX", index);
        devLogger.logData("PUCK_HISTORY", histories);
        historyIndex.current = index;

        devLogger.logFunc("saveToLocalStorage");
        window.localStorage.setItem(
          buildLocalStorageKey(),
          JSON.stringify(histories)
        );

        if (saveState?.hash !== histories[index].id) {
          if (templateMetadata.isDevMode && !templateMetadata.devOverride) {
            devLogger.logFunc("sendDevSaveStateData");
            sendDevSaveStateData({
              payload: {
                devSaveStateData: JSON.stringify(histories[index].state.data),
              },
            });
          } else {
            devLogger.logFunc("saveSaveState");
            saveSaveState({
              payload: {
                hash: histories[index].id,
                history: JSON.stringify(histories[index].state),
              },
            });
          }
        }
      }
    },
    [templateMetadata, getLocalStorageKey, saveState]
  );

  const handleClearLocalChanges = () => {
    clearHistory();
    historyIndex.current = 0;
    // TODO: reset theme to published values here
  };

  const handleSaveTheme = () => {
    // TODO: save draft theme here
  };

  const handleSave = async (data: Data) => {
    if (isThemeMode) {
      devLogger.logFunc("saveThemeData");
      saveThemeData({
        payload: { saveThemeData: JSON.stringify(data) }
      })
      return;
    }
    devLogger.logFunc("saveVisualConfigData");
    saveVisualConfigData({
      payload: { visualConfigurationData: JSON.stringify(data) },
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

  return (
    <EntityFieldProvider>
      <Puck
        config={puckConfig}
        data={{}} // we use puckInitialHistory instead
        initialHistory={puckInitialHistory}
        onChange={change}
        overrides={{
          header: () => {
            const { refreshPermissions, config } = usePuck();

            useEffect(() => {
              // set permissions on the component level to allow for dynamic updating
              Object.values(config.components).forEach((component) => {
                component.resolvePermissions = () => {
                  return {
                    drag: !isThemeMode,
                    duplicate: !isThemeMode,
                    delete: !isThemeMode,
                    insert: !isThemeMode,
                    edit: !isThemeMode,
                  };
                };
              });

              const componentList = document.querySelector<HTMLElement>(
                "[class*='PuckLayout-leftSideBar'] > div[class*='SidebarSection--noBorderTop']"
              );
              if (componentList) {
                componentList.style.display = isThemeMode ? "none" : "";
              }
              const fieldListTitle = document.querySelector<HTMLElement>(
                "[class*='PuckLayout-rightSideBar'] > div[class*='SidebarSection--noBorderTop'] > div[class*='SidebarSection-title']"
              );
              if (fieldListTitle) {
                fieldListTitle.style.display = isThemeMode ? "none" : "";
              }

              refreshPermissions();
            }, [isThemeMode]);

            return customHeader(
              handleClearLocalChanges,
              handleHistoryChange,
              handleSave,
              templateMetadata.isDevMode && !templateMetadata.devOverride,
              !!templateMetadata.isThemeMode
            );
          },
          actionBar: isThemeMode ? () => <></> : undefined,
          components: isThemeMode ? () => <></> : undefined,
          fields: isThemeMode
            ? () => (
                <ThemeSidebar
                  themeConfig={themeConfig}
                  saveTheme={handleSaveTheme}
                  savedThemeValues={undefined} // TODO: load theme values into this prop
                />
              )
            : undefined,
        }}
      />
    </EntityFieldProvider>
  );
};
