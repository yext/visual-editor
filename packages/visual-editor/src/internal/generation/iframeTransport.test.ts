import { afterEach, describe, expect, it, vi } from "vitest";
import {
  generationRequestFixture,
  modelCompletionFixture,
} from "./testing/iframeFixtures.ts";
import { iframeModelTransport } from "./iframeTransport.ts";
import { executeGeneration } from "./engine.ts";
import { createPuckGenerationCatalog } from "../../utils/generationCatalog.ts";
import { consoleGenerationDiagnostics } from "./environment.ts";
import { createLocalModelTransport } from "../../local-editor/generationTransport.ts";
import type { ModelRequestBody } from "./modelTransport.ts";

const body: ModelRequestBody = generationRequestFixture.payload.body;
const origin = "https://dev.yext.com";
const reply = (
  requestId: string,
  payload: object,
  options: Partial<MessageEventInit> = {}
) =>
  window.dispatchEvent(
    new MessageEvent("message", {
      source: window.parent,
      origin,
      data: {
        type: "aiPageGenerationResponse",
        payload: { requestId, ...payload },
      },
      ...options,
    })
  );
const observe = () => {
  const send = vi
    .spyOn(window.parent, "postMessage")
    .mockImplementation(() => {});
  return {
    send,
    requests: () =>
      send.mock.calls
        .map(([message]) => message)
        .filter((message) => message.type === "aiPageGenerationRequest") as {
        payload: { requestId: string; body: ModelRequestBody };
      }[],
  };
};
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("iframe model transport", () => {
  it("isolates interleaved calls, sends only requestId/body, and ignores unrelated sources", async () => {
    const h = observe();
    const one = iframeModelTransport(
      body,
      new AbortController().signal,
      "local-diagnostic"
    );
    const first = h.requests()[0].payload;
    const two = iframeModelTransport(
      body,
      new AbortController().signal,
      "other-diagnostic"
    );
    const second = h.requests().at(-1)!.payload;
    expect(first.requestId).not.toBe(second.requestId);
    expect(Object.keys(first).sort()).toEqual(["body", "requestId"]);
    expect(first.body).toEqual(body);
    reply(
      first.requestId,
      { event: "start", contentType: "bad" },
      { origin: "https://example.com" }
    );
    reply(
      first.requestId,
      { event: "start", contentType: "bad" },
      { source: null }
    );
    reply("unknown", { event: "end" });
    reply(second.requestId, { event: "start", contentType: "text/plain" });
    reply(first.requestId, { event: "start", contentType: "text/plain" });
    const encoder = new TextEncoder();
    reply(second.requestId, { event: "chunk", chunk: encoder.encode("two") });
    reply(first.requestId, { event: "chunk", chunk: encoder.encode("one") });
    reply(first.requestId, { event: "end" });
    reply(second.requestId, { event: "end" });
    expect(await new Response((await one).body).text()).toBe("one");
    expect(await new Response((await two).body).text()).toBe("two");
  });

  it("cancels pending calls and removes listeners, ignoring late responses", async () => {
    const h = observe();
    const remove = vi.spyOn(window, "removeEventListener");
    const controller = new AbortController();
    const pending = iframeModelTransport(body, controller.signal, "local");
    const rejected = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    const requestId = h.requests()[0].payload.requestId;
    controller.abort();
    await rejected;
    expect(
      h.send.mock.calls.some(
        ([message]) =>
          message.type === "aiPageGenerationCancel" &&
          message.payload.requestId === requestId
      )
    ).toBe(true);
    expect(remove).toHaveBeenCalledWith("message", expect.any(Function));
    reply(requestId, { event: "start", contentType: "application/json" });
  });

  it("aborts a started stream when its signal is cancelled", async () => {
    const h = observe();
    const controller = new AbortController();
    const pending = iframeModelTransport(body, controller.signal, "local");
    reply(h.requests()[0].payload.requestId, {
      event: "start",
      contentType: "text/event-stream",
    });
    const reader = (await pending).body.getReader();
    const read = reader.read();
    const rejected = expect(read).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await rejected;
  });

  it.each([
    { event: "chunk", chunk: new Uint8Array() },
    { event: "end" },
    { event: "start", contentType: 12 },
    { event: "error", message: "bad", transport: "yes" },
    { event: "unknown" },
  ])("rejects malformed or out-of-order responses: $event", async (payload) => {
    const h = observe();
    const controller = new AbortController();
    const pending = iframeModelTransport(body, controller.signal, "local");
    const rejected = expect(pending).rejects.toMatchObject({ transport: true });
    reply(h.requests()[0].payload.requestId, payload);
    await rejected;
  });

  it("preserves parent error classification", async () => {
    const h = observe();
    const pending = iframeModelTransport(
      body,
      new AbortController().signal,
      "local"
    );
    const rejected = expect(pending).rejects.toMatchObject({
      message: "Unsupported model",
      transport: false,
      status: 400,
    });
    reply(h.requests()[0].payload.requestId, {
      event: "error",
      message: "Unsupported model",
      transport: false,
      status: 400,
    });
    await rejected;
  });
});

it("runs the same prepared request and parser through a parent harness and the local adapter", async () => {
  const h = observe();
  vi.spyOn(console, "debug").mockImplementation(() => {});
  const preparation = {
    question: "Français?",
    translationMode: null,
    cardCounts: [],
  };
  const { wire } = modelCompletionFixture(preparation);
  const input = {
    layoutId: "layout",
    currentData: { content: [] },
    mode: "prepare" as const,
    messages: [{ role: "user" as const, content: "Create page" }],
  };
  const environment = {
    model: body.model,
    catalog: createPuckGenerationCatalog({}),
    locales: ["en", "fr"],
    transport: iframeModelTransport,
    diagnostics: consoleGenerationDiagnostics,
  };
  const usage = vi.fn();
  const platform = executeGeneration(
    input,
    environment,
    new AbortController().signal,
    "editor-local",
    usage
  );
  const request = h.requests()[0].payload;
  expect(request.body.model).toBe(body.model);
  expect(request.body.instructions).toBeTruthy();
  reply(request.requestId, {
    event: "start",
    contentType: "text/event-stream",
  });
  // Each byte is its own message, including split UTF-8 and split SSE boundaries.
  for (const byte of new TextEncoder().encode(wire))
    reply(request.requestId, { event: "chunk", chunk: new Uint8Array([byte]) });
  reply(request.requestId, { event: "end" });
  expect(await platform).toEqual({ type: "prepared", preparation });
  expect(usage).toHaveBeenCalledWith({
    cachedInput: 2,
    uncachedInput: 10,
    output: 4,
  });
  const localFetch = vi.fn(
    async () =>
      new Response(wire, { headers: { "Content-Type": "text/event-stream" } })
  );
  vi.stubGlobal("fetch", localFetch);
  expect(
    await executeGeneration(
      input,
      { ...environment, transport: createLocalModelTransport("/generate") },
      new AbortController().signal,
      "local-id",
      vi.fn()
    )
  ).toEqual(await platform);
  expect(JSON.parse((localFetch.mock.calls[0] as any)[1].body)).toEqual(
    request.body
  );
});
