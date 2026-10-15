import React from "react";
import { LocalEditorChatCanvas } from "./LocalEditorChatCanvas.ts";
import type { GenerationTokenUsage, GeneratedContent } from "../types.ts";

type ConversationMessage = { role: "user" | "assistant"; content: string };
type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

/** Accepted structured responses retain saved data for follow-up revisions. */
export const useLocalEditorChat = (api: string, layoutId: string) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [progress, setProgress] = React.useState("");
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
  const cancel = React.useCallback(() => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    canvas.finish();
    setMessages(previousMessagesRef.current);
    setIsStreaming(false);
    setProgress("");
  }, [canvas]);
  canvas.onError = (cause) => {
    cancel();
    setError(cause instanceof Error ? cause : new Error(String(cause)));
  };
  const clear = React.useCallback(() => {
    cancel();
    history.current = [];
    previousMessagesRef.current = [];
    setMessages([]);
    setUsage({ cachedInput: 0, uncachedInput: 0, output: 0 });
    setError(null);
    setIsStreaming(false);
    setProgress("");
  }, [cancel]);
  React.useEffect(() => {
    clear();
    return () => {
      cancel();
    };
  }, [api, layoutId, clear, cancel]);

  const send = async (prompt: string) => {
    if (!prompt.trim() || activeRequest.current || !canvas.ready) return;
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
    const update = () => {
      if (activeRequest.current !== controller) return;
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          text,
        },
      ]);
    };
    setMessages(nextMessages);
    setIsStreaming(true);
    setProgress("Generating…");
    setError(null);
    try {
      const currentData = canvas.begin();
      // Puck 0.24 records manual changes after 250ms. Let that pending history
      // settle before a fast final commit.
      await new Promise<void>((resolve) => setTimeout(resolve, 260));
      if (activeRequest.current !== controller) return;
      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layoutId,
          currentData,
          messages: [...history.current, user],
        }),
        signal: controller.signal,
      });
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
        else if (event.type === "commentary") {
          text += event.delta;
          update();
        } else if (event.type === "progress") {
          if (typeof event.text === "string") setProgress(event.text);
        } else if (event.type === "accepted") {
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
        await canvas.commit(spec);
        if (activeRequest.current !== controller) return;
        update();
        previousMessagesRef.current = [
          ...nextMessages,
          { role: "assistant", text },
        ];
        history.current = [
          ...history.current,
          user,
          { role: "assistant", content: JSON.stringify({ text, spec }) },
        ];
      }
    } catch (cause) {
      if (activeRequest.current !== controller || controller.signal.aborted)
        return;
      canvas.finish();
      setMessages(previousMessages);
      setError(cause instanceof Error ? cause : new Error(String(cause)));
    } finally {
      if (activeRequest.current === controller) {
        canvas.finish();
        activeRequest.current = null;
        setIsStreaming(false);
        setProgress("");
      }
    }
  };
  return {
    messages,
    isStreaming,
    progress,
    send,
    clear,
    error,
    usage,
    canvas,
    ready,
    cancel,
  };
};
