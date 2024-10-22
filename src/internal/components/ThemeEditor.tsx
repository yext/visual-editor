import React, { useCallback, useEffect, useState } from "react";
import { InitialHistory, Config } from "@measured/puck";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { useThemeLocalStorage } from "../hooks/theme/useLocalStorage.ts";
import { DevLogger } from "../../utils/devLogger.ts";
import { SavedTheme, ThemeConfig } from "../../utils/themeResolver.ts";
import { updateThemeInEditor } from "../../utils/applyTheme.ts";
import { InternalThemeEditor } from "./InternalThemeEditor.tsx";
import { useThemeMessageSenders } from "../hooks/theme/useMessageSenders.ts";
import { useThemeMessageReceivers } from "../hooks/theme/useMessageReceivers.ts";
import { LoadingScreen } from "../puck/components/LoadingScreen.tsx";
import { ThemeHistories } from "../types/themeData.ts";

const devLogger = new DevLogger();

type ThemeEditorProps = {
  puckConfig: Config;
  templateMetadata: TemplateMetadata;
  visualConfigurationData: any;
  themeConfig: ThemeConfig | undefined;
};

export const ThemeEditor = (props: ThemeEditorProps) => {
  const { puckConfig, templateMetadata, visualConfigurationData, themeConfig } =
    props;

  const {
    sendDevThemeSaveStateData,
    saveThemeSaveState,
    publishThemeConfiguration,
    deleteThemeSaveState,
  } = useThemeMessageSenders();

  const { themeData, themeDataFetched, themeSaveState, themeSaveStateFetched } =
    useThemeMessageReceivers();

  const { buildThemeLocalStorageKey, clearThemeLocalStorage } =
    useThemeLocalStorage(templateMetadata);

  const [puckInitialHistory, setPuckInitialHistory] = useState<
    InitialHistory | undefined
  >();
  const [puckInitialHistoryFetched, setPuckInitialHistoryFetched] =
    useState<boolean>(false);
  const [themeInitialHistories, setThemeInitialHistories] = useState<
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
    devLogger.logFunc("loadPuckInitialHistory");

    // Only load Content data for theme mode
    if (visualConfigurationData) {
      setPuckInitialHistory({
        histories: [{ id: "root", state: { data: visualConfigurationData } }],
        appendData: false,
      });
    }

    setPuckInitialHistoryFetched(true);
  }, [
    setPuckInitialHistory,
    setPuckInitialHistoryFetched,
    visualConfigurationData,
  ]);

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
      const localHistoryArray = window.localStorage.getItem(
        buildThemeLocalStorageKey()
      );

      // Use localStorage directly if it exists
      if (localHistoryArray) {
        devLogger.log("Theme Dev Mode - Using theme localStorage");
        const localHistories = JSON.parse(localHistoryArray);
        const localHistoryIndex = localHistories.length - 1;
        setThemeInitialHistories({
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
        setThemeInitialHistories({
          histories: [{ id: "root", data: themeData }],
          index: 0,
        });
      }
      setThemeHistoryFetched(true);
      return;
    }

    // Nothing in theme_save_state table, start fresh from Content
    if (!themeSaveState) {
      clearThemeLocalStorage();

      devLogger.log(
        "Theme Prod Mode - No saveState. Using theme data from Content"
      );
      if (themeData) {
        setThemeInitialHistories({
          histories: [{ id: "root", data: themeData }],
          index: 0,
        });
      }
      setThemeHistoryFetched(true);

      return;
    }

    // Check localStorage for existing theme history
    const localHistoryArray = window.localStorage.getItem(
      buildThemeLocalStorageKey()
    );

    // No localStorage, start from themeSaveState
    if (!localHistoryArray) {
      devLogger.log("Theme Prod Mode - No localStorage. Using themeSaveState");
      setThemeInitialHistories({
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
    }

    const localHistoryIndex = JSON.parse(localHistoryArray).findIndex(
      (item: any) => item.id === themeSaveState?.hash
    );

    // If local storage reset theme history to it
    if (localHistoryIndex !== -1) {
      devLogger.log("Theme Prod Mode - Using localStorage theme data");
      setThemeInitialHistories({
        histories: JSON.parse(localHistoryArray),
        index: localHistoryIndex,
      });
      setThemeHistoryFetched(true);
      return;
    }

    // otherwise start fresh - this user doesn't have localStorage that reflects the theme saved state
    clearThemeLocalStorage();
  }, [
    setThemeInitialHistories,
    setThemeHistoryFetched,
    clearThemeLocalStorage,
    buildThemeLocalStorageKey,
  ]);

  // Log THEME_INITIAL_HISTORY on load and update theme in editor to reflect save state
  useEffect(() => {
    devLogger.logData("THEME_INITIAL_HISTORIES", themeInitialHistories);
    if (themeInitialHistories && themeConfig) {
      updateThemeInEditor(
        themeInitialHistories.histories[themeInitialHistories.index]
          ?.data as SavedTheme,
        themeConfig
      );
    }
  }, [themeInitialHistories, themeConfig]);

  useEffect(() => {
    if (!themeSaveStateFetched || !themeDataFetched) {
      return;
    }
    loadPuckInitialHistory();
    loadThemeHistory();
  }, [templateMetadata, themeSaveStateFetched, themeDataFetched]);

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
    deleteThemeSaveState();
  };

  const isLoading =
    !puckInitialHistoryFetched ||
    !themeHistoryFetched ||
    !themeDataFetched ||
    !themeSaveStateFetched;

  const progress =
    60 + // @ts-expect-error adding bools is fine
    (puckInitialHistoryFetched +
      themeHistoryFetched +
      themeDataFetched +
      themeSaveStateFetched) *
      10;

  return !isLoading ? (
    <InternalThemeEditor
      puckConfig={puckConfig}
      puckInitialHistory={puckInitialHistory}
      isLoading={isLoading}
      templateMetadata={templateMetadata}
      publishThemeConfiguration={publishThemeConfiguration}
      themeConfig={themeConfig}
      saveThemeSaveState={saveThemeSaveState}
      themeInitialHistories={themeInitialHistories}
      setThemeInitialHistories={setThemeInitialHistories}
      clearThemeHistory={clearHistory}
      sendDevThemeSaveStateData={sendDevThemeSaveStateData}
      buildThemeLocalStorageKey={buildThemeLocalStorageKey}
    />
  ) : (
    <LoadingScreen progress={progress} />
  );
};
