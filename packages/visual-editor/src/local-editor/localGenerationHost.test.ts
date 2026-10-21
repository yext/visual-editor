import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { generationRequestFixture } from "../internal/generation/testing/iframeFixtures.ts";
import type { GenerationResponse } from "../internal/generation/transport/messageTransport.ts";
import { installLocalGenerationHost } from "./localGenerationHost.ts";

const body = generationRequestFixture.payload.body;
const origin = window.location.origin;
const dispatch = (data: unknown, options: Partial<MessageEventInit> = {}) =>
  window.dispatchEvent(
    new MessageEvent("message", { data, source: window, origin, ...options })
  );
const request = (
  requestId: unknown = "one",
  value: unknown = body,
  options: Partial<MessageEventInit> = {}
) =>
  dispatch(
    { type: "aiPageGenerationRequest", payload: { requestId, body: value } },
    options
  );
let dispose: () => void;
let send: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  send = vi.spyOn(window, "postMessage").mockImplementation(() => {});
  dispose = installLocalGenerationHost("/generate");
});
afterEach(() => {
  dispose();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const responses = (requestId = "one") =>
  send.mock.calls
    .map(([data]) => (data as GenerationResponse).payload)
    .filter((payload) => payload.requestId === requestId);

it("validates source, exact origin, identifiers and bodies, ignoring unrelated traffic", () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  request("one", body, { source: null });
  request("one", body, { origin: `${origin}:1234` });
  for (const requestId of [null, 1, {}, "", " "]) request(requestId);
  dispatch({ type: "aiPageGenerationResponse", payload: { requestId: "one" } });
  dispatch(null);
  expect(send).not.toHaveBeenCalled();
  for (const invalid of [
    null,
    {},
    { ...body, stream: false },
    { ...body, input: [null] },
    { ...body, text: {} },
  ])
    request("one", invalid);
  expect(fetchMock).not.toHaveBeenCalled();
  expect(responses()).toHaveLength(5);
  expect(responses()[0]).toMatchObject({ event: "error", transport: false });
});

it("forwards unchanged bodies and request correlation, streams interleaved raw bytes, and ignores active duplicates", async () => {
  const streams: ReadableStreamDefaultController<Uint8Array>[] = [];
  const fetchMock = vi.fn(
    async () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            streams.push(controller);
          },
        }),
        { headers: { "Content-Type": "text/event-stream" } }
      )
  );
  vi.stubGlobal("fetch", fetchMock);
  request();
  request();
  request("two");
  await vi.waitFor(() => expect(responses("two")[0]?.event).toBe("start"));
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[0]).toEqual([
    "/generate",
    expect.objectContaining({
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "X-Visual-Editor-Correlation-Id": "one",
      },
    }),
  ]);
  const bytes = new TextEncoder().encode("世界\ndata:");
  streams[1].enqueue(bytes.subarray(0, 1));
  streams[0].enqueue(bytes);
  streams[1].enqueue(bytes.subarray(1));
  streams[0].close();
  streams[1].close();
  await vi.waitFor(() => expect(responses("two").at(-1)?.event).toBe("end"));
  expect(responses().map((p) => p.event)).toEqual(["start", "chunk", "end"]);
  expect(responses("two").map((p) => p.event)).toEqual([
    "start",
    "chunk",
    "chunk",
    "end",
  ]);
  expect((responses()[1] as { chunk: Uint8Array }).chunk).toEqual(bytes);
  expect(send.mock.calls.every(([, target]) => target === origin)).toBe(true);
});

it.each([400, 408, 429, 500])(
  "preserves HTTP %s classification and status",
  async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: "Rejected" }), { status })
      )
    );
    request();
    await vi.waitFor(() =>
      expect(responses()).toEqual([
        {
          requestId: "one",
          event: "error",
          message: "Rejected",
          status,
          transport: status !== 400,
        },
      ])
    );
  }
);

it.each(["network", "missing body", "read"])(
  "reports a terminal transport error on %s failure",
  async (kind) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        if (kind === "network") {
          throw new Error("Offline");
        }
        return new Response(
          kind === "missing body"
            ? null
            : new ReadableStream({
                pull(controller) {
                  controller.error(new Error("Read failed"));
                },
              })
        );
      })
    );
    request();
    await vi.waitFor(() =>
      expect(responses().at(-1)).toMatchObject({
        event: "error",
        transport: true,
      })
    );
    expect(responses().filter((p) => p.event === "error")).toHaveLength(1);
    expect(responses().some((p) => p.event === "end")).toBe(false);
  }
);

it.each([false, true])(
  "cancels before/after start (%s), suppressing late replies and releasing the reader",
  async (started) => {
    let resolve!: (value: Response) => void;
    const cancelled = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ cancel: cancelled });
    const fetchMock = vi.fn(
      (_url: unknown, _options?: RequestInit) =>
        new Promise<Response>((yes) => {
          resolve = yes;
        })
    );
    vi.stubGlobal("fetch", fetchMock);
    request();
    if (started) {
      resolve(new Response(stream));
      await vi.waitFor(() => expect(responses()[0]?.event).toBe("start"));
    }
    dispatch({ type: "aiPageGenerationCancel", payload: { requestId: "one" } });
    dispatch({
      type: "aiPageGenerationCancel",
      payload: { requestId: "unknown" },
    });
    expect(fetchMock.mock.calls[0][1]!.signal!.aborted).toBe(true);
    if (!started) {
      resolve(new Response(stream));
    }
    await vi.waitFor(() => expect(cancelled).toHaveBeenCalledOnce());
    await vi.waitFor(() => expect(stream.locked).toBe(false));
    expect(responses().map((p) => p.event)).toEqual(started ? ["start"] : []);
  }
);

it("cleans up all requests and supports reinstalling without duplicate listeners", async () => {
  const fetchMock = vi.fn(
    (_url: unknown, _options?: RequestInit) => new Promise<Response>(() => {})
  );
  vi.stubGlobal("fetch", fetchMock);
  request();
  request("two");
  dispose();
  expect(
    fetchMock.mock.calls.every(([, options]) => options!.signal!.aborted)
  ).toBe(true);
  request("removed");
  expect(fetchMock).toHaveBeenCalledTimes(2);
  dispose = installLocalGenerationHost("/generate");
  request("new");
  expect(fetchMock).toHaveBeenCalledTimes(3);
});
