import * as React from "react";
import { useEffect, useState } from "react";
import { TARGET_ORIGINS, useReceiveMessage } from "./useMessage.ts";
import {
  generateTemplateMetadata,
  TemplateMetadata,
} from "../types/templateMetadata.ts";
import { DevLogger } from "../../utils/devLogger.ts";
import { Config, Data } from "@measured/puck";
import { useCommonMessageSenders } from "./useMessageSenders.ts";
import { ThemeData } from "../types/themeData.ts";
import { migrate } from "../../utils/migrate.ts";
import { migrationRegistry } from "../../components/migrations/migrationRegistry.ts";
import { normalizeLocalesInObject } from "@yext/visual-editor";

const devLogger = new DevLogger();

export const useCommonMessageReceivers = (
  componentRegistry: Map<string, Config<any>>,
  localDev: boolean
) => {
  const { iFrameLoaded } = useCommonMessageSenders();

  // Trigger data flow from parent
  useEffect(() => {
    iFrameLoaded({ payload: { message: "iFrame is loaded" } });
  }, []);

  // Base Template Info
  const [templateMetadata, setTemplateMetadata] = useState<TemplateMetadata>();
  const [puckConfig, setPuckConfig] = useState<Config>();

  // Layout from Content
  const [layoutData, setLayoutData] = useState<Data>();
  const [layoutDataFetched, setLayoutDataFetched] = useState<boolean>(false); // needed because layoutData can be empty

  // Theme from Content
  const [themeData, setThemeData] = useState<ThemeData>();
  const [themeDataFetched, setThemeDataFetched] = useState<boolean>(false); // needed because themeData can be empty

  // in localDev mode, return default data and mark all data as fetched
  useEffect(() => {
    if (localDev) {
      const devMetadata = generateTemplateMetadata();
      setTemplateMetadata(devMetadata);
      const puckConfig = componentRegistry.get(devMetadata.templateId);
      setPuckConfig(puckConfig);
      // applies current migration version to empty data
      setLayoutData(
        migrate(
          {
            root: {},
            content: [],
            zones: {},
          },
          migrationRegistry,
          puckConfig
        )
      );
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

  useReceiveMessage("getTemplateMetadata", TARGET_ORIGINS, (send, payload) => {
    payload = normalizeLocalesInObject(payload);
    const puckConfig = componentRegistry.get(payload.templateId);
    setPuckConfig(puckConfig);
    const templateMetadata = payload as TemplateMetadata;
    setTemplateMetadata(payload as TemplateMetadata);
    devLogger.enable(templateMetadata.isxYextDebug);
    devLogger.logData("TEMPLATE_METADATA", templateMetadata);
    devLogger.logData("PUCK_CONFIG", puckConfig);
    send({ status: "success", payload: { message: "payload received" } });
  });

  useReceiveMessage("getLayoutData", TARGET_ORIGINS, (send, payload) => {
    payload = normalizeLocalesInObject(payload);
    const data = JSON.parse(payload.layoutData) as Data;
    devLogger.logData("LAYOUT_DATA", data);
    const migratedData = migrate(data, migrationRegistry, puckConfig);
    setLayoutData(migratedData);
    setLayoutDataFetched(true);
    send({
      status: "success",
      payload: { message: "getLayoutData received" },
    });
  });

  useReceiveMessage("getThemeData", TARGET_ORIGINS, (send, payload) => {
    payload = normalizeLocalesInObject(payload);
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
