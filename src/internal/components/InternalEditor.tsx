import { Puck, Data, Config, usePuck, type History } from "@measured/puck";
import React from "react";
import { customHeader } from "../puck/components/Header.tsx";
import { useState, useRef, useCallback } from "react";
import { getLocalStorageKey } from "../utils/localStorageHelper.ts";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { EntityFieldProvider } from "../../components/EntityField.tsx";
import { SaveState } from "../types/saveState.ts";
import { PuckInitialHistory } from "../../components/Editor.tsx";
import { DevLogger } from "../../utils/devLogger.ts";

interface InternalEditorProps {
  puckConfig: Config;
  puckInitialHistory: PuckInitialHistory;
  isLoading: boolean;
  clearHistory: () => void;
  templateMetadata: TemplateMetadata;
  saveState: SaveState;
  saveSaveState: (data: any) => void;
  saveVisualConfigData: (data: any) => void;
  sendDevSaveStateData: (data: any) => void;
  visualConfigurationData: any;
  buildLocalStorageKey: () => string;
  devLogger: DevLogger;
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
  buildLocalStorageKey,
  devLogger,
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
                devSaveStateData: JSON.stringify(histories[index].data?.data),
              },
            });
          } else {
            devLogger.logFunc("saveSaveState");
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
    clearHistory();
    historyIndex.current = -1;
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
          (puckInitialHistory.histories[puckInitialHistory.index].data
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
              templateMetadata.isDevMode && !templateMetadata.devOverride
            );
          },
        }}
      />
    </EntityFieldProvider>
  );
};
