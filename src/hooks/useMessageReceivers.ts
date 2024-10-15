import { useEffect, useState } from "react";
import {
  TARGET_ORIGINS,
  useMessageSenders,
  useReceiveMessage,
} from "../internal/hooks/useMessage.ts";
import { TemplateMetadata } from "../internal/types/templateMetadata.ts";
import { DevLogger } from "../utils/devLogger.ts";
import { LayoutSaveState } from "../internal/types/saveState.ts";
import { Config } from "@measured/puck";
import { ThemeSaveState } from "../internal/types/themeSaveState.ts";
import { jsonFromEscapedJsonString } from "../internal/utils/jsonFromEscapedJsonString.ts";

const devLogger = new DevLogger();

export const useMessageReceivers = (
  componentRegistry: Map<string, Config<any>>
) => {
  const { iFrameLoaded } = useMessageSenders();

  // Trigger data flow from parent
  useEffect(() => {
    iFrameLoaded({ payload: { message: "iFrame is loaded" } });
  }, []);

  // Base Template Info
  const [templateMetadata, setTemplateMetadata] = useState<TemplateMetadata>();
  const [puckConfig, setPuckConfig] = useState<Config>();

  // Layout from Content
  const [visualConfigurationData, setVisualConfigurationData] = useState<any>(); // json data
  const [visualConfigurationDataFetched, setVisualConfigurationDataFetched] =
    useState<boolean>(false); // needed because visualConfigurationData can be empty

  // Layout from DB
  const [layoutSaveState, setLayoutSaveState] = useState<LayoutSaveState>();
  const [layoutSaveStateFetched, setLayoutSaveStateFetched] =
    useState<boolean>(false); // needed because saveState can be empty

  // Theme from Content
  const [themeData, setThemeData] = useState<any>(); // json data
  const [themeDataFetched, setThemeDataFetched] = useState<boolean>(false); // needed because themeData can be empty

  // Theme from DB
  const [themeSaveState, setThemeSaveState] = useState<
    ThemeSaveState | undefined
  >(undefined);
  const [themeSaveStateFetched, setThemeSaveStateFetched] =
    useState<boolean>(false); // needed because themeSaveState can be empty

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

  useReceiveMessage("getSaveState", TARGET_ORIGINS, (send, payload) => {
    devLogger.logData("SAVE_STATE", payload);
    setLayoutSaveState(payload as LayoutSaveState);
    setLayoutSaveStateFetched(true);
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

  return {
    visualConfigurationData,
    visualConfigurationDataFetched,
    templateMetadata,
    puckConfig,
    themeData,
    themeDataFetched,
    layoutSaveState,
    layoutSaveStateFetched,
    themeSaveState,
    themeSaveStateFetched,
  };
};
