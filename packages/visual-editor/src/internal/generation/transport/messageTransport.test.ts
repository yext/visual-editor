import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installLocalGenerationHost } from "../../../local-editor/localGenerationHost.ts";
import { createPuckGenerationCatalog } from "../../../utils/generationCatalog.ts";
import { consoleGenerationDiagnostics } from "../shared/contracts.ts";
import {
  generationRequestFixture,
  modelCompletionFixture,
} from "../testing/iframeFixtures.ts";
import { executeGeneration } from "./executeGeneration.ts";
import {
  createLocalMessageTransport,
  iframeModelTransport,
} from "./messageTransport.ts";
import type { ModelRequestBody } from "./modelTransport.ts";

const body: ModelRequestBody = generationRequestFixture.payload.body;
let origin = "https://dev.yext.com";
let transport = iframeModelTransport;
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

describe.each(["parent", "local"])("%s message transport", (mode) => {
  beforeEach(() => {
    origin =
      mode === "parent" ? "https://dev.yext.com" : window.location.origin;
    transport =
      mode === "parent" ? iframeModelTransport : createLocalMessageTransport();
  });
  it("isolates interleaved calls, sends only requestId/body, and ignores unrelated sources", async () => {
    const h = observe();
    const one = transport(
      body,
      new AbortController().signal,
      "local-diagnostic"
    );
    const first = h.requests()[0].payload;
    const two = transport(
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
    const pending = transport(body, controller.signal, "local");
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
    const pending = transport(body, controller.signal, "local");
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

  it("starts a retry with fresh state and ignores cancelled request bytes without an acknowledgment", async () => {
    const h = observe();
    const controller = new AbortController();
    const first = transport(body, controller.signal, "same-diagnostic");
    const firstId = h.requests()[0].payload.requestId;
    reply(firstId, { event: "start", contentType: "text/plain" });
    const reader = (await first).body.getReader();
    reply(firstId, {
      event: "chunk",
      chunk: new TextEncoder().encode("partial"),
    });
    controller.abort();
    await expect(reader.read()).rejects.toMatchObject({ name: "AbortError" });

    const retry = transport(
      body,
      new AbortController().signal,
      "same-diagnostic"
    );
    const retryId = h.requests().at(-1)!.payload.requestId;
    expect(retryId).not.toBe(firstId);
    reply(retryId, { event: "start", contentType: "text/plain" });
    reply(firstId, {
      event: "chunk",
      chunk: new TextEncoder().encode("stale"),
    });
    reply(firstId, { event: "end" });
    reply(retryId, {
      event: "chunk",
      chunk: new TextEncoder().encode("fresh"),
    });
    reply(retryId, { event: "end" });
    expect(await new Response((await retry).body).text()).toBe("fresh");
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
    const pending = transport(body, controller.signal, "local");
    const rejected = expect(pending).rejects.toMatchObject({ transport: true });
    reply(h.requests()[0].payload.requestId, payload);
    await rejected;
  });

  it.each([
    { event: "start", contentType: "text/plain" },
    { event: "chunk", chunk: "not bytes" },
    { event: "error", message: "bad", transport: true, status: 999 },
  ])(
    "errors a started stream on invalid responses: $event",
    async (payload) => {
      const h = observe();
      const pending = transport(body, new AbortController().signal, "local");
      const requestId = h.requests()[0].payload.requestId;
      reply(requestId, { event: "start", contentType: "text/plain" });
      const reader = (await pending).body.getReader();
      const rejected = expect(reader.read()).rejects.toMatchObject({
        transport: true,
      });
      reply(requestId, payload);
      await rejected;
    }
  );

  it("notifies the host and removes its listener when the consumer cancels", async () => {
    const h = observe();
    const remove = vi.spyOn(window, "removeEventListener");
    const pending = transport(body, new AbortController().signal, "local");
    const requestId = h.requests()[0].payload.requestId;
    reply(requestId, { event: "start", contentType: "text/plain" });
    await (await pending).body.cancel();
    expect(h.send).toHaveBeenLastCalledWith(
      { type: "aiPageGenerationCancel", payload: { requestId } },
      origin
    );
    expect(remove).toHaveBeenCalledWith("message", expect.any(Function));
  });

  it("preserves parent error classification", async () => {
    const h = observe();
    const pending = transport(body, new AbortController().signal, "local");
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
  origin = "https://dev.yext.com";
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
  h.send.mockImplementation((data) => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data,
        source: window,
        origin: window.location.origin,
      })
    );
  });
  const dispose = installLocalGenerationHost("/generate");
  expect(
    await executeGeneration(
      input,
      { ...environment, transport: createLocalMessageTransport() },
      new AbortController().signal,
      "local-id",
      vi.fn()
    )
  ).toEqual(await platform);
  dispose();
  expect(JSON.parse((localFetch.mock.calls[0] as any)[1].body)).toEqual(
    request.body
  );
});
