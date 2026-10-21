import { Puck, useGetPuck, type Config, type Data } from "@puckeditor/core";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { z } from "zod";
import { MainContent } from "../../../components/helpers/MainContent.tsx";
import { installLocalGenerationHost } from "../../../local-editor/localGenerationHost.ts";
import { createPuckGenerationCatalog } from "../../../utils/generationCatalog.ts";
import { LayoutGenerationChatBridge } from "../chat/LayoutGenerationChatBridge.tsx";
import {
  LayoutGenerationChatContext,
  LayoutGenerationChatUiProvider,
} from "../chat/contexts.tsx";
import { useLayoutGenerationChat } from "../chat/useLayoutGenerationChat.ts";
import type { GenerationEnvironment } from "../shared/contracts.ts";
import { creation, heading } from "../testing/creationFixtures.ts";
import { createLocalMessageTransport } from "../transport/messageTransport.ts";
let disposeHost: (() => void) | undefined;
const chatConfig = {
  components: {
    MainContent,
    Heading: {
      generation: { props: z.object({ text: z.string() }) },
      fields: { text: { type: "text" as const } },
      render: ({ text }: any) => <h2>{text}</h2>,
    },
  },
};

beforeEach(() => {
  if (!window.matchMedia) {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    }));
  }
  const error = console.error;
  vi.spyOn(console, "error").mockImplementation((...args) => {
    if (!String(args[0]).includes("Could not parse CSS stylesheet")) {
      error(...args);
    }
  });
});
afterEach(() => {
  cleanup();
  disposeHost?.();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const enqueueEvent = (
  stream: ReadableStreamDefaultController<Uint8Array>,
  value: object
) => {
  const bytes = new TextEncoder().encode(`data: ${JSON.stringify(value)}\n\n`);
  for (const byte of bytes) stream.enqueue(new Uint8Array([byte]));
};
const setup = async (rejectSecond = false) => {
  let chat!: ReturnType<typeof useLayoutGenerationChat>;
  let puck!: ReturnType<typeof useGetPuck>;
  let stream!: ReadableStreamDefaultController<Uint8Array>;
  const requests: string[] = [];
  let generationSignal: AbortSignal;
  const mounts = vi.fn();
  const config: Config = {
    ...chatConfig,
    components: {
      ...chatConfig.components,
      MainContent,
      Heading: {
        ...chatConfig.components.Heading,
        resolveData: (data: any) => {
          if (rejectSecond && data.props.text === "Second") {
            throw new Error("Rejected second section");
          }
          return data;
        },
        render: ({ text }: any) => {
          React.useEffect(() => {
            mounts(text);
          }, []);
          return <h2 style={{ height: 300, margin: 0 }}>{text}</h2>;
        },
      },
    },
  };
  const environment: GenerationEnvironment = {
    catalog: createPuckGenerationCatalog(config.components),
    model: "test",
    locales: ["en"],
    diagnostics: { log: vi.fn(), report: vi.fn() },
    transport: createLocalMessageTransport(),
  };
  disposeHost = installLocalGenerationHost("/generate");
  if (navigator.userAgent.includes("jsdom")) {
    vi.spyOn(window, "postMessage").mockImplementation((data) => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data,
          source: window,
          origin: window.location.origin,
        })
      );
    });
  }
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: unknown, options?: RequestInit) => {
      const body = JSON.parse(options!.body as string);
      requests.push(body.text.format.name);
      if (body.text.format.name === "puck_generation_preparation") {
        return new Response(
          JSON.stringify({
            status: "completed",
            output_text: JSON.stringify({
              question: null,
              translationMode: "defaultOnly",
              cardCounts: [],
            }),
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
      generationSignal = options!.signal as AbortSignal;
      return new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            stream = controller;
          },
        }),
        { headers: { "Content-Type": "text/event-stream" } }
      );
    })
  );
  const baseline: Data = {
    root: {},
    content: [{ type: "MainContent", props: { id: "main", content: [] } }],
  };
  const Capture = () => {
    puck = useGetPuck();
    return null;
  };
  const Harness = () => {
    chat = useLayoutGenerationChat(environment, "layout");
    return (
      <LayoutGenerationChatContext.Provider value={chat.canvas}>
        <LayoutGenerationChatUiProvider chat={chat} disabled={false}>
          <Puck
            config={config}
            data={baseline}
            iframe={{ enabled: !navigator.userAgent.includes("jsdom") }}
          >
            <div data-test-viewport style={{ height: 350, overflowY: "auto" }}>
              <Puck.Preview />
            </div>
            <LayoutGenerationChatBridge
              streamDocument={React.useMemo(() => ({ locale: "en" }), [])}
            />
            <Capture />
          </Puck>
        </LayoutGenerationChatUiProvider>
      </LayoutGenerationChatContext.Provider>
    );
  };
  render(<Harness />);
  await waitFor(() => expect(chat.ready).toBe(true));
  let pending!: Promise<void>;
  act(() => {
    pending = chat.send("Create a page");
  });
  await waitFor(() => expect(stream).toBeDefined());
  const wire = JSON.stringify(
    creation([heading("First 世界"), heading("Second")])
  );
  const boundary = wire.indexOf(',{"type":"Heading"');
  return {
    chat: () => chat,
    generationSignal: () => generationSignal,
    puck: () => puck(),
    mounts,
    pending,
    requests,
    baseline,
    first: async () => {
      await act(async () => {
        enqueueEvent(stream, {
          type: "response.output_text.delta",
          delta: wire.slice(0, boundary),
        });
      });
      await waitFor(() =>
        expect(puck().appState.data.content[0].props.content).toHaveLength(1)
      );
      await waitFor(() => expect(mounts).toHaveBeenCalledWith("First 世界"));
    },
    rest: async (complete = true) => {
      if (!chat.isCreating) {
        await pending;
        return;
      }
      await act(async () => {
        enqueueEvent(stream, {
          type: "response.output_text.delta",
          delta: wire.slice(boundary),
        });
        if (complete) {
          enqueueEvent(stream, {
            type: "response.completed",
            response: { status: "completed", output_text: wire },
          });
        }
        stream.close();
        await pending;
      });
    },
  };
};

it("reveals before completion, preserves mounted sections, and records one undo entry", async () => {
  const run = await setup();
  await run.first();
  expect(run.chat().isCreating).toBe(true);
  expect(run.puck().history.histories).toHaveLength(1);
  const mainId = run.puck().appState.data.content[0].props.id;
  const firstId = run.puck().appState.data.content[0].props.content[0].props.id;
  const frame = document.querySelector("iframe");
  await run.rest();
  expect(run.chat().error).toBeNull();
  expect(run.chat().isCreating).toBe(false);
  expect(run.puck().appState.data.content[0].props.id).toBe(mainId);
  expect(run.puck().appState.data.content[0].props.content[0].props.id).toBe(
    firstId
  );
  expect(
    run.mounts.mock.calls.filter(([text]) => text === "First 世界")
  ).toHaveLength(1);
  expect(document.querySelector("iframe")).toBe(frame);
  expect(run.puck().history.histories).toHaveLength(2);
  await act(async () => run.puck().history.back());
  expect(run.puck().appState.data.content[0].props.content).toHaveLength(0);
  await act(async () => run.puck().history.forward());
  expect(run.puck().appState.data.content[0].props.content).toHaveLength(2);
});

it.each(["cancel", "truncated", "resolver"])(
  "discards uncommitted previews and clears loading after %s",
  async (reason) => {
    const run = await setup(reason === "resolver");
    await run.first();
    if (reason === "cancel") {
      act(() => run.chat().cancel());
      await run.rest();
      await waitFor(() => expect(run.generationSignal().aborted).toBe(true));
    } else {
      await run.rest(reason !== "truncated");
    }
    expect(run.puck().appState.data.content[0].props.content).toHaveLength(0);
    expect(run.chat().isStreaming).toBe(false);
    expect(run.chat().isCreating).toBe(false);
    expect(run.chat().messages.at(-1)?.pending).toBeFalsy();
    if (reason === "truncated") {
      expect(run.chat().error?.message).toContain("interrupted");
    }
    expect(
      run.requests.filter((name) => name === "puck_generation")
    ).toHaveLength(1);
    expect(run.puck().history.histories).toHaveLength(1);
  }
);
