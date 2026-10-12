import React from "react";
import type { GenerationTokenUsage } from "./types.ts";
import {
  applySpecPatch,
  createMixedStreamParser,
  type Spec,
} from "@json-render/core";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type PreviewMessage = {
  role: "user" | "assistant";
  text: string;
  spec: Spec | null;
  provisional?: boolean;
};

/** Retains spec fences in history; useChatUI currently sends only parsed prose. */
export const useLocalEditorChat = (api: string) => {
  const [messages, setMessages] = React.useState<PreviewMessage[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [usage, setUsage] = React.useState<GenerationTokenUsage>({
    cachedInput: 0,
    uncachedInput: 0,
    output: 0,
  });
  const history = React.useRef<ConversationMessage[]>([]);
  const activeRequest = React.useRef<AbortController | null>(null);

  React.useEffect(() => () => activeRequest.current?.abort(), []);

  const clear = () => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    history.current = [];
    setMessages([]);
    setUsage({ cachedInput: 0, uncachedInput: 0, output: 0 });
    setError(null);
    setIsStreaming(false);
  };

  const send = async (prompt: string) => {
    if (!prompt.trim() || activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    const user: ConversationMessage = { role: "user", content: prompt.trim() };
    const previousMessages = messages;
    const nextMessages: PreviewMessage[] = [
      ...previousMessages,
      { role: "user", text: user.content, spec: null },
    ];
    let text = "";
    let content = "";
    let hasSpec = false;
    let accepted = false;
    let spec: Spec = { root: "", elements: {} };
    const update = () => {
      if (activeRequest.current !== controller) return;
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          text,
          spec: hasSpec ? structuredClone(spec) : null,
          provisional: !accepted,
        },
      ]);
    };
    setMessages(nextMessages);
    setIsStreaming(true);
    setError(null);
    try {
      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history.current, user] }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? `HTTP error: ${response.status}`);
      }
      if (
        response.headers.get("X-Visual-Editor-Generation") !== "validated-v1"
      ) {
        throw new Error(
          "Generation endpoint does not support validated output"
        );
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");
      const makeParser = () =>
        createMixedStreamParser({
          onText(line) {
            // The mixed parser only consumes exact triple-backtick spec fences.
            // Suppress extra/longer delimiters that otherwise leak into prose.
            if (/^`{3,}(?:spec)?$/.test(line.trim())) return;
            text += (text ? "\n" : "") + line;
            update();
          },
          onPatch(patch) {
            applySpecPatch(spec, patch);
            hasSpec = true;
            update();
          },
        });
      let parser = makeParser();
      let pending = "";
      const processEvent = (line: string) => {
        if (!line.trim()) return;
        if (activeRequest.current !== controller) return;
        const event = JSON.parse(line);
        if (event.type === "usage") {
          setUsage((current) => ({
            cachedInput: current.cachedInput + event.usage.cachedInput,
            uncachedInput: current.uncachedInput + event.usage.uncachedInput,
            output: current.output + event.usage.output,
          }));
        }
        if (event.type === "error") throw new Error(event.error);
        if (event.type === "reset" || event.type === "accepted") {
          text = "";
          content = "";
          hasSpec = false;
          spec = { root: "", elements: {} };
          parser = makeParser();
          update();
        }
        if (event.type === "preview-text") {
          text += event.delta;
          update();
        }
        if (event.type === "preview-spec") {
          spec = event.spec;
          hasSpec = true;
          update();
        }
        if (event.type === "preview") {
          content += event.delta;
          parser.push(event.delta);
        }
        if (event.type === "accepted") {
          accepted = true;
          content = event.content;
          parser.push(content);
          parser.flush();
          update();
        }
      };
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          const chunk = decoder.decode(value, { stream: !done });
          {
            pending += chunk;
            const lines = pending.split("\n");
            pending = lines.pop()!;
            lines.forEach(processEvent);
          }
          if (done) break;
        }
        if (pending) processEvent(pending);
        parser.flush();
        if (!accepted)
          throw new Error("Generation ended before spec acceptance");
        accepted = true;
        update();
        if (!content.trim()) throw new Error("No generated response");
      } finally {
        reader.releaseLock();
      }
      if (activeRequest.current === controller) {
        history.current = [
          ...history.current,
          user,
          { role: "assistant", content },
        ];
      }
    } catch (cause) {
      if (activeRequest.current !== controller || controller.signal.aborted)
        return;
      // Incomplete output must not become the basis for the next revision.
      setMessages(previousMessages);
      setError(cause instanceof Error ? cause : new Error(String(cause)));
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setIsStreaming(false);
      }
    }
  };

  return { messages, isStreaming, send, clear, error, usage };
};
