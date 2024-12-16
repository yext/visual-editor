import React, { useCallback, useEffect, useState } from "react";
import { InternalLayoutEditor } from "./InternalLayoutEditor.tsx";
import { InitialHistory, Config, Data } from "@measured/puck";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { useLayoutLocalStorage } from "../hooks/layout/useLocalStorage.ts";
import { DevLogger } from "../../utils/devLogger.ts";
import { useLayoutMessageSenders } from "../hooks/layout/useMessageSenders.ts";
import { useLayoutMessageReceivers } from "../hooks/layout/useMessageReceivers.ts";
import { LoadingScreen } from "../puck/components/LoadingScreen.tsx";
import { ThemeData, ThemeHistory } from "../types/themeData.ts";
import { ThemeConfig } from "../../utils/themeResolver.ts";
import { updateThemeInEditor } from "../../utils/applyTheme.ts";
import { useThemeLocalStorage } from "../hooks/theme/useLocalStorage.ts";
import { useCommonMessageSenders } from "../hooks/useMessageSenders.ts";

const devLogger = new DevLogger();

type LayoutEditorProps = {
  puckConfig: Config;
  templateMetadata: TemplateMetadata;
  layoutData: Data;
  themeData: ThemeData;
  themeConfig: ThemeConfig | undefined;
};

export const LayoutEditor = (props: LayoutEditorProps) => {
  const { puckConfig, templateMetadata, layoutData, themeData, themeConfig } =
    props;

  const {
    saveLayoutSaveState,
    publishLayoutConfiguration,
    deleteLayoutSaveState,
  } = useLayoutMessageSenders();

  const { sendDevLayoutSaveStateData, sendDevThemeSaveStateData } =
    useCommonMessageSenders();

  const { layoutSaveState, layoutSaveStateFetched } =
    useLayoutMessageReceivers();

  const { buildVisualConfigLocalStorageKey, clearVisualConfigLocalStorage } =
    useLayoutLocalStorage(templateMetadata);
  const { buildThemeLocalStorageKey } = useThemeLocalStorage(templateMetadata);

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
   * Apply the themes from Content
   */
  useEffect(() => {
    if (!themeConfig) {
      return;
    }
    const localHistoryArray = window.localStorage.getItem(
      buildThemeLocalStorageKey()
    );

    // use theme from localStorage when in dev mode
    if (templateMetadata.isDevMode && !!localHistoryArray) {
      const localHistories = JSON.parse(localHistoryArray) as ThemeHistory[];
      if (localHistories.length > 0) {
        const localThemeData = localHistories[localHistories.length - 1].data;
        devLogger.log("Layout Dev Mode - Using theme data from local storage");
        sendDevThemeSaveStateData({
          payload: { devThemeSaveStateData: JSON.stringify(localThemeData) },
        });
        updateThemeInEditor(localThemeData, themeConfig);
        return;
      }
    }

    if (themeData) {
      updateThemeInEditor(themeData as ThemeData, themeConfig);
    }
  }, [themeData, themeConfig, templateMetadata]);

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
        const localHistories = JSON.parse(localHistoryArray) as History[];
        const localHistoryIndex = localHistories.length - 1;
        setPuckInitialHistory({
          // @ts-expect-error https://github.com/measuredco/puck/issues/673
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
      if (layoutData) {
        setPuckInitialHistory({
          histories: [{ id: "root", state: { data: layoutData } }],
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
      if (layoutData) {
        setPuckInitialHistory({
          histories: [{ id: "root", state: { data: layoutData } }],
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
        histories: layoutData
          ? [
              { id: "root", state: { data: layoutData } },
              {
                id: layoutSaveState.hash,
                state: { data: layoutSaveState.history.data },
              },
            ]
          : [
              {
                id: layoutSaveState.hash,
                state: { data: layoutSaveState.history.data },
              },
            ],
        index: layoutData ? 1 : 0,
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
    if (!layoutSaveStateFetched) {
      return;
    }
    loadPuckInitialHistory();
  }, [templateMetadata, layoutSaveStateFetched]);

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

  const isLoading = !puckInitialHistoryFetched || !layoutSaveStateFetched;
  const progress = // @ts-expect-error adding bools is fine
    60 + (puckInitialHistoryFetched + layoutSaveStateFetched) * 20;

  return !isLoading ? (
    <InternalLayoutEditor
      puckConfig={puckConfig}
      puckInitialHistory={puckInitialHistory}
      isLoading={isLoading}
      clearHistory={clearHistory}
      templateMetadata={templateMetadata}
      layoutSaveState={layoutSaveState}
      saveLayoutSaveState={saveLayoutSaveState}
      publishLayoutConfiguration={publishLayoutConfiguration}
      sendDevSaveStateData={sendDevLayoutSaveStateData}
      buildVisualConfigLocalStorageKey={buildVisualConfigLocalStorageKey}
    />
  ) : (
    <LoadingScreen progress={progress} />
  );
};
