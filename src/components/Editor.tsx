import { InternalEditor } from "../internal/components/InternalEditor.js";
import "./index.css";
import { DocumentProvider } from "@yext/pages/util";
import { useEffect, useState, useCallback, useRef } from "react";
import { LoadingScreen } from "../internal/puck/components/LoadingScreen.tsx";
import { Toaster } from "../internal/puck/ui/Toaster.tsx";
import { getLocalStorageKey } from "../internal/utils/localStorageHelper";
import { TemplateMetadata } from "../types";
import { type History, type Data, type Config } from "@measured/puck";
import { useReceiveMessage, useSendMessageToParent } from "../hooks";
import { SaveState } from "../internal/types/saveState";

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
  puckConfig: Config;
  templateMetadata: TemplateMetadata;
}

export const Editor = ({
  document,
  puckConfig,
  templateMetadata,
}: EditorProps) => {
  const [puckData, setPuckData] = useState<Data>();
  const [histories, setHistories] = useState<History<any>[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [visualConfigurationData, setVisualConfigurationData] = useState<any>(); // json data
  const [visualConfigurationDataFetched, setVisualConfigurationDataFetched] =
    useState<boolean>(false); // needed because visualConfigurationData can be empty
  const [saveState, setSaveState] = useState<SaveState>();
  const [saveStateFetched, setSaveStateFetched] = useState<boolean>(false); // needed because saveState can be empty
  console.log("render VE lib editor");

  const { sendToParent: veLibLoaded } = useSendMessageToParent(
    "veLibLoaded",
    TARGET_ORIGINS
  );

  useEffect(() => {
    veLibLoaded({ payload: { message: "VE Library is loaded" } });
  }, []);

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
    setHistories([]);
    setHistoryIndex(-1);
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

    // No localStorage
    if (!localHistoryArray) {
      return;
    }

    const localHistoryIndex = JSON.parse(localHistoryArray).findIndex(
      (item: any) => item.id === saveState?.hash
    );

    // If local storage reset Puck history to it
    if (localHistoryIndex !== -1) {
      setHistoryIndex(localHistoryIndex);
      setHistories(JSON.parse(localHistoryArray));
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
    setHistories,
    setHistoryIndex,
    setPuckData,
    clearLocalStorage,
    getLocalStorageKey,
  ]);

  const { sendToParent: iFrameLoaded } = useSendMessageToParent(
    "iFrameLoaded",
    TARGET_ORIGINS
  );

  useEffect(() => {
    iFrameLoaded({ payload: { message: "iFrame is loaded" } });
  }, []);

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
    (100 * // @ts-ignore adding bools is fine
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
            index={historyIndex}
            histories={histories}
            clearHistory={
              templateMetadata?.isDevMode ? clearLocalStorage : clearHistory
            }
            templateMetadata={templateMetadata}
            saveState={saveState!}
            saveSaveState={saveSaveState}
            saveVisualConfigData={saveVisualConfigData}
            deleteSaveState={deleteSaveState}
          />
        </DocumentProvider>
      ) : (
        <LoadingScreen progress={progress} />
      )}
      <Toaster closeButton richColors />
    </>
  );
};

const jsonFromEscapedJsonString = (escapedJsonString: string) => {
  return JSON.parse(escapedJsonString.replace(/\\"/g, '"'));
};
