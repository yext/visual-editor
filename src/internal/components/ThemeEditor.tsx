import React, { useCallback, useEffect, useState } from "react";
import { LoadingScreen } from "../puck/components/LoadingScreen.tsx";
import { InitialHistory, Config } from "@measured/puck";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { useMessageSenders } from "../hooks/useMessage.ts";
import { useLocalStorage } from "../hooks/useLocalStorage.ts";
import { DevLogger } from "../../utils/devLogger.ts";
import { ThemeSaveState } from "../types/themeSaveState.ts";
import { ThemeConfig } from "../../utils/themeResolver.ts";
import { updateThemeInEditor } from "../../utils/applyTheme.ts";
import { InternalThemeEditor } from "./InternalThemeEditor.tsx";

const devLogger = new DevLogger();

type ThemeEditorProps = {
  puckConfig: Config;
  templateMetadata: TemplateMetadata;
  themeSaveState: ThemeSaveState | undefined;
  themeData: any;
  visualConfigurationData: any;
  themeConfig: ThemeConfig | undefined;
};

export const ThemeEditor = (props: ThemeEditorProps) => {
  const {
    puckConfig,
    templateMetadata,
    themeSaveState,
    themeData,
    visualConfigurationData,
    themeConfig,
  } = props;

  const {
    sendDevThemeSaveStateData,
    saveThemeSaveState,
    publishThemeConfiguration,
    deleteThemeSaveState,
    sendDevLayoutSaveStateData,
  } = useMessageSenders();

  const { buildThemeLocalStorageKey, clearThemeLocalStorage } =
    useLocalStorage(templateMetadata);

  const [puckInitialHistory, setPuckInitialHistory] = useState<
    InitialHistory | undefined
  >();
  const [puckInitialHistoryFetched, setPuckInitialHistoryFetched] =
    useState<boolean>(false);
  const [themeInitialHistory, setThemeInitialHistory] =
    useState<ThemeSaveState>({ history: [{}], index: 0 });
  const [themeInitialHistoryFetched, setThemeInitialHistoryFetched] =
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
    if (templateMetadata.isThemeMode) {
      if (visualConfigurationData) {
        setPuckInitialHistory({
          histories: [{ id: "root", state: { data: visualConfigurationData } }],
          appendData: false,
        });
      }
      setPuckInitialHistoryFetched(true);
      return;
    }
  }, [setPuckInitialHistory, setPuckInitialHistoryFetched]);

  /*
   * Determines the initial theme data to send to the editor.
   * Prod mode: If DB theme_save_state exists, use that. Otherwise, pull from Content
   * Dev mode: If localstorage theme data exists, use that. Otherwise, pull from Content
   */
  const loadThemeInitialHistory = useCallback(() => {
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
        setThemeInitialHistory({
          history: localHistories,
          index: localHistoryIndex,
        });
        setThemeInitialHistoryFetched(true);
        return;
      }

      // Otherwise start fresh from Content
      devLogger.log(
        "Theme Dev Mode - No localStorage. Using theme data from Content"
      );
      if (themeData) {
        setThemeInitialHistory({
          history: [themeData],
          index: 0,
        });
      }
      setThemeInitialHistoryFetched(true);
      return;
    }

    // Nothing in theme_save_state table, start fresh from Content
    if (!themeSaveState) {
      clearThemeLocalStorage();

      devLogger.log(
        "Theme Prod Mode - No saveState. Using theme data from Content"
      );
      if (themeData) {
        setThemeInitialHistory({
          history: [themeData],
          index: 0,
        });
      }
      setThemeInitialHistoryFetched(true);

      return;
    }

    // themeSaveState exists, combine with themeData from content
    if (themeData) {
      devLogger.log("Theme Prod Mode - Using themeSaveState and themeData");
      const history = themeData
        ? [themeData, ...themeSaveState.history]
        : [...themeSaveState.history];
      const themeInitialHistory = {
        history: history,
        index: history.length - 1,
      };
      setThemeInitialHistory(themeInitialHistory);
      setThemeInitialHistoryFetched(true);
      return;
    }

    devLogger.log(
      "No loadThemeInitialHistory case matched, setting to empty theme."
    );
    setThemeInitialHistory({
      history: [{}],
      index: 0,
    });
    setThemeInitialHistoryFetched(true);
  }, [
    setThemeInitialHistory,
    setThemeInitialHistoryFetched,
    clearThemeLocalStorage,
    buildThemeLocalStorageKey,
  ]);

  // Log THEME_INITIAL_HISTORY on load and update theme in editor to reflect save state
  useEffect(() => {
    devLogger.logData("THEME_INITIAL_HISTORY", themeInitialHistory);
    if (themeInitialHistory && themeConfig && templateMetadata?.isThemeMode) {
      updateThemeInEditor(
        themeInitialHistory.history[themeInitialHistory.index],
        themeConfig
      );
    }
  }, [themeInitialHistory, themeConfig, templateMetadata?.isThemeMode]);

  useEffect(() => {
    loadPuckInitialHistory();
    loadThemeInitialHistory();
  }, [templateMetadata]);

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

  // Handles sending the devSaveStateData on initial load so that nothing isn't rendered for preview.
  // Subsequent changes are sent via handleHistoryChange in InternalLayoutEditor.tsx and handleThemeChange
  // in InternalThemeEditor.tsx
  useEffect(() => {
    if (!puckInitialHistoryFetched || templateMetadata?.isThemeMode) {
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

  // Handles sending the sendDevThemeSaveStateData on initial load so that nothing isn't rendered for preview.
  // Subsequent changes are sent via handleChange in ThemeSidebar.tsx.
  useEffect(() => {
    if (!themeInitialHistoryFetched || !templateMetadata?.isThemeMode) {
      return;
    }

    const themeToSend = themeInitialHistory?.history[themeInitialHistory.index];

    devLogger.logFunc("sendDevThemeSaveStateData useEffect");
    sendDevThemeSaveStateData({
      payload: { devThemeSaveStateData: JSON.stringify(themeToSend) },
    });
  }, [themeInitialHistoryFetched, themeInitialHistory, templateMetadata]);

  const isLoading = !puckInitialHistoryFetched || !themeInitialHistoryFetched;

  return (
    <>
      {!isLoading ? (
        <InternalThemeEditor
          puckConfig={puckConfig}
          puckInitialHistory={puckInitialHistory}
          isLoading={isLoading}
          templateMetadata={templateMetadata}
          publishThemeConfiguration={publishThemeConfiguration}
          themeConfig={themeConfig}
          saveThemeSaveState={saveThemeSaveState}
          themeHistory={themeInitialHistory}
          setThemeHistory={setThemeInitialHistory}
          clearThemeHistory={clearHistory}
          sendDevThemeSaveStateData={sendDevThemeSaveStateData}
          buildThemeLocalStorageKey={buildThemeLocalStorageKey}
        />
      ) : (
        <LoadingScreen progress={90} />
      )}
    </>
  );
};
