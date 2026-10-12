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
import { ChatHarness } from "./chatTestUtils.tsx";

// Document/manifest routes are unrelated to generation and load Node-only tooling.
vi.mock("../../vite-plugin/local-editor/data.ts", () => ({
  getLocalEditorDocument: vi.fn(),
  getLocalEditorManifest: vi.fn(),
}));

afterEach(() => vi.unstubAllGlobals());

it("renders decoded prose and complete validated sections through the real server before upstream completion", async () => {
  let upstream!: ReadableStreamDefaultController<Uint8Array>;
  let running!: Promise<void>;
  const headingSchema = z.object({ text: z.string() });
  const catalog = createPuckGenerationCatalog({
    Heading: { props: headingSchema },
  });
  const fetchMock = vi.fn((url: string, init?: RequestInit) => {
    if (url !== "/local/generate")
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
  render(<ChatHarness initialData={{ root: { props: {} }, content: [] }} />);
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
  await delta('{"text":"Building');
  await screen.findByText("Building");
  await delta(
    ` the page.","spec":{"content":[{"type":"MainContent","props":{"id":"main","content":[{"type":"Heading","props":{"id":"first","text":"First`
  );
  expect(screen.queryByRole("heading")).toBeNull();
  await delta(
    ' section"}},{"type":"Heading","props":{"id":"second","text":"Second'
  );
  await screen.findByText("First section", { selector: "h2" });
  expect(screen.queryByText("Second section", { selector: "h2" })).toBeNull();
  await delta(' section"}}]}}]}}');
  await screen.findByText("Second section", { selector: "h2" });
  // The gateway is still open: neither response.completed nor acceptance has arrived.
  expect(screen.getByText(/Editor updates are provisional/)).toBeDefined();
  await act(async () => {
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
  ).toHaveLength(1);
});
