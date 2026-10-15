import React from "react";
import { LocalEditorChatCanvas } from "./LocalEditorChatCanvas.ts";
import type { GenerationTokenUsage, GeneratedContent } from "../types.ts";

type ConversationMessage = { role: "user" | "assistant"; content: string };
type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  pending?: boolean;
};

/** Keep conversation prose separate from the generated canvas data. */
export const useLocalEditorChat = (api: string, layoutId: string) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [usage, setUsage] = React.useState<GenerationTokenUsage>({
    cachedInput: 0,
    uncachedInput: 0,
    output: 0,
  });
  const [canvas] = React.useState(() => new LocalEditorChatCanvas());
  const ready = React.useSyncExternalStore(
    canvas.subscribe,
    canvas.getReady,
    () => false
  );
  const previousMessagesRef = React.useRef<ChatMessage[]>([]);
  const history = React.useRef<ConversationMessage[]>([]);
  const activeRequest = React.useRef<AbortController | null>(null);
  const diagnostics = React.useRef<Record<string, unknown>>({});
  const reportError = (cause: unknown) => {
    const error = cause instanceof Error ? cause : new Error(String(cause));
    const details: Record<string, unknown> = {
      ...diagnostics.current,
      layoutId,
      error: error.message.slice(0, 32_768),
      stack: error.stack?.slice(0, 65_536),
    };
    // Preserve the error even when an unusually large candidate exceeds the report limit.
    const candidateJson = JSON.stringify(details.candidate);
    if (candidateJson && candidateJson.length > 500_000)
      details.candidate = { omitted: true, characters: candidateJson.length };
    console.error("[local-editor generation] Chat failed", details);
    setError(error);
    // Reporting must survive cancellation and must never mask the chat error.
    void (async () => {
      try {
        const response = await fetch(`${api}/error`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(details),
        });
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      } catch (reportFailure) {
        console.error("Unable to report chat error:", reportFailure);
      }
    })();
  };
  const cancel = React.useCallback(() => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    canvas.finish();
    setMessages(previousMessagesRef.current);
    setIsStreaming(false);
  }, [canvas]);
  canvas.onError = (cause) => {
    cancel();
    reportError(cause);
  };
  const clear = React.useCallback(() => {
    cancel();
    history.current = [];
    previousMessagesRef.current = [];
    setMessages([]);
    setUsage({ cachedInput: 0, uncachedInput: 0, output: 0 });
    setError(null);
    setIsStreaming(false);
  }, [cancel]);
  React.useEffect(() => {
    clear();
    return () => {
      cancel();
    };
  }, [api, layoutId, clear, cancel]);

  const send = async (prompt: string) => {
    if (!prompt.trim() || activeRequest.current || !canvas.ready) return;
    diagnostics.current = {
      correlationId: crypto.randomUUID(),
      phase: "read-layout",
      historyMessageCount: history.current.length,
    };
    const controller = new AbortController();
    activeRequest.current = controller;
    const user: ConversationMessage = { role: "user", content: prompt.trim() };
    const previousMessages = messages;
    previousMessagesRef.current = previousMessages;
    const nextMessages: ChatMessage[] = [
      ...previousMessages,
      { role: "user", text: user.content },
    ];
    let text = "";
    let spec: GeneratedContent | null = null;
    let accepted = false;
    setMessages([
      ...nextMessages,
      { role: "assistant", text: "Generating layout…", pending: true },
    ]);
    setIsStreaming(true);
    setError(null);
    try {
      const currentData = canvas.begin();
      // Puck 0.24 records manual changes after 250ms. Let that pending history
      // settle before a fast final commit.
      await new Promise<void>((resolve) => setTimeout(resolve, 260));
      if (activeRequest.current !== controller) return;
      diagnostics.current.phase = "request";
      const response = await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Visual-Editor-Correlation-Id": String(
            diagnostics.current.correlationId
          ),
        },
        body: JSON.stringify({
          layoutId,
          currentData,
          messages: [...history.current, user],
        }),
        signal: controller.signal,
      });
      diagnostics.current.status = response.status;
      diagnostics.current.phase = "read-response";
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? `HTTP error: ${response.status}`);
      }
      if (
        response.headers.get("X-Visual-Editor-Generation") !==
        "strict-puck-overrides-v2"
      )
        throw new Error(
          "Generation endpoint does not support validated Puck output"
        );
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");
      let pending = "";
      const processEvent = (line: string) => {
        if (!line.trim() || activeRequest.current !== controller) return;
        const event = JSON.parse(line);
        if (event.type === "usage") {
          setUsage((current) => ({
            cachedInput: current.cachedInput + event.usage.cachedInput,
            uncachedInput: current.uncachedInput + event.usage.uncachedInput,
            output: current.output + event.usage.output,
          }));
        } else if (event.type === "error") throw new Error(event.error);
        else if (event.type === "accepted") {
          if (
            typeof event.text !== "string" ||
            !(
              event.spec === null ||
              (event.spec &&
                typeof event.spec === "object" &&
                Array.isArray(event.spec.content) &&
                Object.keys(event.spec).every((key) => key === "content"))
            )
          )
            throw new Error("Invalid accepted Puck response");
          text = event.text;
          spec = event.spec;
          accepted = true;
          // Commit history and layout only after the transport finishes successfully.
        }
      };
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          pending += decoder.decode(value, { stream: !done });
          const lines = pending.split("\n");
          pending = lines.pop()!;
          lines.forEach(processEvent);
          if (done) break;
        }
        if (pending) processEvent(pending);
        if (!accepted)
          throw new Error("Generation ended before spec acceptance");
      } finally {
        reader.releaseLock();
      }
      if (activeRequest.current === controller) {
        diagnostics.current.phase = "resolve-and-commit";
        diagnostics.current.candidate = spec;
        await canvas.commit(spec);
        if (activeRequest.current !== controller) return;
        const completedMessages: ChatMessage[] = [
          ...nextMessages,
          { role: "assistant", text },
        ];
        setMessages(completedMessages);
        previousMessagesRef.current = completedMessages;
        history.current = [
          ...history.current,
          user,
          { role: "assistant", content: text },
        ];
      }
    } catch (cause) {
      if (activeRequest.current !== controller || controller.signal.aborted)
        return;
      canvas.finish();
      setMessages(previousMessages);
      reportError(cause);
    } finally {
      if (activeRequest.current === controller) {
        canvas.finish();
        activeRequest.current = null;
        setIsStreaming(false);
      }
    }
  };
  return {
    messages,
    isStreaming,
    send,
    clear,
    error,
    usage,
    canvas,
    ready,
    cancel,
  };
};
