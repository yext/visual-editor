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
import { LocalEditorChatBridge } from "./LocalEditorChatBridge.tsx";
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
export const chatConfig: Config = {
  components: {
    MainContent: {
      fields: { content: { type: "slot" } },
      render: ({ content: Content }) => (
        <main>
          <Content />
        </main>
      ),
    },
    Heading: {
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
  config = chatConfig,
  initialData = layout(),
}: {
  layoutId?: string;
  locale?: string;
  config?: Config;
  initialData?: Data;
}) => {
  const chat = useLocalEditorChat("/local/generate", layoutId);
  return (
    <TemplatePropsContext.Provider value={{ document: { locale } }}>
      <LocalEditorChat chat={chat} disabled={!chat.ready} />
      <LocalEditorChatContext.Provider value={chat.canvas}>
        <Puck
          key={`${layoutId}:${locale}`}
          config={config}
          data={initialData}
          iframe={{ enabled: false }}
        >
          <Puck.Preview />
          <Controls />
          <LocalEditorChatBridge />
        </Puck>
      </LocalEditorChatContext.Provider>
    </TemplatePropsContext.Provider>
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
