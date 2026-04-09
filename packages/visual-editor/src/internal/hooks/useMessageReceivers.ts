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
import type { LocalDevOptions } from "../../editor/types.ts";
import { migrate } from "../../utils/migrate.ts";
import { migrationRegistry } from "../../components/migrations/migrationRegistry.ts";
import { StreamDocument } from "../../utils/types/StreamDocument.ts";
import {
  getCustomEditorTemplateIds,
  getLocalTemplateIdFromEditorPath,
  getSingleCustomTemplateId,
} from "../../vite-plugin/routing/devMode.ts";

const devLogger = new DevLogger();

type ResolvedTemplateConfig = {
  resolvedTemplateId: string;
  puckConfig: Config<any>;
  usedPathOverride: boolean;
  usedFallback: boolean;
};

/**
 * Resolves the local template config that the editor should use.
 *
 * In platform dev mode the local route wins over platform metadata so a repo
 * with custom-only templates can still open the correct local editor page even
 * when the platform payload still refers to `main`.
 */
export const resolveTemplateConfig = ({
  requestedTemplateId,
  componentRegistry,
  isDevMode,
  currentPathname,
}: {
  requestedTemplateId: string;
  componentRegistry: Record<string, Config<any>>;
  isDevMode: boolean;
  currentPathname?: string;
}): ResolvedTemplateConfig => {
  const routeTemplateId = isDevMode
    ? getLocalTemplateIdFromEditorPath(
        currentPathname,
        Object.keys(componentRegistry)
      )
    : null;
  if (routeTemplateId) {
    return {
      resolvedTemplateId: routeTemplateId,
      puckConfig: componentRegistry[routeTemplateId],
      usedPathOverride: true,
      usedFallback: false,
    };
  }

  const directConfig = componentRegistry[requestedTemplateId];
  if (directConfig) {
    return {
      resolvedTemplateId: requestedTemplateId,
      puckConfig: directConfig,
      usedPathOverride: false,
      usedFallback: false,
    };
  }

  if (!isDevMode || requestedTemplateId !== "main") {
    throw new Error(
      `Could not find config for template: templateId=${requestedTemplateId}`
    );
  }

  const fallbackTemplateId = getSingleCustomTemplateId(
    Object.keys(componentRegistry)
  );
  if (!fallbackTemplateId) {
    const fallbackTemplateIds = getCustomEditorTemplateIds(
      Object.keys(componentRegistry)
    );
    throw new Error(
      "Could not find config for template: " +
        `templateId=${requestedTemplateId}. ` +
        "Platform dev mode can only fall back when exactly one non-shared local template exists, " +
        `received ${fallbackTemplateIds.length} (${fallbackTemplateIds.join(", ") || "none"})`
    );
  }

  const fallbackConfig = componentRegistry[fallbackTemplateId];
  if (!fallbackConfig) {
    throw new Error(
      `Could not find config for fallback template: templateId=${fallbackTemplateId}`
    );
  }

  return {
    resolvedTemplateId: fallbackTemplateId,
    puckConfig: fallbackConfig,
    usedPathOverride: false,
    usedFallback: true,
  };
};

export const useCommonMessageReceivers = (
  componentRegistry: Record<string, Config<any>>,
  localDev: boolean,
  streamDocument: StreamDocument,
  localDevOptions?: LocalDevOptions
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
      const devMetadata = generateTemplateMetadata(localDevOptions);
      setTemplateMetadata(devMetadata);

      const puckConfig = componentRegistry[devMetadata.templateId];
      if (!puckConfig) {
        throw new Error(
          `Could not find config for template: templateId=${devMetadata.templateId}`
        );
      }
      setPuckConfig(puckConfig);

      // applies current migration version to empty data
      setLayoutData(
        migrate(
          (localDevOptions?.initialLayoutData as Data | undefined) ?? {
            root: {},
            content: [],
            zones: {},
          },
          migrationRegistry,
          puckConfig,
          streamDocument
        )
      );
      setLayoutDataFetched(true);
      setThemeData({});
      setThemeDataFetched(true);
    }
  }, [
    componentRegistry,
    localDevOptions,
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

  /**
   * Receives the platform metadata that identifies which template the editor
   * should use, then rewrites that identity when platform dev mode is pointed
   * at a local custom-template editor route.
   */
  useReceiveMessage("getTemplateMetadata", TARGET_ORIGINS, (send, payload) => {
    const {
      resolvedTemplateId,
      puckConfig: resolvedPuckConfig,
      usedPathOverride,
      usedFallback,
    } = resolveTemplateConfig({
      requestedTemplateId: payload.templateId,
      componentRegistry,
      isDevMode: !!payload.isDevMode,
      currentPathname:
        typeof window !== "undefined" ? window.location.pathname : undefined,
    });

    const puckConfig = resolvedPuckConfig;
    if (usedPathOverride) {
      console.warn(
        "Using local editor route template during platform dev mode: " +
          `requested templateId=${payload.templateId}, resolved templateId=${resolvedTemplateId}`
      );
    }
    if (usedFallback) {
      console.warn(
        "Falling back to local template config during platform dev mode: " +
          `requested templateId=${payload.templateId}, resolved templateId=${resolvedTemplateId}`
      );
    }
    setPuckConfig(puckConfig);
    const templateMetadata = {
      ...(payload as TemplateMetadata),
      templateId: resolvedTemplateId,
    };
    setTemplateMetadata(templateMetadata);
    devLogger.enable(templateMetadata.isxYextDebug);
    devLogger.logData("TEMPLATE_METADATA", templateMetadata);
    devLogger.logData("PUCK_CONFIG", puckConfig);
    send({ status: "success", payload: { message: "payload received" } });
  });

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
