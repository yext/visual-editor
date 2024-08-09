import { InternalEditor } from "../internal/components/InternalEditor.js";
import React from "react";
import "./index.css";
import { DocumentProvider } from "@yext/pages/util";
import { useEffect, useState, useCallback, useRef } from "react";
import { LoadingScreen } from "../internal/puck/components/LoadingScreen.tsx";
import { Toaster } from "../internal/puck/ui/Toaster.tsx";
import { getLocalStorageKey } from "../internal/utils/localStorageHelper.ts";
import { TemplateMetadata } from "../internal/types/templateMetadata.ts";
import { type History, type Data, type Config } from "@measured/puck";
import {
  useReceiveMessage,
  useSendMessageToParent,
} from "../internal/hooks/useMessage.ts";
import { SaveState } from "../internal/types/saveState.ts";
import "@measured/puck/puck.css";

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

export type PuckInitialHistory = {
  histories: History<any>[];
  index: number;
};

export interface EditorProps {
  document: any;
  puckConfigs: Map<string, Config<any>>;
}

export const Editor = ({ document, puckConfigs }: EditorProps) => {
  const [puckData, setPuckData] = useState<Data>();
  const [puckInitialHistory, setPuckInitialHistory] =
    useState<PuckInitialHistory>({
      histories: [],
      index: -1,
    });
  const [visualConfigurationData, setVisualConfigurationData] = useState<any>(); // json data
  const [visualConfigurationDataFetched, setVisualConfigurationDataFetched] =
    useState<boolean>(false); // needed because visualConfigurationData can be empty
  const [saveState, setSaveState] = useState<SaveState>();
  const [saveStateFetched, setSaveStateFetched] = useState<boolean>(false); // needed because saveState can be empty
  const [devPageSets, setDevPageSets] = useState<any>(undefined);
  const [templateMetadata, setTemplateMetadata] = useState<TemplateMetadata>();
  const [puckConfig, setPuckConfig] = useState<Config>();
  const [parentLoaded, setParentLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ancestors = window.location.ancestorOrigins;
      if (ancestors.length === 0) {
        window.location.assign("/404.html");
      } else if (
        !ancestors[0].includes("pagescdn") &&
        !ancestors[0].includes("yext.com")
      ) {
        window.location.assign("/404.html");
      } else {
        setParentLoaded(true);
      }
    }
  }, []);

  useReceiveMessage("getTemplateMetadata", TARGET_ORIGINS, (send, payload) => {
    const puckConfig = puckConfigs.get(payload.templateId);
    setPuckConfig(puckConfig);
    setTemplateMetadata(payload as TemplateMetadata);
    send({ status: "success", payload: { message: "payload received" } });
  });

  useEffect(() => {
    if (templateMetadata?.isDevMode) {
      try {
        // @ts-expect-error pageSets is a global variable set by pagesJS
        setDevPageSets(pageSets);
        // eslint-disable-next-line
      } catch (ignored) {
        console.warn("pageSets are not defined");
      }
    }
  }, [templateMetadata?.isDevMode]);

  /**
   * Clears the user's localStorage and resets the current Puck history
   * @param isDevMode
   * @param role
   * @param templateId
   * @param layoutId
   * @param entityId
   */
  const clearLocalStorage = (
    isDevMode: boolean,
    role: string,
    templateId: string,
    layoutId?: number,
    entityId?: number
  ) => {
    window.localStorage.removeItem(
      getLocalStorageKey(isDevMode, role, templateId, layoutId, entityId)
    );
  };

  /**
   * Clears localStorage and resets the save data in the DB
   * @param isDevMode
   * @param role
   * @param templateId
   * @param layoutId
   * @param entityId
   */
  const clearHistory = (
    isDevMode: boolean,
    role: string,
    templateId: string,
    layoutId?: number,
    entityId?: number
  ) => {
    clearLocalStorage(isDevMode, role, templateId, layoutId, entityId);
    deleteSaveState();
  };

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // toggle flag after first render/mounting
      return;
    }
    loadPuckDataUsingHistory(); // do something after state has updated
  }, [templateMetadata, saveState, visualConfigurationData]);

  const loadPuckDataUsingHistory = useCallback(() => {
    if (
      !visualConfigurationDataFetched ||
      !saveStateFetched ||
      !templateMetadata
    ) {
      return;
    }

    if (templateMetadata.isDevMode) {
      // Check localStorage for existing Puck history
      const localHistoryArray = window.localStorage.getItem(
        getLocalStorageKey(
          templateMetadata.isDevMode,
          templateMetadata.role,
          templateMetadata.templateId,
          templateMetadata.layoutId,
          templateMetadata.entityId
        )
      );

      // Use localStorage directly if it exists
      if (localHistoryArray) {
        const localHistories = JSON.parse(localHistoryArray);
        const localHistoryIndex = localHistories.length - 1;
        setPuckInitialHistory({
          histories: localHistories,
          index: localHistoryIndex,
        });
        setPuckData(localHistories[localHistoryIndex].data.data);
        return;
      }

      // Otherwise start from the data saved to Content
      setPuckData(visualConfigurationData);
      return;
    }

    // Nothing in save_state table, start fresh from Content
    if (!saveState) {
      clearLocalStorage(
        templateMetadata.isDevMode,
        templateMetadata.role,
        templateMetadata.templateId,
        templateMetadata.layoutId,
        templateMetadata.entityId
      );

      setPuckData(visualConfigurationData);
      return;
    }

    // The history stored has both "ui" and "data" keys, but PuckData
    // is only concerned with the "data" portion.
    setPuckData(jsonFromEscapedJsonString(saveState.history).data);

    // Check localStorage for existing Puck history
    const localHistoryArray = window.localStorage.getItem(
      getLocalStorageKey(
        templateMetadata.isDevMode,
        templateMetadata.role,
        templateMetadata.templateId,
        templateMetadata.layoutId,
        templateMetadata.entityId
      )
    );

    // No localStorage, start from saveState
    if (!localHistoryArray) {
      return;
    }

    const localHistoryIndex = JSON.parse(localHistoryArray).findIndex(
      (item: any) => item.id === saveState?.hash
    );

    // If local storage reset Puck history to it
    if (localHistoryIndex !== -1) {
      setPuckInitialHistory({
        histories: JSON.parse(localHistoryArray),
        index: localHistoryIndex,
      });
      return;
    }

    // otherwise start fresh - this user doesn't have localStorage that reflects the saved state
    clearLocalStorage(
      templateMetadata.isDevMode,
      templateMetadata.role,
      templateMetadata.templateId,
      templateMetadata.layoutId,
      templateMetadata.entityId
    );
  }, [
    setPuckInitialHistory,
    setPuckData,
    clearLocalStorage,
    getLocalStorageKey,
  ]);

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

  useEffect(() => {
    if (templateMetadata?.isDevMode) {
      const localHistory = window.localStorage.getItem(
        getLocalStorageKey(
          templateMetadata.isDevMode,
          templateMetadata.role,
          templateMetadata.templateId,
          templateMetadata.layoutId,
          templateMetadata.entityId
        )
      );
      const localHistoryArray = localHistory ? JSON.parse(localHistory) : [];
      const historyToSend = JSON.stringify(
        localHistoryArray.length > 0
          ? localHistoryArray[localHistoryArray.length - 1].data?.data
          : {}
      );
      sendDevSaveStateData({ payload: { devSaveStateData: historyToSend } });
    }
  }, [templateMetadata]);

  useReceiveMessage("getSaveState", TARGET_ORIGINS, (send, payload) => {
    setSaveState(payload as SaveState);
    setSaveStateFetched(true);
    send({ status: "success", payload: { message: "saveState received" } });
  });

  useReceiveMessage(
    "getVisualConfigurationData",
    TARGET_ORIGINS,
    (send, payload) => {
      setVisualConfigurationData(
        jsonFromEscapedJsonString(payload.visualConfigurationData)
      );
      setVisualConfigurationDataFetched(true);
      send({
        status: "success",
        payload: { message: "getVisualConfigurationData received" },
      });
    }
  );

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
        payload: devPageSets,
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

  const isLoading =
    !puckData ||
    !puckConfig ||
    !templateMetadata ||
    !document ||
    !saveStateFetched ||
    !visualConfigurationDataFetched;

  const progress: number =
    (100 * // @ts-expect-error adding bools is fine
      (!!puckConfig +
        !!puckData +
        !!templateMetadata +
        !!document +
        saveStateFetched +
        visualConfigurationDataFetched)) /
    6;

  return (
    <>
      {!isLoading ? (
        <DocumentProvider value={document}>
          <InternalEditor
            puckConfig={puckConfig}
            puckData={puckData}
            isLoading={isLoading}
            puckInitialHistory={puckInitialHistory}
            clearHistory={
              templateMetadata?.isDevMode ? clearLocalStorage : clearHistory
            }
            templateMetadata={templateMetadata}
            saveState={saveState!}
            saveSaveState={saveSaveState}
            saveVisualConfigData={saveVisualConfigData}
            sendDevSaveStateData={sendDevSaveStateData}
          />
        </DocumentProvider>
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
