import { ErrorProvider } from "../../contexts/ErrorContext.tsx";
import { z } from "zod";
import type { YextComponentConfig } from "../../fields/fields.ts";
import { beforeEach, afterEach, vi } from "vitest";
import React from "react";
import {
  Puck,
  createUsePuck,
  useGetPuck,
  type Config,
  type Data,
} from "@puckeditor/core";
import { TemplatePropsContext } from "../../hooks/useDocument.tsx";
import { LocalEditorChat } from "./LocalEditorChat.tsx";
import { LocalEditorChatContext } from "./LocalEditorChatContext.tsx";
import { LayoutPuckOverride } from "../../internal/components/LayoutPuckOverride.tsx";
import { useLocalEditorChat } from "./useLocalEditorChat.ts";
import { migrationRegistry } from "../../components/migrations/migrationRegistry.ts";

export const layout = (text = "Original"): Data<any, Record<string, any>> => ({
  root: { props: { version: migrationRegistry.length } },
  content: [
    {
      type: "MainContent",
      props: {
        id: "main",
        content: [{ type: "Heading", props: { id: "heading", text } }],
      },
    },
  ],
  zones: {},
});
export const generatedContent = (text = "Original") => ({
  content: layout(text).content,
});
export const chatConfig: Config & {
  components: Record<string, YextComponentConfig>;
} = {
  components: {
    MainContent: {
      generation: { props: z.object({ content: z.array(z.unknown()) }) },
      fields: { content: { type: "slot" } },
      render: ({ content: Content }) => (
        <main>
          <Content />
        </main>
      ),
    },
    Heading: {
      generation: { props: z.object({ text: z.string() }) },
      fields: { text: { type: "text" } },
      render: ({ text }) => <h2>{text}</h2>,
    },
  },
};
const usePuck = createUsePuck();
const Controls = () => {
  const getPuck = useGetPuck();
  const index = usePuck((puck) => puck.history.index);
  return (
    <>
      <output aria-label="History index">{index}</output>
      <button onClick={() => getPuck().history.back()}>Undo</button>
      <button onClick={() => getPuck().history.forward()}>Redo</button>
      <button
        onClick={() =>
          getPuck().dispatch({
            type: "setData",
            data: layout("Manual"),
            recordHistory: true,
          })
        }
      >
        Manual edit
      </button>
    </>
  );
};
export const ChatHarness = ({
  layoutId = "location",
  locale = "en",
  entityId = "one",
  config = chatConfig,
  initialData = layout(),
}: {
  layoutId?: string;
  locale?: string;
  entityId?: string;
  config?: Config;
  initialData?: Data;
}) => {
  const chat = useLocalEditorChat("/local/generate", layoutId);
  return (
    <ErrorProvider>
      <TemplatePropsContext.Provider
        value={{ document: { id: entityId, locale } }}
      >
        <LocalEditorChat chat={chat} disabled={!chat.ready} />
        <LocalEditorChatContext.Provider value={chat.canvas}>
          <Puck
            key={`${layoutId}:${locale}`}
            config={config}
            data={initialData}
            iframe={{ enabled: false }}
            overrides={{ puck: LayoutPuckOverride }}
          >
            <Puck.Preview />
            <Controls />
          </Puck>
        </LocalEditorChatContext.Provider>
      </TemplatePropsContext.Provider>
    </ErrorProvider>
  );
};

// Puck injects modern CSS that JSDOM cannot parse; leave all other errors visible.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  }));
  const originalError = console.error;
  vi.spyOn(console, "error").mockImplementation((...args) => {
    if (String(args[0]).includes("Could not parse CSS stylesheet")) return;
    originalError(...args);
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
