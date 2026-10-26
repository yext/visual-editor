import React from "react";
import type { useLayoutGenerationChat } from "./useLayoutGenerationChat.ts";

type Chat = Pick<
  ReturnType<typeof useLayoutGenerationChat>,
  "ready" | "isStreaming" | "regenerate"
>;

/** One automatic attempt per loaded layout, independent of canvas preview remounts. */
export const useIntentPageRegeneration = (
  chat: Chat,
  prompt: string | undefined,
  scope: string,
  enabled: boolean
) => {
  const current = React.useRef(chat);
  current.current = chat;
  const attempted = React.useRef(false);
  React.useLayoutEffect(() => {
    attempted.current = false;
  }, [scope]);
  React.useEffect(() => {
    if (
      !enabled ||
      !chat.ready ||
      chat.isStreaming ||
      attempted.current ||
      typeof prompt !== "string" ||
      !prompt.trim()
    )
      return;
    let cancelled = false;
    // Effect replay cleans up the first scheduled start before it can send a request.
    queueMicrotask(() => {
      if (
        cancelled ||
        attempted.current ||
        !current.current.ready ||
        current.current.isStreaming
      )
        return;
      attempted.current = true;
      void current.current.regenerate(prompt.trim());
    });
    return () => {
      cancelled = true;
    };
  }, [scope, enabled, prompt, chat.ready, chat.isStreaming]);
};
