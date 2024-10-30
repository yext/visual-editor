import { useEffect, useState } from "react";
import { TARGET_ORIGINS, useReceiveMessage } from "./useMessage.ts";
import { TemplateMetadata } from "../types/templateMetadata.ts";
import { DevLogger } from "../../utils/devLogger.ts";
import { Config } from "@measured/puck";
import { useCommonMessageSenders } from "./useMessageSenders.ts";

const devLogger = new DevLogger();

export const useCommonMessageReceivers = (
  componentRegistry: Map<string, Config<any>>
) => {
  const { iFrameLoaded } = useCommonMessageSenders();

  // Trigger data flow from parent
  useEffect(() => {
    iFrameLoaded({ payload: { message: "iFrame is loaded" } });
  }, []);

  // Base Template Info
  const [templateMetadata, setTemplateMetadata] = useState<TemplateMetadata>();
  const [puckConfig, setPuckConfig] = useState<Config>();

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

  return {
    templateMetadata,
    puckConfig,
  };
};
