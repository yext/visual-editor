import * as React from "react";
import { useEffect, useState } from "react";
import { TARGET_ORIGINS, useReceiveMessage } from "./useMessage.ts";
import {
  generateTemplateMetadata,
  TemplateMetadata,
} from "../types/templateMetadata.ts";
import { DevLogger } from "../../utils/devLogger.ts";
import { Config, Data } from "@puckeditor/core";
import { useCommonMessageSenders } from "./useMessageSenders.ts";
import { ThemeData } from "../types/themeData.ts";
import { migrate } from "../../utils/migrate.ts";
import { migrationRegistry } from "../../components/migrations/migrationRegistry.ts";
import { StreamDocument } from "../../utils/types/StreamDocument.ts";

const devLogger = new DevLogger();

export type ComponentRegistry = Record<
  string,
  Config<any> | (() => Promise<Config<any>>)
>;

const createEmptyLocalDevLayout: Data = {
  root: {},
  content: [],
  zones: {},
};

export const getLocalDevLayoutData = (
  puckConfig: Config,
  streamDocument: StreamDocument
) => {
  const layout = streamDocument.__?.layout;
  if (!layout) {
    return migrate(
      createEmptyLocalDevLayout,
      migrationRegistry,
      puckConfig,
      streamDocument
    );
  }

  try {
    const parsedLayout = JSON.parse(layout) as Data;
    return migrate(parsedLayout, migrationRegistry, puckConfig, streamDocument);
  } catch (error) {
    console.warn(
      "Failed to parse local dev layout JSON. Falling back to empty layout.",
      error
    );
    return migrate(
      createEmptyLocalDevLayout,
      migrationRegistry,
      puckConfig,
      streamDocument
    );
  }
};

export const useCommonMessageReceivers = (
  componentRegistry: ComponentRegistry,
  localDev: boolean,
  streamDocument: StreamDocument
) => {
  const { iFrameLoaded } = useCommonMessageSenders();

  // Trigger data flow from parent
  useEffect(() => {
    iFrameLoaded({ payload: { message: "iFrame is loaded" } });
  }, []);

  // Base Template Info
  const [templateMetadata, setTemplateMetadata] = useState<TemplateMetadata>();
  const [puckConfig, setPuckConfig] = useState<Config>({ components: {} });

  // Layout from Content
  const [layoutData, setLayoutData] = useState<Data>();
  const [layoutDataFetched, setLayoutDataFetched] = useState<boolean>(false); // needed because layoutData can be empty

  // Theme from Content
  const [themeData, setThemeData] = useState<ThemeData>();
  const [themeDataFetched, setThemeDataFetched] = useState<boolean>(false); // needed because themeData can be empty

  // in localDev mode, return default data and mark all data as fetched
  useEffect(() => {
    if (localDev) {
      const devMetadata = generateTemplateMetadata(streamDocument);
      setTemplateMetadata(devMetadata);

      const registeredConfig = componentRegistry[devMetadata.templateId];
      if (!registeredConfig) {
        throw new Error(
          `Could not find config for template: templateId=${devMetadata.templateId}`
        );
      }
      if (typeof registeredConfig === "function") {
        throw new Error(
          `Cannot load config asynchronously in local development: templateId=${devMetadata.templateId}`
        );
      }
      const puckConfig = registeredConfig;
      setPuckConfig(puckConfig);

      setLayoutData(getLocalDevLayoutData(puckConfig, streamDocument));
      setLayoutDataFetched(true);
      setThemeData({});
      setThemeDataFetched(true);
    }
  }, [
    localDev,
    setTemplateMetadata,
    setPuckConfig,
    setLayoutData,
    setLayoutDataFetched,
    setThemeData,
    setThemeDataFetched,
    streamDocument,
  ]);

  // return default data for localDev mode
  if (localDev) {
    return {
      layoutData,
      layoutDataFetched,
      themeData,
      themeDataFetched,
      templateMetadata,
      puckConfig,
    };
  }

  useReceiveMessage(
    "getTemplateMetadata",
    TARGET_ORIGINS,
    async (send, payload) => {
      const registeredConfig = componentRegistry[payload.templateId];
      if (!registeredConfig) {
        throw new Error(
          `Could not find config for template: templateId=${payload.templateId}`
        );
      }
      const puckConfig =
        typeof registeredConfig === "function"
          ? await registeredConfig()
          : registeredConfig;
      setPuckConfig(puckConfig);
      const templateMetadata = payload as TemplateMetadata;
      setTemplateMetadata(payload as TemplateMetadata);
      devLogger.enable(templateMetadata.isxYextDebug);
      devLogger.logData("TEMPLATE_METADATA", templateMetadata);
      devLogger.logData("PUCK_CONFIG", puckConfig);
      send({ status: "success", payload: { message: "payload received" } });
    }
  );

  useReceiveMessage("getLayoutData", TARGET_ORIGINS, (send, payload) => {
    const data = JSON.parse(payload.layoutData) as Data;
    devLogger.logData("LAYOUT_DATA", data);
    setLayoutData(data);
    setLayoutDataFetched(true);
    send({
      status: "success",
      payload: { message: "getLayoutData received" },
    });
  });

  useReceiveMessage("getThemeData", TARGET_ORIGINS, (send, payload) => {
    const payloadString = payload as unknown as string;
    const themeData = payloadString ? JSON.parse(payloadString) : {};
    devLogger.logData("THEME_DATA", themeData);
    setThemeData(themeData as ThemeData);
    setThemeDataFetched(true);
    send({
      status: "success",
      payload: { message: "getThemeData received" },
    });
  });

  return {
    layoutData,
    layoutDataFetched,
    themeData,
    themeDataFetched,
    templateMetadata,
    puckConfig,
  };
};

const TemplateMetadataContext = React.createContext<TemplateMetadata>(
  {} as TemplateMetadata
);

const useTemplateMetadata = () => {
  const context = React.useContext(TemplateMetadataContext);
  if (context === undefined) {
    throw new Error(
      "useTemplateMetadata must be used within ThemeEditor or LayoutEditor"
    );
  }
  if (context === null) {
    throw new Error("useCommonMessageReceivers has not received a message yet");
  }

  return context;
};

export { useTemplateMetadata, TemplateMetadataContext };
