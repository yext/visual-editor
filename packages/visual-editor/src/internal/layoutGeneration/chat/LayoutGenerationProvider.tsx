import { z } from "zod";
import { generationSettingsSchema } from "../../../types/generationSettings.ts";
import { generationPromptBundleSchema } from "../../../types/generationPrompts.ts";
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
import {
  IntentPageGenerationContext,
  IntentPageGenerationChatContext,
  useIntentPageGeneration,
} from "./useIntentPageGeneration.ts";
import { useLayoutGenerationChat } from "./useLayoutGenerationChat.ts";

const generationConfigSchema = z.object({
  prompts: generationPromptBundleSchema,
  generationSettings: generationSettingsSchema,
});

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
  const scopeKey = JSON.stringify([
    metadata.siteId,
    metadata.templateId,
    metadata.layoutId,
  ]);
  // Metadata may refresh for persistence acknowledgments; prompts and generation limits stay fixed for this scope.
  const snapshot = React.useRef<{
    scopeKey: string;
    result: ReturnType<typeof generationConfigSchema.safeParse>;
  } | null>(null);
  if (
    !localDev &&
    metadata.aiPageGeneration &&
    snapshot.current?.scopeKey !== scopeKey
  ) {
    snapshot.current = {
      scopeKey,
      result: generationConfigSchema.safeParse(metadata.aiPageGeneration),
    };
  }
  const parsed =
    snapshot.current?.scopeKey === scopeKey ? snapshot.current.result : null;
  const prompts = parsed?.success ? parsed.data.prompts : null;
  const generationSettings = parsed?.success
    ? parsed.data.generationSettings
    : null;
  React.useEffect(() => {
    if (
      !localDev &&
      metadata.aiPageGeneration?.layoutGenerationEnabled &&
      parsed &&
      !parsed.success
    ) {
      console.error(
        "AI page generation disabled: provide compatible aiPageGeneration.prompts and aiPageGeneration.generationSettings.",
        parsed.error
      );
    }
  }, [localDev, metadata.aiPageGeneration?.layoutGenerationEnabled, parsed]);

  const enabled =
    !localDev &&
    metadata.aiPageGeneration?.layoutGenerationEnabled === true &&
    !metadata.isThemeMode &&
    !!prompts;

  const model =
    typeof metadata.aiPageGeneration?.model === "string"
      ? metadata.aiPageGeneration.model
      : "";

  const environment = React.useMemo(
    () =>
      enabled
        ? {
            model,
            prompts: prompts!,
            generationSettings: generationSettings!,
            catalog: getGenerationCatalog(config),
            locales: metadata.locales,
            transport: iframeModelTransport,
            diagnostics: consoleGenerationDiagnostics,
          }
        : null,
    [enabled, model, config, metadata.locales, prompts, generationSettings]
  );

  const chat = useLayoutGenerationChat(
    environment,
    String(metadata.layoutId ?? ""),
    scopeKey
  );
  const intent = useIntentPageGeneration(
    chat,
    metadata,
    `${scopeKey}:${model}:${enabled}`,
    enabled
  );
  const intentBlocked = intent.workflow.blocked;
  const uiChat = {
    ...chat,
    send: async (prompt: string) => {
      if (intent.workflow.state.stage === "clarification") {
        await intent.workflow.answer(prompt);
      } else if (!intent.workflow.blocked) {
        await chat.send(prompt);
      }
    },
    cancel: intentBlocked ? intent.workflow.cancel : chat.cancel,
  };

  if (localDev) {
    return children;
  }

  return (
    <LayoutGenerationChatContext.Provider value={enabled ? chat.canvas : null}>
      <LayoutGenerationChatUiProvider
        scopeKey={`${scopeKey}:${model}`}
        chat={enabled ? uiChat : null}
        disabled={
          !chat.ready ||
          (intentBlocked && intent.state.stage !== "clarification")
        }
      >
        <IntentPageGenerationContext.Provider value={intent.workflow}>
          <IntentPageGenerationChatContext.Provider value={intent}>
            {children}
          </IntentPageGenerationChatContext.Provider>
        </IntentPageGenerationContext.Provider>
      </LayoutGenerationChatUiProvider>
    </LayoutGenerationChatContext.Provider>
  );
};
