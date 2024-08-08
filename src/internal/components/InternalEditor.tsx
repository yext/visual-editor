import { Puck, Data, Config, usePuck, type History } from "@measured/puck";
import React from "react";
import { customHeader } from "../puck/components/Header.tsx";
import { useState, useRef, useCallback } from "react";
import { getLocalStorageKey } from "../utils/localStorageHelper.ts";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { EntityFieldProvider } from "../../components/EntityField.tsx";
import { SaveState } from "../types/saveState.ts";
import { PuckInitialHistory } from "../../components/Editor.tsx";

interface InternalEditorProps {
  puckConfig: Config;
  puckData: any; // json object
  puckInitialHistory: PuckInitialHistory;
  isLoading: boolean;
  clearHistory: (
    isDevMode: boolean,
    role: string,
    templateId: string,
    layoutId?: number,
    entityId?: number
  ) => void;
  templateMetadata: TemplateMetadata;
  saveState: SaveState;
  saveSaveState: (data: any) => void;
  saveVisualConfigData: (data: any) => void;
  sendDevSaveStateData: (data: any) => void;
}

// Render Puck editor
export const InternalEditor = ({
  puckConfig,
  puckData,
  puckInitialHistory,
  isLoading,
  clearHistory,
  templateMetadata,
  saveState,
  saveSaveState,
  saveVisualConfigData,
  sendDevSaveStateData,
}: InternalEditorProps) => {
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const historyIndex = useRef<number>(-1);

  /**
   * When the Puck history changes save it to localStorage and send a message
   * to the parent which saves the state to the VES database.
   */
  const handleHistoryChange = useCallback(
    (histories: History[], index: number) => {
      if (
        index !== -1 &&
        historyIndex.current !== index &&
        histories.length > 0
      ) {
        historyIndex.current = index;

        window.localStorage.setItem(
          getLocalStorageKey(
            templateMetadata.isDevMode,
            templateMetadata.role,
            templateMetadata.templateId,
            templateMetadata.layoutId,
            templateMetadata.entityId
          ),
          JSON.stringify(histories)
        );

        if (saveState?.hash !== histories[index].id) {
          if (templateMetadata.isDevMode) {
            sendDevSaveStateData({
              payload: {
                devSaveStateData: JSON.stringify(histories[index].data?.data),
              },
            });
          } else {
            saveSaveState({
              payload: {
                hash: histories[index].id,
                history: JSON.stringify(histories[index].data),
              },
            });
          }
        }
      }
    },
    [templateMetadata, getLocalStorageKey]
  );

  const handleClearLocalChanges = () => {
    clearHistory(
      templateMetadata.isDevMode,
      templateMetadata.role,
      templateMetadata.templateId,
      templateMetadata.layoutId,
      templateMetadata.entityId
    );
  };

  const handleSave = async (data: Data) => {
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
        data={
          (puckData as Partial<Data>) ?? { root: {}, content: [], zones: {} }
        }
        initialHistory={puckInitialHistory}
        onChange={change}
        overrides={{
          header: () => {
            const { appState } = usePuck();
            return customHeader(
              handleClearLocalChanges,
              handleHistoryChange,
              appState.data,
              handleSave,
              templateMetadata.isDevMode
            );
          },
        }}
      />
    </EntityFieldProvider>
  );
};