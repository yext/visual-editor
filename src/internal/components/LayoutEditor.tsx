import React, { useCallback, useEffect, useState } from "react";
import { LoadingScreen } from "../puck/components/LoadingScreen.tsx";
import { InternalLayoutEditor } from "./InternalLayoutEditor.tsx";
import { InitialHistory, Config } from "@measured/puck";
import { LayoutSaveState } from "../types/saveState.ts";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { useMessageSenders } from "../hooks/useMessage.ts";
import { useLocalStorage } from "../hooks/useLocalStorage.ts";
import { DevLogger } from "../../utils/devLogger.ts";
import { jsonFromEscapedJsonString } from "../utils/jsonFromEscapedJsonString.ts";

const devLogger = new DevLogger();

type LayoutEditorProps = {
  puckConfig: Config;
  templateMetadata: TemplateMetadata;
  layoutSaveState: LayoutSaveState | undefined;
  visualConfigurationData: any;
};

export const LayoutEditor = (props: LayoutEditorProps) => {
  const {
    puckConfig,
    templateMetadata,
    layoutSaveState,
    visualConfigurationData,
  } = props;

  const {
    sendDevLayoutSaveStateData,
    saveLayoutSaveState,
    publishVisualConfiguration,
    deleteLayoutSaveState,
  } = useMessageSenders();

  const { buildVisualConfigLocalStorageKey, clearVisualConfigLocalStorage } =
    useLocalStorage(templateMetadata);

  const [puckInitialHistory, setPuckInitialHistory] = useState<
    InitialHistory | undefined
  >();
  const [puckInitialHistoryFetched, setPuckInitialHistoryFetched] =
    useState<boolean>(false);

  /**
   * Clears localStorage and resets the save data in the DB
   */
  const clearHistory = () => {
    devLogger.logFunc("clearHistory");
    clearVisualConfigLocalStorage();
    deleteLayoutSaveState();
  };

  /**
   * Determines the initialHistory to send to Puck. It is based on a combination
   * of localStorage and saveState (from the DB).
   *
   * When in dev mode, only use localStorage if it exists.
   * When NOT dev mode:
   * 1. if no saveState, clear localStorage and use nothing
   * 2. if saveState, find matching hash in localStorage:
   *  - if match, use localStorage with index set to saveState hash
   *  - if no match, use saveState directly and clear localStorage
   */
  const loadPuckInitialHistory = useCallback(() => {
    if (!templateMetadata) {
      return;
    }

    devLogger.logFunc("loadPuckInitialHistory");

    if (templateMetadata.isDevMode && !templateMetadata.devOverride) {
      // Check localStorage for existing Puck history
      const localHistoryArray = window.localStorage.getItem(
        buildVisualConfigLocalStorageKey()
      );

      // Use localStorage directly if it exists
      if (localHistoryArray) {
        devLogger.log("Layout Dev Mode - Using layout data from localStorage");
        const localHistories = JSON.parse(localHistoryArray);
        const localHistoryIndex = localHistories.length - 1;
        setPuckInitialHistory({
          histories: localHistories,
          index: localHistoryIndex,
          appendData: false,
        });
        setPuckInitialHistoryFetched(true);
        return;
      }

      // Otherwise start fresh from Content
      devLogger.log(
        "Layout Dev Mode - No localStorage. Using layout data from Content"
      );
      if (visualConfigurationData) {
        setPuckInitialHistory({
          histories: [{ id: "root", state: { data: visualConfigurationData } }],
          appendData: false,
        });
      }
      setPuckInitialHistoryFetched(true);

      return;
    }

    // Nothing in save_state table, start fresh from Content
    if (!layoutSaveState) {
      clearVisualConfigLocalStorage();

      devLogger.log(
        "Layout Prod Mode - No saveState. Using layout data from Content"
      );
      if (visualConfigurationData) {
        setPuckInitialHistory({
          histories: [{ id: "root", state: { data: visualConfigurationData } }],
          appendData: false,
        });
      }
      setPuckInitialHistoryFetched(true);

      return;
    }

    // Check localStorage for existing Puck history
    const localHistoryArray = window.localStorage.getItem(
      buildVisualConfigLocalStorageKey()
    );

    // No localStorage, start from saveState
    if (!localHistoryArray) {
      devLogger.log(
        "Layout Prod Mode - No localStorage. Using layout saveState"
      );
      setPuckInitialHistory({
        histories: visualConfigurationData
          ? [
              { id: "root", state: { data: visualConfigurationData } },
              {
                id: layoutSaveState.hash,
                state: jsonFromEscapedJsonString(layoutSaveState.history),
              },
            ]
          : [
              {
                id: layoutSaveState.hash,
                state: jsonFromEscapedJsonString(layoutSaveState.history),
              },
            ],
        index: visualConfigurationData ? 1 : 0,
        appendData: false,
      });
      setPuckInitialHistoryFetched(true);
      return;
    }

    const localHistoryIndex = JSON.parse(localHistoryArray).findIndex(
      (item: any) => item.id === layoutSaveState?.hash
    );

    // If local storage reset Puck history to it
    if (localHistoryIndex !== -1) {
      devLogger.log(
        "Layout Prod Mode - Using localStorage visual configuration"
      );
      setPuckInitialHistory({
        histories: JSON.parse(localHistoryArray),
        index: localHistoryIndex,
        appendData: false,
      });
      setPuckInitialHistoryFetched(true);
      return;
    }

    // otherwise start fresh - this user doesn't have localStorage that reflects the saved state
    clearVisualConfigLocalStorage();
  }, [
    setPuckInitialHistory,
    setPuckInitialHistoryFetched,
    clearVisualConfigLocalStorage,
    buildVisualConfigLocalStorageKey,
  ]);

  useEffect(() => {
    loadPuckInitialHistory();
  }, [templateMetadata]);

  // Log PUCK_INITIAL_HISTORY (layout) on load
  useEffect(() => {
    if (puckInitialHistory) {
      devLogger.logData("PUCK_INITIAL_HISTORY", puckInitialHistory);
    }
  }, [puckInitialHistory]);

  // Handles sending the devSaveStateData on initial load so that nothing isn't rendered for preview.
  // Subsequent changes are sent via handleHistoryChange in InternalLayoutEditor.tsx
  useEffect(() => {
    if (!puckInitialHistoryFetched) {
      return;
    }

    const historyToSend =
      puckInitialHistory?.histories[puckInitialHistory.histories.length - 1]
        .state.data;

    devLogger.logFunc("sendDevSaveStateData useEffect");
    sendDevLayoutSaveStateData({
      payload: { devSaveStateData: JSON.stringify(historyToSend) },
    });
  }, [puckInitialHistoryFetched, puckInitialHistory, templateMetadata]);

  const isLoading = !puckInitialHistoryFetched;

  return (
    <>
      {!isLoading ? (
        <InternalLayoutEditor
          puckConfig={puckConfig}
          puckInitialHistory={puckInitialHistory}
          isLoading={isLoading}
          clearHistory={clearHistory}
          templateMetadata={templateMetadata}
          layoutSaveState={layoutSaveState}
          saveLayoutSaveState={saveLayoutSaveState}
          publishVisualConfiguration={publishVisualConfiguration}
          sendDevSaveStateData={sendDevLayoutSaveStateData}
          buildVisualConfigLocalStorageKey={buildVisualConfigLocalStorageKey}
        />
      ) : (
        <LoadingScreen progress={90} />
      )}
    </>
  );
};
