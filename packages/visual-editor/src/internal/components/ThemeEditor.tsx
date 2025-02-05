import React, { useCallback, useEffect, useState } from "react";
import {
  InitialHistory,
  Config,
  Data,
  History,
  AppState,
} from "@measured/puck";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { useThemeLocalStorage } from "../hooks/theme/useLocalStorage.ts";
import { DevLogger } from "../../utils/devLogger.ts";
import { ThemeConfig } from "../../utils/themeResolver.ts";
import { updateThemeInEditor } from "../../utils/applyTheme.ts";
import { InternalThemeEditor } from "./InternalThemeEditor.tsx";
import { useThemeMessageSenders } from "../hooks/theme/useMessageSenders.ts";
import { useThemeMessageReceivers } from "../hooks/theme/useMessageReceivers.ts";
import { LoadingScreen } from "../puck/components/LoadingScreen.tsx";
import { ThemeHistories, ThemeHistory, ThemeData } from "../types/themeData.ts";
import { useLayoutLocalStorage } from "../hooks/layout/useLocalStorage.ts";
import { useCommonMessageSenders } from "../hooks/useMessageSenders.ts";
import * as lzstring from "lz-string";

const devLogger = new DevLogger();

type ThemeEditorProps = {
  puckConfig: Config;
  templateMetadata: TemplateMetadata;
  layoutData: Data;
  themeData: ThemeData;
  themeConfig: ThemeConfig | undefined;
  localDev: boolean;
};

export const ThemeEditor = (props: ThemeEditorProps) => {
  const {
    puckConfig,
    templateMetadata,
    layoutData,
    themeData,
    themeConfig,
    localDev,
  } = props;

  const { sendDevLayoutSaveStateData, sendDevThemeSaveStateData } =
    useCommonMessageSenders();

  const { saveThemeSaveState, publishTheme, deleteThemeSaveState } =
    useThemeMessageSenders();

  const { themeSaveState, themeSaveStateFetched } =
    useThemeMessageReceivers(localDev);

  const { buildThemeLocalStorageKey, clearThemeLocalStorage } =
    useThemeLocalStorage(templateMetadata);
  const { buildVisualConfigLocalStorageKey } =
    useLayoutLocalStorage(templateMetadata);

  const [puckInitialHistory, setPuckInitialHistory] = useState<
    InitialHistory | undefined
  >();
  const [puckInitialHistoryFetched, setPuckInitialHistoryFetched] =
    useState<boolean>(false);
  const [themeHistories, setThemeHistories] = useState<
    ThemeHistories | undefined
  >();
  const [themeHistoryFetched, setThemeHistoryFetched] =
    useState<boolean>(false);

  /**
   * Determines the initialHistory to send to Puck.
   * For theme mode, only load from Content
   */
  const loadPuckInitialHistory = useCallback(() => {
    if (!templateMetadata) {
      return;
    }

    // use layout from localStorage when in dev mode
    if (templateMetadata.isDevMode) {
      devLogger.logFunc("loadPuckInitialHistory");
      const localHistoryArray = lzstring.decompress(
        window.localStorage.getItem(buildVisualConfigLocalStorageKey()) || ""
      );
      const localHistories = (
        localHistoryArray ? JSON.parse(localHistoryArray) : []
      ) as History<AppState>[];
      const localHistoryIndex = localHistories.length - 1;
      if (localHistoryIndex >= 0) {
        devLogger.log("Theme Dev Mode - Using layout data from local storage");
        setPuckInitialHistory({
          // @ts-expect-error https://github.com/measuredco/puck/issues/673
          histories: localHistories.map((h) => {
            // strip ui state
            return { id: h.id, state: { data: { ...h.state.data } } };
          }),
          index: localHistoryIndex,
          appendData: false,
        });
        const layoutToSend =
          puckInitialHistory?.histories[puckInitialHistory.histories.length - 1]
            .state.data;
        sendDevLayoutSaveStateData({
          payload: { devSaveStateData: JSON.stringify(layoutToSend) },
        });
      }
      setPuckInitialHistoryFetched(true);
      return;
    }

    // Only load Content data for theme mode
    if (layoutData) {
      setPuckInitialHistory({
        histories: [{ id: "root", state: { data: layoutData } }],
        appendData: false,
      });
    }

    setPuckInitialHistoryFetched(true);
  }, [setPuckInitialHistory, setPuckInitialHistoryFetched, layoutData]);

  /*
   * Determines the initial theme data to send to the editor.
   * Prod mode: If DB theme_save_state exists, use that. Otherwise, pull from Content
   * Dev mode: If localstorage theme data exists, use that. Otherwise, pull from Content
   */
  const loadThemeHistory = useCallback(() => {
    if (!templateMetadata) {
      return;
    }
    devLogger.logFunc("loadThemeHistory");
    devLogger.logData("THEME_DATA", themeData);
    devLogger.logData("THEME_SAVE_STATE", themeSaveState);

    if (templateMetadata.isDevMode && !templateMetadata.devOverride) {
      // Check localStorage for existing theme history
      const localHistoryArray = lzstring.decompress(
        window.localStorage.getItem(buildThemeLocalStorageKey()) || ""
      );

      // Use localStorage directly if it exists
      if (localHistoryArray) {
        devLogger.log("Theme Dev Mode - Using theme localStorage");
        const localHistories = JSON.parse(localHistoryArray) as ThemeHistory[];
        const localHistoryIndex = localHistories.length - 1;
        setThemeHistories({
          histories: localHistories,
          index: localHistoryIndex,
        });
        setThemeHistoryFetched(true);
        return;
      }

      // Otherwise start fresh from Content
      devLogger.log(
        "Theme Dev Mode - No localStorage. Using theme data from Content"
      );
      if (themeData) {
        setThemeHistories({
          histories: [{ id: "root", data: themeData }],
          index: 0,
        });
      }
      setThemeHistoryFetched(true);
      return;
    }

    // Nothing in theme_save_state table, start fresh from Content
    if (!themeSaveState) {
      devLogger.log(
        "Theme Prod Mode - No saveState. Using theme data from Content"
      );
      if (themeData) {
        setThemeHistories({
          histories: [{ id: "root", data: themeData }],
          index: 0,
        });
      }
      setThemeHistoryFetched(true);

      return;
    }

    // Start from themeSaveState
    devLogger.log("Theme Prod Mode - Using themeSaveState");
    setThemeHistories({
      histories: themeData
        ? [
            { id: "root", data: themeData },
            { id: themeSaveState.hash, data: themeSaveState.history.data },
          ]
        : [{ id: themeSaveState.hash, data: themeSaveState.history.data }],
      index: themeData ? 1 : 0,
    });
    setThemeHistoryFetched(true);
    return;
  }, [
    setThemeHistories,
    setThemeHistoryFetched,
    clearThemeLocalStorage,
    buildThemeLocalStorageKey,
  ]);

  // Log THEME_HISTORIES on load and update theme in editor to reflect save state
  useEffect(() => {
    devLogger.logData("THEME_HISTORIES", themeHistories);
    if (themeHistories && themeConfig) {
      updateThemeInEditor(
        themeHistories.histories[themeHistories.index]?.data as ThemeData,
        themeConfig
      );
    }
  }, [themeHistories, themeConfig]);

  useEffect(() => {
    if (!themeSaveStateFetched) {
      return;
    }
    loadPuckInitialHistory();
    loadThemeHistory();
  }, [templateMetadata, themeSaveStateFetched, layoutData]);

  // Log PUCK_INITIAL_HISTORY (layout) on load
  useEffect(() => {
    if (puckInitialHistory) {
      devLogger.logData("PUCK_INITIAL_HISTORY", puckInitialHistory);
    }
  }, [puckInitialHistory]);

  /**
   * Clears localStorage and resets the save data in the DB
   */
  const clearHistory = () => {
    devLogger.logFunc("clearHistory");
    clearThemeLocalStorage();
    if (localDev) {
      return;
    }
    deleteThemeSaveState();
  };

  // Handles sending the sendDevThemeSaveStateData on initial load so that nothing isn't rendered for preview.
  // Subsequent changes are sent via handleChange in ThemeSidebar.tsx.
  useEffect(() => {
    if (!themeHistoryFetched) {
      return;
    }

    const themeToSend = themeHistories?.histories[themeHistories.index]?.data;

    devLogger.logFunc("sendDevThemeSaveStateData useEffect");
    sendDevThemeSaveStateData({
      payload: { devThemeSaveStateData: JSON.stringify(themeToSend) },
    });
  }, [themeHistoryFetched, themeHistories, templateMetadata]);

  const isLoading =
    !puckInitialHistoryFetched ||
    !themeHistoryFetched ||
    !themeSaveStateFetched;

  const progress =
    60 + // @ts-expect-error adding bools is fine
    (puckInitialHistoryFetched + themeHistoryFetched + themeSaveStateFetched) *
      13.33;

  return !isLoading ? (
    <InternalThemeEditor
      puckConfig={puckConfig}
      puckInitialHistory={puckInitialHistory}
      isLoading={isLoading}
      templateMetadata={templateMetadata}
      publishTheme={publishTheme}
      themeConfig={themeConfig}
      saveThemeSaveState={saveThemeSaveState}
      themeHistories={themeHistories}
      setThemeHistories={setThemeHistories}
      clearThemeHistory={clearHistory}
      sendDevThemeSaveStateData={sendDevThemeSaveStateData}
      buildThemeLocalStorageKey={buildThemeLocalStorageKey}
      localDev={localDev}
    />
  ) : (
    <LoadingScreen progress={progress} />
  );
};
