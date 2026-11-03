import type { Config } from "@puckeditor/core";
import React from "react";
import type { TemplateMetadata } from "../../types/templateMetadata.ts";
import { getGenerationCatalog } from "../shared/catalogRegistry.ts";
import { consoleGenerationDiagnostics } from "../shared/contracts.ts";
import { iframeModelTransport } from "../transport/messageTransport.ts";
import {
  LayoutGenerationChatContext,
  LayoutGenerationChatUiProvider,
} from "./contexts.tsx";
import { useLayoutGenerationChat } from "./useLayoutGenerationChat.ts";

type LayoutGenerationProviderProps = {
  config: Config;
  metadata: TemplateMetadata;
  localDev?: boolean;
  children: React.ReactNode;
};

/** Platform owner; the local shell uses the same hook/providers above preview remounts. */
export const LayoutGenerationProvider = ({
  config,
  metadata,
  localDev = false,
  children,
}: LayoutGenerationProviderProps) => {
  const enabled =
    !localDev &&
    metadata.aiPageGeneration?.layoutGenerationEnabled === true &&
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

  if (localDev) {
    return children;
  }

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
