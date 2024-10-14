import { InternalEditor } from "../internal/components/InternalEditor.js";
import "./index.css";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { LoadingScreen } from "../internal/puck/components/LoadingScreen.tsx";
import { Toaster } from "../internal/puck/ui/Toaster.tsx";
import {
  getVisualConfigLocalStorageKey,
  getThemeLocalStorageKey,
} from "../internal/utils/localStorageHelper.ts";
import { TemplateMetadata } from "../internal/types/templateMetadata.ts";
import { type Config, InitialHistory } from "@measured/puck";
import {
  useReceiveMessage,
  useSendMessageToParent,
} from "../internal/hooks/useMessage.ts";
import { SaveState } from "../internal/types/saveState.ts";
import "@measured/puck/puck.css";
import { DevLogger } from "../utils/devLogger.ts";
import { ThemeConfig } from "../utils/themeResolver.ts";
import { ThemeSaveState } from "../internal/types/themeSaveState.ts";
import { updateThemeInEditor } from "../utils/applyTheme.ts";

export const Role = {
  GLOBAL: "global",
  INDIVIDUAL: "individual",
};

export const TARGET_ORIGINS = [
  "http://localhost",
  "https://dev.yext.com",
  "https://qa.yext.com",
  "https://sandbox.yext.com",
  "https://www.yext.com",
  "https://app-qa.eu.yext.com",
  "https://app.eu.yext.com",
];

export interface EditorProps {
  document: any;
  componentRegistry: Map<string, Config<any>>;
  themeConfig?: ThemeConfig;
}

const devLogger = new DevLogger();

export const Editor = ({
  document,
  componentRegistry,
  themeConfig,
}: EditorProps) => {
  const [puckInitialHistory, setPuckInitialHistory] = useState<
    InitialHistory | undefined
  >();
  const [puckInitialHistoryFetched, setPuckInitialHistoryFetched] =
    useState<boolean>(false);
  const [visualConfigurationData, setVisualConfigurationData] = useState<any>(); // json data
  const [visualConfigurationDataFetched, setVisualConfigurationDataFetched] =
    useState<boolean>(false); // needed because visualConfigurationData can be empty
  const [saveState, setSaveState] = useState<SaveState>();
  const [saveStateFetched, setSaveStateFetched] = useState<boolean>(false); // needed because saveState can be empty
  const [devPageSets, setDevPageSets] = useState<any>(undefined);
  const [devSiteStream, setDevSiteStream] = useState<any>(undefined);
  const [templateMetadata, setTemplateMetadata] = useState<TemplateMetadata>();
  const [puckConfig, setPuckConfig] = useState<Config>();
  const [parentLoaded, setParentLoaded] = useState<boolean>(false);

  // theming
  const [themeInitialHistory, setThemeInitialHistory] =
    useState<ThemeSaveState>({ history: [{}], index: 0 });
  const [themeInitialHistoryFetched, setThemeInitialHistoryFetched] =
    useState<boolean>(false);
  const [themeData, setThemeData] = useState<any>(); // json data
  const [themeDataFetched, setThemeDataFetched] = useState<boolean>(false); // needed because themeData can be empty
  const [themeSaveState, setThemeSaveState] = useState<
    ThemeSaveState | undefined
  >(undefined);
  const [themeSaveStateFetched, setThemeSaveStateFetched] =
    useState<boolean>(false); // needed because themeSaveState can be empty

  if (document) {
    devLogger.logData("DOCUMENT", document);
  }

  const buildVisualConfigLocalStorageKey = useCallback(() => {
    if (!templateMetadata) {
      return "";
    }

    return getVisualConfigLocalStorageKey(
      templateMetadata.isDevMode && !templateMetadata.devOverride,
      templateMetadata.role,
      templateMetadata.templateId,
      templateMetadata.layoutId,
      templateMetadata.entityId
    );
  }, [templateMetadata]);

  const buildThemeLocalStorageKey = useCallback(() => {
    if (!templateMetadata) {
      return "";
    }

    return getThemeLocalStorageKey(
      templateMetadata.isDevMode,
      templateMetadata.siteId,
      templateMetadata.themeEntityId
    );
  }, [templateMetadata]);

  // redirect to 404 page when going to /edit page outside of Storm
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ancestors = window.location.ancestorOrigins;
      if (ancestors.length === 0) {
        window.location.assign("/404.html");
      } else if (
        !ancestors[0].includes("pagescdn") &&
        !ancestors[0].includes("yext.com") &&
        !ancestors[0].includes("localhost")
      ) {
        window.location.assign("/404.html");
      } else {
        setParentLoaded(true);
      }
    }
  }, []);

  useReceiveMessage("getTemplateMetadata", TARGET_ORIGINS, (send, payload) => {
    const puckConfig = componentRegistry.get(payload.templateId);
    setPuckConfig(puckConfig);
    const templateMetadata = payload as TemplateMetadata;
    setTemplateMetadata(payload as TemplateMetadata);
    devLogger.enable(templateMetadata.isxYextDebug);
    devLogger.logData("TEMPLATE_METADATA", templateMetadata);
    devLogger.logData("PUCK_CONFIG", puckConfig);
    send({ status: "success", payload: { message: "payload received" } });
  });

  useEffect(() => {
    if (templateMetadata?.isDevMode) {
      try {
        // @ts-expect-error pageSets is a global variable set by pagesJS
        setDevPageSets(pageSets);
        // @ts-expect-error siteStream is a global variable set by pagesJS
        setDevSiteStream(siteStream);
        // eslint-disable-next-line
      } catch (ignored) {
        console.warn("pageSets are not defined");
      }
    }
  }, [templateMetadata?.isDevMode]);

  const clearLocalStorage = () => {
    if (templateMetadata?.isThemeMode) {
      clearThemeLocalStorage();
    } else {
      clearVisualConfigLocalStorage();
    }
  };

  /**
   * Clears the user's theming in localStorage
   */
  const clearThemeLocalStorage = () => {
    devLogger.logFunc("clearThemeLocalStorage");
    window.localStorage.removeItem(buildThemeLocalStorageKey());
  };

  /**
   * Clears the user's visual configuration in localStorage and resets the current Puck history
   */
  const clearVisualConfigLocalStorage = () => {
    devLogger.logFunc("clearVisualConfigLocalStorage");
    window.localStorage.removeItem(buildVisualConfigLocalStorageKey());
  };

  /**
   * Clears localStorage and resets the save data in the DB
   */
  const clearHistory = () => {
    devLogger.logFunc("clearHistory");
    clearLocalStorage();
    if (templateMetadata?.isThemeMode) {
      deleteThemeSaveState();
    } else {
      deleteSaveState();
    }
  };

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // toggle flag after first render/mounting
      return;
    }
    loadPuckInitialHistory();
    loadThemeInitialHistory();
  }, [
    templateMetadata,
    saveStateFetched,
    visualConfigurationDataFetched,
    themeDataFetched,
    themeSaveStateFetched,
  ]);

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
    if (
      !visualConfigurationDataFetched ||
      !saveStateFetched ||
      !templateMetadata
    ) {
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

    if (templateMetadata.isDevMode && !templateMetadata.devOverride) {
      // Check localStorage for existing Puck history
      const localHistoryArray = window.localStorage.getItem(
        buildVisualConfigLocalStorageKey()
      );

      // Use localStorage directly if it exists
      if (localHistoryArray) {
        devLogger.log("Dev Mode - Using localStorage");
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
      devLogger.log("Dev Mode - No localStorage. Using data from Content");
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
    if (!saveState) {
      clearLocalStorage();

      devLogger.log("Prod Mode - No saveState. Using data from Content");
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
      devLogger.log("Prod Mode - No localStorage. Using saveState");
      setPuckInitialHistory({
        histories: visualConfigurationData
          ? [
              { id: "root", state: { data: visualConfigurationData } },
              {
                id: saveState.hash,
                state: jsonFromEscapedJsonString(saveState.history),
              },
            ]
          : [
              {
                id: saveState.hash,
                state: jsonFromEscapedJsonString(saveState.history),
              },
            ],
        index: visualConfigurationData ? 1 : 0,
        appendData: false,
      });
      setPuckInitialHistoryFetched(true);
      return;
    }

    const localHistoryIndex = JSON.parse(localHistoryArray).findIndex(
      (item: any) => item.id === saveState?.hash
    );

    // If local storage reset Puck history to it
    if (localHistoryIndex !== -1) {
      devLogger.log("Prod Mode - Using localStorage");
      setPuckInitialHistory({
        histories: JSON.parse(localHistoryArray),
        index: localHistoryIndex,
        appendData: false,
      });
      setPuckInitialHistoryFetched(true);
      return;
    }

    // otherwise start fresh - this user doesn't have localStorage that reflects the saved state
    clearLocalStorage();
  }, [
    setPuckInitialHistory,
    setPuckInitialHistoryFetched,
    clearLocalStorage,
    getVisualConfigLocalStorageKey,
  ]);

  // Handles sending the devSaveStateData on initial load so that nothing isn't rendered for preview.
  // Subsequent changes are sent via handleHistoryChange in InternalEditor.tsx.
  useEffect(() => {
    if (!puckInitialHistoryFetched || templateMetadata?.isThemeMode) {
      return;
    }

    const historyToSend =
      puckInitialHistory?.histories[puckInitialHistory.histories.length - 1]
        .state.data;

    devLogger.logFunc("sendDevSaveStateData useEffect");
    sendDevSaveStateData({
      payload: { devSaveStateData: JSON.stringify(historyToSend) },
    });
  }, [puckInitialHistoryFetched, puckInitialHistory, templateMetadata]);

  useEffect(() => {
    if (puckInitialHistory) {
      devLogger.logData("PUCK_INITIAL_HISTORY", puckInitialHistory);
    }
  }, [puckInitialHistory]);

  const loadThemeInitialHistory = useCallback(() => {
    if (
      !themeSaveStateFetched ||
      !templateMetadata ||
      !templateMetadata.isThemeMode
    ) {
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
        devLogger.log("Dev Mode - Using theme localStorage");
        const localHistories = JSON.parse(localHistoryArray);
        const localHistoryIndex = localHistories.length - 1;
        setThemeInitialHistory({
          history: localHistories,
          index: localHistoryIndex,
        });
        devLogger.logData("THEME_INITIAL_HISTORY", themeInitialHistory);
        setThemeInitialHistoryFetched(true);
        return;
      }

      // Otherwise start fresh from Content
      devLogger.log(
        "Dev Mode - No localStorage. Using theme data from Content"
      );
      if (themeData) {
        setThemeInitialHistory({
          history: [themeData],
          index: 0,
        });
      }
      devLogger.logData("THEME_INITIAL_HISTORY", themeInitialHistory);
      setThemeInitialHistoryFetched(true);
      return;
    }

    // Nothing in save_state table, start fresh from Content
    if (!themeSaveState) {
      clearLocalStorage();

      devLogger.log("Prod Mode - No saveState. Using theme data from Content");
      if (themeData) {
        setThemeInitialHistory({
          history: [themeData],
          index: 0,
        });
      }
      devLogger.logData("THEME_INITIAL_HISTORY", themeInitialHistory);
      setThemeInitialHistoryFetched(true);

      return;
    }

    // Check localStorage for existing themes
    // const localHistoryArray = window.localStorage.getItem(
    //   buildThemeLocalStorageKey()
    // );

    // No localStorage for themes, start from themeSaveState
    //if (!localHistoryArray) {
    if (themeData) {
      devLogger.log(
        "Prod Mode - No themeLocalStorage. Using themeSaveState and themeData"
      );
      const history = themeData
        ? [themeData, ...themeSaveState.history]
        : [...themeSaveState.history];
      const themeInitialHistory = {
        history: history,
        index: history.length - 1,
      };
      setThemeInitialHistory(themeInitialHistory);
      setThemeInitialHistoryFetched(true);
      devLogger.logData("THEME_INITIAL_HISTORY", themeInitialHistory);
      return;
    }

    devLogger.log("No loadThemeInitialHistory case matched, setting to blank.");
    setThemeInitialHistory({
      history: [{}],
      index: 0,
    });
    devLogger.logData("THEME_INITIAL_HISTORY", themeInitialHistory);
    setThemeInitialHistoryFetched(true);
    // If local storage reset theme history to it
    // devLogger.log("Prod Mode - Using themeLocalStorage");
    // setThemeInitialHistory({
    //   history: JSON.parse(localHistoryArray),
    //   index: themeSaveState.index,
    // });
    // setThemeInitialHistoryFetched(true);
    // return;
  }, [
    setThemeInitialHistory,
    setThemeInitialHistoryFetched,
    clearLocalStorage,
    getThemeLocalStorageKey,
  ]);

  // Handles sending the sendDevThemeSaveStateData on initial load so that nothing isn't rendered for preview.
  // Subsequent changes are sent via handleChange in ThemeSidebar.tsx.
  useEffect(() => {
    if (!themeSaveStateFetched || !templateMetadata?.isThemeMode) {
      return;
    }

    const themeToSend = themeSaveState?.history[themeSaveState.index];

    devLogger.logFunc("sendDevThemeSaveStateData useEffect");
    sendDevThemeSaveStateData({
      payload: { devThemeSaveStateData: JSON.stringify(themeToSend) },
    });
  }, [themeSaveStateFetched, themeSaveState, templateMetadata]);

  const { sendToParent: iFrameLoaded } = useSendMessageToParent(
    "iFrameLoaded",
    TARGET_ORIGINS
  );

  const { sendToParent: sendDevSaveStateData } = useSendMessageToParent(
    "sendDevSaveStateData",
    TARGET_ORIGINS
  );

  useEffect(() => {
    iFrameLoaded({ payload: { message: "iFrame is loaded" } });
  }, []);

  useReceiveMessage("getSaveState", TARGET_ORIGINS, (send, payload) => {
    devLogger.logData("SAVE_STATE", payload);
    setSaveState(payload as SaveState);
    setSaveStateFetched(true);
    send({ status: "success", payload: { message: "saveState received" } });
  });

  useReceiveMessage("getThemeSaveState", TARGET_ORIGINS, (send, payload) => {
    const themeSaveState = {
      history: payload?.history
        ? jsonFromEscapedJsonString(payload?.history)
        : [],
      index: payload?.index ?? 0,
    };
    devLogger.logData("THEME_SAVE_STATE", payload);
    setThemeSaveState(themeSaveState);
    setThemeSaveStateFetched(true);
    send({
      status: "success",
      payload: { message: "themeSaveState received" },
    });
  });

  useReceiveMessage(
    "getVisualConfigurationData",
    TARGET_ORIGINS,
    (send, payload) => {
      const vcd = jsonFromEscapedJsonString(payload.visualConfigurationData);
      devLogger.logData("VISUAL_CONFIGURATION_DATA", vcd);
      setVisualConfigurationData(vcd);
      setVisualConfigurationDataFetched(true);
      send({
        status: "success",
        payload: { message: "getVisualConfigurationData received" },
      });
    }
  );

  useReceiveMessage("getThemeData", TARGET_ORIGINS, (send, payload) => {
    const themeData = jsonFromEscapedJsonString(payload as unknown as string);
    devLogger.logData("THEME_DATA", themeData);
    setThemeData(themeData);
    setThemeDataFetched(true);
    send({
      status: "success",
      payload: { message: "getThemeData received" },
    });
  });

  const { sendToParent: pushPageSets } = useSendMessageToParent(
    "pushPageSets",
    TARGET_ORIGINS
  );

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      templateMetadata?.isDevMode &&
      devPageSets
    ) {
      pushPageSets({
        payload: { ...devPageSets, siteStream: devSiteStream },
      });
    }
  }, [templateMetadata?.isDevMode, devPageSets]);

  const { sendToParent: saveSaveState } = useSendMessageToParent(
    "saveSaveState",
    TARGET_ORIGINS
  );

  const { sendToParent: deleteSaveState } = useSendMessageToParent(
    "deleteSaveState",
    TARGET_ORIGINS
  );

  const { sendToParent: saveVisualConfigData } = useSendMessageToParent(
    "saveVisualConfigData",
    TARGET_ORIGINS
  );

  const { sendToParent: saveThemeSaveState } = useSendMessageToParent(
    "saveThemeSaveState",
    TARGET_ORIGINS
  );

  const { sendToParent: sendDevThemeSaveStateData } = useSendMessageToParent(
    "sendDevThemeSaveStateData",
    TARGET_ORIGINS
  );

  const { sendToParent: deleteThemeSaveState } = useSendMessageToParent(
    "deleteThemeSaveState",
    TARGET_ORIGINS
  );

  const { sendToParent: saveThemeData } = useSendMessageToParent(
    "saveThemeData",
    TARGET_ORIGINS
  );

  const { sendToParent: openQuickFind } = useSendMessageToParent(
    "openQuickFind",
    TARGET_ORIGINS
  );

  const keyboardHandler = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      openQuickFind();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", keyboardHandler);
    return () => {
      window.removeEventListener("keydown", keyboardHandler);
    };
  }, []);

  const isLoading =
    !puckConfig ||
    !templateMetadata ||
    !document ||
    !saveStateFetched ||
    !visualConfigurationDataFetched ||
    !puckInitialHistoryFetched ||
    (templateMetadata.isThemeMode &&
      (!themeDataFetched ||
        !themeSaveStateFetched ||
        !themeInitialHistoryFetched));

  useEffect(() => {
    devLogger.logFunc("themeInitialHistory useEffect");
    if (themeInitialHistory && themeConfig && templateMetadata?.isThemeMode) {
      devLogger.logData("THEME_INITIAL_HISTORY", themeInitialHistory);
      updateThemeInEditor(
        themeInitialHistory.history[themeInitialHistory.index],
        themeConfig
      );
    }
  }, [themeInitialHistory, themeConfig, templateMetadata?.isThemeMode]);

  const progress: number =
    (100 * // @ts-expect-error adding bools is fine
      (!!puckConfig +
        !!templateMetadata +
        !!document +
        saveStateFetched +
        visualConfigurationDataFetched +
        puckInitialHistoryFetched +
        (templateMetadata?.isThemeMode // @ts-expect-error adding bools is fine
          ? themeDataFetched +
            themeSaveStateFetched +
            themeInitialHistoryFetched
          : 0))) /
    (templateMetadata?.isThemeMode ? 9 : 6);

  return (
    <>
      {!isLoading ? (
        <InternalEditor
          puckConfig={puckConfig}
          isLoading={isLoading}
          puckInitialHistory={puckInitialHistory}
          clearHistory={
            templateMetadata.isDevMode && !templateMetadata.devOverride
              ? clearLocalStorage
              : clearHistory
          }
          templateMetadata={templateMetadata}
          saveState={saveState!}
          saveSaveState={saveSaveState}
          saveVisualConfigData={saveVisualConfigData}
          sendDevSaveStateData={sendDevSaveStateData}
          saveThemeData={saveThemeData}
          buildVisualConfigLocalStorageKey={buildVisualConfigLocalStorageKey}
          devLogger={devLogger}
          themeConfig={themeConfig}
          themeData={themeData}
          saveThemeSaveState={saveThemeSaveState}
          sendDevThemeSaveStateData={sendDevThemeSaveStateData}
          themeHistory={themeInitialHistory}
          setThemeHistory={setThemeInitialHistory}
        />
      ) : (
        parentLoaded && <LoadingScreen progress={progress} />
      )}
      <Toaster closeButton richColors />
    </>
  );
};

const jsonFromEscapedJsonString = (escapedJsonString: string) => {
  return JSON.parse(escapedJsonString.replace(/\\"/g, '"'));
};
