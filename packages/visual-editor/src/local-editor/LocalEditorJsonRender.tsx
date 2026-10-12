import React from "react";
import {
  ActionProvider,
  Renderer,
  StateProvider,
  ValidationProvider,
  VisibilityProvider,
  type ComponentRegistry,
} from "@json-render/react";
import { JsonRenderEditingContext } from "./JsonRenderSection.tsx";
import type { Spec } from "@json-render/core";
import type { PuckContext } from "@puckeditor/core";
import { useLocalEditorChat } from "./useLocalEditorChat.ts";
import { LocalEditorNotice } from "./LocalEditorNotice.tsx";

export const LocalEditorJsonRender = ({
  api,
  registry,
  editingContext,
}: {
  api: string;
  registry: ComponentRegistry;
  editingContext?: PuckContext;
}) => {
  const { messages, isStreaming, send, clear, error, usage } =
    useLocalEditorChat(api);
  const previewRegistry = React.useMemo<ComponentRegistry>(
    () => ({
      ...registry,
      [pendingSectionType]: () => (
        <div
          aria-label="Section pending"
          style={{ padding: "24px", background: "#f4f4f4" }}
        >
          Generating section…
        </div>
      ),
    }),
    [registry]
  );

  return (
    <JsonRenderEditingContext.Provider
      value={
        editingContext ?? {
          isEditing: false,
          dragRef: null,
          metadata: {},
          renderDropZone: () => null,
        }
      }
    >
      <StateProvider initialState={{}}>
        <VisibilityProvider>
          <ActionProvider
            handlers={{
              submit: (params) => console.log("Submit:", params),
              navigate: (params) => console.log("Navigate:", params),
            }}
          >
            <ValidationProvider customFunctions={{}}>
              <div role="log" aria-label="Generation conversation">
                {messages.map((message, index) => (
                  <div key={index}>
                    <p>
                      <strong>
                        {message.role === "user" ? "You" : "Assistant"}
                      </strong>
                    </p>
                    {message.text && (
                      <p style={{ whiteSpace: "pre-wrap" }}>{message.text}</p>
                    )}
                    {message.spec && (
                      <StateProvider
                        key={index}
                        initialState={message.spec.state ?? {}}
                      >
                        <div style={{ background: "#fff" }}>
                          {message.provisional && (
                            <p role="status">
                              Provisional preview — awaiting validation
                            </p>
                          )}
                          <Renderer
                            spec={
                              message.provisional
                                ? withPendingSections(message.spec)
                                : message.spec
                            }
                            registry={
                              message.provisional ? previewRegistry : registry
                            }
                            loading={
                              isStreaming && index === messages.length - 1
                            }
                          />
                        </div>
                      </StateProvider>
                    )}
                  </div>
                ))}
              </div>
              <p aria-label="Conversation token usage">
                Tokens — Cached input: {usage.cachedInput.toLocaleString()};
                uncached input: {usage.uncachedInput.toLocaleString()}; output:{" "}
                {usage.output.toLocaleString()}
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const prompt = new FormData(event.currentTarget).get(
                    "prompt"
                  );
                  if (typeof prompt === "string" && prompt.trim()) {
                    void send(prompt.trim());
                    event.currentTarget.reset();
                  }
                }}
                style={{ display: "flex", gap: "12px", marginBottom: "16px" }}
              >
                <input
                  name="prompt"
                  aria-label="Describe what you want"
                  placeholder="Describe what you want..."
                  required
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "1px solid #e7dfd1",
                    borderRadius: "6px",
                  }}
                />
                <button type="submit" disabled={isStreaming}>
                  {isStreaming ? "Generating…" : "Generate"}
                </button>
                <button
                  type="button"
                  onClick={clear}
                  disabled={
                    !messages.length &&
                    !error &&
                    usage.cachedInput + usage.uncachedInput + usage.output === 0
                  }
                >
                  New conversation
                </button>
              </form>
              {error && (
                <LocalEditorNotice
                  title="Generation Error"
                  body={error.message}
                  tone="error"
                />
              )}
            </ValidationProvider>
          </ActionProvider>
        </VisibilityProvider>
      </StateProvider>
    </JsonRenderEditingContext.Provider>
  );
};

const pendingSectionType = "__VisualEditorPendingSection";

/** Placeholder elements are preview-only and never enter accepted history. */
const withPendingSections = (spec: Spec): Spec => {
  const pending = new Set<string>([spec.root]);
  for (const element of Object.values(spec.elements)) {
    for (const key of [
      ...(element.children ?? []),
      ...Object.values(element.slots ?? {}).flat(),
    ])
      pending.add(key);
  }
  return {
    ...spec,
    elements: {
      ...Object.fromEntries(
        [...pending]
          .filter((key) => !Object.hasOwn(spec.elements, key))
          .map((key) => [
            key,
            { type: pendingSectionType, props: {}, children: [] },
          ])
      ),
      ...spec.elements,
    },
  };
};
