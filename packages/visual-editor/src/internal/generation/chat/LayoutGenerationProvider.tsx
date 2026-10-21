import React from "react";
import type { Config } from "@puckeditor/core";
import type { TemplateMetadata } from "../../types/templateMetadata.ts";
import { getGenerationCatalog } from "../catalogRegistry.ts";
import { consoleGenerationDiagnostics } from "../environment.ts";
import { iframeModelTransport } from "../iframeTransport.ts";
import { LayoutGenerationChatContext } from "./LayoutGenerationChatContext.tsx";
import { LayoutGenerationChatUiProvider } from "./LayoutGenerationChatUiContext.tsx";
import { useLayoutGenerationChat } from "./useLayoutGenerationChat.ts";

/** Platform owner; the local shell uses the same hook/providers above preview remounts. */
export const LayoutGenerationProvider = ({
  config,
  metadata,
  localDev = false,
  children,
}: {
  config: Config;
  metadata: TemplateMetadata;
  localDev?: boolean;
  children: React.ReactNode;
}) => {
  const enabled =
    !localDev &&
    metadata.aiPageGeneration?.enabled === true &&
    !metadata.isThemeMode;
  const model =
    typeof metadata.aiPageGeneration?.model === "string"
      ? metadata.aiPageGeneration.model
      : "";
  const environment = React.useMemo(
    () =>
      enabled
        ? {
            model,
            catalog: getGenerationCatalog(config),
            locales: metadata.locales,
            transport: iframeModelTransport,
            diagnostics: consoleGenerationDiagnostics,
          }
        : null,
    [enabled, model, config, metadata.locales]
  );
  const scope = JSON.stringify([
    metadata.siteId,
    metadata.templateId,
    metadata.layoutId,
  ]);
  const chat = useLayoutGenerationChat(environment, scope);
  if (localDev) return children;
  return (
    <LayoutGenerationChatContext.Provider value={enabled ? chat.canvas : null}>
      <LayoutGenerationChatUiProvider
        scopeKey={`${scope}:${model}`}
        chat={enabled ? chat : null}
        disabled={!chat.ready}
      >
        {children}
      </LayoutGenerationChatUiProvider>
    </LayoutGenerationChatContext.Provider>
  );
};
