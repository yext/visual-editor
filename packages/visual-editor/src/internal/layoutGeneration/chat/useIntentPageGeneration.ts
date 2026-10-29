import React from "react";
import type { TemplateMetadata } from "../../types/templateMetadata.ts";
import { IntentPageGenerationWorkflow } from "../workflows/intentPageGeneration/IntentPageGenerationWorkflow.ts";
import type { useLayoutGenerationChat } from "./useLayoutGenerationChat.ts";

type Chat = Pick<
  ReturnType<typeof useLayoutGenerationChat>,
  "ready" | "isStreaming" | "generateIntent" | "cancel"
>;

export const IntentPageGenerationContext =
  React.createContext<IntentPageGenerationWorkflow | null>(null);

export const useIntentPageGeneration = (
  chat: Chat,
  metadata: TemplateMetadata,
  scope: string,
  enabled: boolean
) => {
  const current = React.useRef(chat);
  current.current = chat;
  const workflow = React.useMemo(
    () =>
      new IntentPageGenerationWorkflow(
        metadata.layoutId,
        (prompt, continuation) =>
          current.current.generateIntent(prompt, continuation),
        () => current.current.cancel()
      ),
    [scope, metadata.assignment, metadata.isDevMode, metadata.isThemeMode]
  );
  const state = React.useSyncExternalStore(
    workflow.subscribe,
    workflow.snapshot
  );
  const generation = metadata.aiPageGeneration?.intentPageGeneration;
  const eligible =
    enabled &&
    !metadata.isDevMode &&
    !metadata.isThemeMode &&
    metadata.assignment === "ALL" &&
    !!metadata.aiPageGeneration?.model?.trim();

  React.useEffect(() => {
    workflow.reconcile(eligible ? generation : undefined);
  }, [workflow, eligible, generation]);
  React.useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled)
        workflow.autoStart(
          eligible && current.current.ready && !current.current.isStreaming
        );
    });
    return () => {
      cancelled = true;
    };
  }, [workflow, eligible, generation, chat.ready, chat.isStreaming]);
  React.useEffect(() => () => workflow.dispose(), [workflow]);
  return {
    workflow,
    state,
    eligible: eligible && !!generation?.prompt?.trim(),
    status: generation?.status,
  };
};

export const IntentPageGenerationChatContext = React.createContext<ReturnType<
  typeof useIntentPageGeneration
> | null>(null);
