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
  visualConfigurationData: any;
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
  visualConfigurationData,
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
    [templateMetadata, getLocalStorageKey, saveState]
  );

  const handleClearLocalChanges = () => {
    clearHistory(
      templateMetadata.isDevMode,
      templateMetadata.role,
      templateMetadata.templateId,
      templateMetadata.layoutId,
      templateMetadata.entityId
    );
    historyIndex.current = -1;
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

  /**
   * Explanation for Puck `data` and `initialHistory`:
   *  Let's say there are two changes, one is "committed" to Content called C, and one is the saveState WIP called W.
   *  Puck data = [W]
   *  initialHistories = [C, W] index at W
   *  Ideally we can undo such that C is what shows at index -1, but because data starts at W we end up with W -> C -> W.
   *  If we start data at C, then initial render shows C, but we want to render W.
   *  To overcome this, we limit the undo history to index 0 in Header.tsx.
   */
  return (
    <EntityFieldProvider>
      <Puck
        config={puckConfig}
        data={
          (puckInitialHistory.histories[puckInitialHistory.index]
            .data as Partial<Data>) ?? {
            root: {},
            content: [],
            zones: {},
          }
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
              visualConfigurationData,
              handleSave,
              templateMetadata.isDevMode
            );
          },
        }}
      />
    </EntityFieldProvider>
  );
};
