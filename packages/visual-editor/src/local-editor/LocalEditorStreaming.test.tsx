import React from "react";
import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { z } from "zod";
import { handleLocalEditorGenerationRequest } from "../vite-plugin/local-editor/generation.ts";
import { LocalEditorJsonRender } from "./LocalEditorJsonRender.tsx";
import { JsonRenderSection } from "./JsonRenderSection.tsx";

// Document/manifest routes are unrelated to generation and load Node-only tooling.
vi.mock("../vite-plugin/local-editor/data.ts", () => ({
  getLocalEditorDocument: vi.fn(),
  getLocalEditorManifest: vi.fn(),
}));

afterEach(() => vi.unstubAllGlobals());

it("renders decoded prose and complete validated sections through the real server before upstream completion", async () => {
  let upstream!: ReadableStreamDefaultController<Uint8Array>;
  let running!: Promise<void>;
  const headingSchema = z.object({ text: z.string() });
  const catalog = defineCatalog(schema, {
    components: {
      MainContent: { props: z.object({}), slots: ["default"] },
      Heading: { props: headingSchema, slots: [] },
    },
    actions: {},
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
        { model: "test-model", loadCatalog: async () => catalog, log: () => {} }
      );
      void running.catch((error) => {
        downstream.error(error);
        reject(error);
      });
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  render(
    <LocalEditorJsonRender
      api="/local/generate"
      registry={{
        MainContent: ({ children }) => <main>{children}</main>,
        Heading: ({ element }) => (
          <JsonRenderSection
            render={({ text }) => <h2>{text}</h2>}
            schema={headingSchema}
            props={element.props}
          />
        ),
      }}
    />
  );
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Create two sections" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Generate" }));
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
    ' the page.","spec":{"root":"page","state":{},"elements":{"page":{"type":"MainContent","props":{},"children":["first","second"]},"first":{"type":"Heading","props":{"text":"First'
  );
  await waitFor(() =>
    expect(screen.getAllByLabelText("Section pending")).toHaveLength(2)
  );
  expect(screen.queryByRole("heading")).toBeNull();
  await delta(' section"}},"second":{"type":"Heading","props":{"text":"Second');
  await screen.findByRole("heading", { name: "First section" });
  expect(screen.getAllByLabelText("Section pending")).toHaveLength(1);
  expect(
    (screen.getByRole("button", { name: "Generating…" }) as HTMLButtonElement)
      .disabled
  ).toBe(true);
  await delta(' section"}}}}}');
  await screen.findByRole("heading", { name: "Second section" });
  expect(screen.queryByLabelText("Section pending")).toBeNull();
  // The gateway is still open: neither response.completed nor acceptance has arrived.
  expect(screen.getByRole("status").textContent).toContain("Provisional");
  await act(async () => {
    emit({ type: "response.completed" });
    upstream.close();
    await running;
  });
  await screen.findByRole("button", { name: "Generate" });
  expect(screen.queryByRole("status")).toBeNull();
  expect(
    fetchMock.mock.calls.filter(([url]) => url !== "/local/generate")
  ).toHaveLength(1);
});
