import React from "react";
import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createPuckGenerationCatalog } from "../../vite-plugin/layout-generation/puckGenerationCatalog.ts";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { z } from "zod";
import { handleLocalEditorGenerationRequest } from "../../vite-plugin/layout-generation/generation.ts";
import { ChatHarness, chatConfig } from "./chatTestUtils.tsx";

// Document/manifest routes are unrelated to generation and load Node-only tooling.
vi.mock("../../vite-plugin/local-editor/data.ts", () => ({
  getLocalEditorDocument: vi.fn(),
  getLocalEditorManifest: vi.fn(),
}));

afterEach(() => vi.unstubAllGlobals());

it.each(["accepted", "rejected"])(
  "streams nested slots through the real server and restores the correct layout after %s generation",
  async (outcome) => {
    let upstream!: ReadableStreamDefaultController<Uint8Array>;
    let running!: Promise<void>;
    let gatewayCalls = 0;
    const headingSchema = z.object({ text: z.string() });
    const catalog = createPuckGenerationCatalog({
      Heading: { props: headingSchema },
      Promo: {
        props: z.object({
          slots: z.object({ HeadingSlot: z.array(z.unknown()) }),
        }),
        fields: {
          slots: {
            type: "object",
            objectFields: { HeadingSlot: { type: "slot", allow: ["Heading"] } },
          },
        },
      },
    });
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url !== "/local/generate") {
        gatewayCalls++;
        if (outcome === "rejected" && gatewayCalls > 1)
          return Promise.resolve(
            new Response(
              "data: " +
                JSON.stringify({
                  type: "response.output_text.delta",
                  delta: '{"op":"add","path":"/elements/broken","value":{}\n',
                }) +
                "\n\n",
              { headers: { "Content-Type": "text/event-stream" } }
            )
          );
        return Promise.resolve(
          new Response(
            new ReadableStream({
              start(controller) {
                upstream = controller;
              },
            }),
            { headers: { "Content-Type": "text/event-stream" } }
          )
        );
      }
      return new Promise<Response>((resolve, reject) => {
        let downstream!: ReadableStreamDefaultController<Uint8Array>;
        const body = new ReadableStream<Uint8Array>({
          start(controller) {
            downstream = controller;
          },
        });
        const headers = new Headers();
        const response = Object.assign(new EventEmitter(), {
          headersSent: false,
          setHeader: (key: string, value: string) => headers.set(key, value),
          flushHeaders: () => {
            response.headersSent = true;
            resolve(new Response(body, { headers }));
          },
          write: (line: string) =>
            downstream.enqueue(new TextEncoder().encode(line)),
          end: () => downstream.close(),
        });
        const request = Object.assign(new EventEmitter(), {
          method: "POST",
          headers: {},
          body: JSON.parse(init!.body as string),
        });
        running = handleLocalEditorGenerationRequest(
          request as unknown as IncomingMessage,
          response as unknown as ServerResponse,
          {
            model: "test-model",
            loadContext: async () => ({ catalog, locales: [] }),
            log: () => {},
          }
        );
        void running.catch((error) => {
          downstream.error(error);
          reject(error);
        });
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const config = {
      ...chatConfig,
      components: {
        ...chatConfig.components,
        Promo: {
          fields: {
            slots: {
              type: "object" as const,
              objectFields: { HeadingSlot: { type: "slot" as const } },
            },
          },
          render: ({ slots }: any) => {
            const HeadingSlot = slots.HeadingSlot;
            return (
              <section>
                <HeadingSlot />
              </section>
            );
          },
        },
      },
    };
    render(
      <ChatHarness
        config={config}
        initialData={{ root: { props: {} }, content: [] }}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Show chat" }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Create two sections" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(upstream).toBeDefined());
    const emit = (event: object) =>
      upstream.enqueue(
        new TextEncoder().encode("data: " + JSON.stringify(event) + "\n\n")
      );
    const delta = async (text: string) => {
      await act(async () =>
        emit({ type: "response.output_text.delta", delta: text })
      );
    };
    await delta("Building the page.\n");
    await screen.findByText("Building the page.");
    await delta(
      '{"op":"add","path":"/elements/first","value":{"type":"Heading","props":{"text":"First section"}}}\n'
    );
    await delta(
      '{"op":"add","path":"/elements/__puck_content_root__/children/-","value":"first"}\n'
    );
    expect(screen.queryByRole("heading")).toBeNull();
    await screen.findByText("First section", { selector: "h2" });
    expect(screen.queryByText("Second section", { selector: "h2" })).toBeNull();
    await delta(
      '{"op":"add","path":"/elements/second","value":{"type":"Heading","props":{"text":"Second section"}}}\n'
    );
    await delta(
      '{"op":"add","path":"/elements/promo","value":{"type":"Promo","props":{},"slots":{"/slots/HeadingSlot":["second"]}}}\n'
    );
    await delta(
      '{"op":"add","path":"/elements/__puck_content_root__/children/-","value":"promo"}\n'
    );
    await screen.findByText("Second section", { selector: "h2" });
    // The gateway is still open: neither response.completed nor acceptance has arrived.
    expect(screen.getByText(/Editor updates are provisional/)).toBeDefined();
    await act(async () => {
      if (outcome === "rejected")
        emit({
          type: "response.output_text.delta",
          delta: '{"op":"add","path":"/elements/broken","value":{}\n',
        });
      emit({ type: "response.completed" });
      upstream.close();
      await running;
    });
    await waitFor(() =>
      expect(
        (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement)
          .disabled
      ).toBe(false)
    );
    expect(screen.queryByText(/Editor updates are provisional/)).toBeNull();
    expect(
      fetchMock.mock.calls.filter(([url]) => url !== "/local/generate")
    ).toHaveLength(outcome === "rejected" ? 3 : 1);
    if (outcome === "rejected") {
      await waitFor(() =>
        expect(
          screen.queryByText("First section", { selector: "h2" })
        ).toBeNull()
      );
      expect(
        screen.queryByText("Second section", { selector: "h2" })
      ).toBeNull();
      expect(screen.getByLabelText("History index").textContent).toBe("0");
    } else {
      expect(
        screen.getByText("Second section", { selector: "h2" })
      ).toBeDefined();
      expect(screen.getByLabelText("History index").textContent).toBe("1");
      fireEvent.click(screen.getByText("Undo", { selector: "button" }));
      await waitFor(() =>
        expect(
          screen.queryByText("Second section", { selector: "h2" })
        ).toBeNull()
      );
      fireEvent.click(screen.getByText("Redo", { selector: "button" }));
      await screen.findByText("Second section", { selector: "h2" });
    }
  }
);
