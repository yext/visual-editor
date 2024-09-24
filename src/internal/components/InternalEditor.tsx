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
import { resolveProp } from "../../utils/resolveProp.ts";

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
  buildLocalStorageKey: () => string;
  devLogger: DevLogger;
  document: any;
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
  buildLocalStorageKey,
  devLogger,
  document,
}: InternalEditorProps) => {
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const historyIndex = useRef<number>(0);

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
  };

  const handleSave = async (data: Data) => {
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

  const EntityFieldResolver = ({ children }: { children: React.ReactNode }) => {
    const { appState } = usePuck();
    useEffect(() => {
      resolveEntityFieldData(appState.data, document);
    }, [appState, document]);
    return children;
  };

  const resolveEntityFieldData = async (data: Data, document: any) => {
    data.content.forEach((component) => {
      Object.entries(component.props).forEach(
        ([propName, prop]: [string, any]) => {
          Object.entries(prop).forEach(
            ([fieldName, fieldValue]: [string, any]) => {
              if (fieldName !== "entityField") {
                return;
              }
              if (!component.readOnly) {
                component.readOnly = {};
              }

              if (fieldValue.name === "") {
                component.readOnly[propName + ".entityField"] = false;
              } else {
                fieldValue.value = resolveProp(document, fieldValue.name);
                component.readOnly[propName + ".entityField"] = true;
              }
            }
          );
        }
      );
    });
  };

  return (
    <EntityFieldProvider>
      <Puck
        config={puckConfig}
        data={{}} // we use puckInitialHistory instead
        initialHistory={puckInitialHistory}
        onChange={change}
        overrides={{
          puck: ({ children }) => (
            <EntityFieldResolver>{children}</EntityFieldResolver>
          ),
          header: () => {
            const { appState } = usePuck();
            return customHeader(
              handleClearLocalChanges,
              handleHistoryChange,
              appState.data,
              puckInitialHistory?.histories[0].state.data, // used for clearing local changes - reset to first puck history
              handleSave,
              templateMetadata.isDevMode && !templateMetadata.devOverride
            );
          },
        }}
      />
    </EntityFieldProvider>
  );
};
