import {
  Puck,
  blocksPlugin,
  createUsePuck,
  outlinePlugin,
  useGetPuck,
  type Config,
  type Data,
} from "@puckeditor/core";
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, vi } from "vitest";
import { z } from "zod";
import { migrationRegistry } from "../../../components/migrations/migrationRegistry.ts";
import { ErrorProvider } from "../../../contexts/ErrorContext.tsx";
import type { YextComponentConfig } from "../../../fields/fields.ts";
import { TemplatePropsContext } from "../../../hooks/useDocument.tsx";
import { LayoutPuckOverride } from "../../components/LayoutPuckOverride.tsx";
import {
  LayoutGenerationChatContext,
  LayoutGenerationChatUiProvider,
} from "../chat/contexts.tsx";
import { layoutGenerationChatPlugin } from "../chat/layoutGenerationChatPlugin.tsx";
import { useLayoutGenerationChat } from "../chat/useLayoutGenerationChat.ts";
import { testGenerationEnvironment } from "./executorFixtures.ts";

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
  const plugin = usePuck((puck) => puck.appState.ui.plugin.current);
  return (
    <>
      <output aria-label="History index">{index}</output>
      <output aria-label="Current plugin">{plugin}</output>
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
const chatPlugins = [
  { ...blocksPlugin(), label: "Sections" },
  outlinePlugin(),
  layoutGenerationChatPlugin,
];
const ChatPuckOverride = ({ children }: { children: React.ReactNode }) => (
  <LayoutPuckOverride>
    {children}
    <Controls />
  </LayoutPuckOverride>
);

/** Puck's current rail renders clickable labels rather than button elements. */
export const openChat = () => {
  const navigation = screen.getByRole("navigation", { hidden: true });
  // Puck normally reveals the root through CSS, which JSDOM cannot parse.
  navigation.closest<HTMLElement>(".Puck")!.style.visibility = "visible";
  fireEvent.click(within(navigation).getByText("Layout Assistant"));
};

export const ChatHarness = ({
  layoutId = "location",
  locale = "en",
  entityId = "one",
  config = chatConfig,
  initialData = layout(),
  children,
}: {
  layoutId?: string;
  locale?: string;
  entityId?: string;
  config?: Config;
  initialData?: Data;
  children?: React.ReactNode;
}) => {
  const chat = useLayoutGenerationChat(
    testGenerationEnvironment("/local/generate", config),
    layoutId
  );
  return (
    <ErrorProvider>
      <TemplatePropsContext.Provider
        value={{ document: { id: entityId, locale } }}
      >
        <LayoutGenerationChatUiProvider
          key={layoutId}
          chat={chat}
          disabled={!chat.ready}
        >
          <LayoutGenerationChatContext.Provider value={chat.canvas}>
            {children}
            <Puck
              key={`${layoutId}:${locale}`}
              config={config}
              data={initialData}
              iframe={{ enabled: false }}
              plugins={chatPlugins}
              overrides={{ puck: ChatPuckOverride }}
            />
          </LayoutGenerationChatContext.Provider>
        </LayoutGenerationChatUiProvider>
      </TemplatePropsContext.Provider>
    </ErrorProvider>
  );
};

// Puck injects modern CSS that JSDOM cannot parse; emulate only panel visibility.
const panelStyles = document.createElement("style");
panelStyles.textContent = `
  .Puck { visibility: visible !important; }
  [class*="PuckPluginTab_"] { display: none; }
  [class*="PuckPluginTab--visible_"] { display: flex; }
`;
// Leave all other errors visible.
beforeEach(() => {
  // Puck's canvas schedules a loader timer without cancelling it on unmount.
  vi.useFakeTimers({
    shouldAdvanceTime: true,
    toFake: ["setTimeout", "clearTimeout"],
  });
  document.head.append(panelStyles);
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  }));
  const originalError = console.error;
  vi.spyOn(console, "error").mockImplementation((...args) => {
    if (String(args[0]).includes("Could not parse CSS stylesheet")) {
      return;
    }
    originalError(...args);
  });
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  panelStyles.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
