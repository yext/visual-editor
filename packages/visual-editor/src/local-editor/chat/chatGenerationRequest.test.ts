import { afterEach, expect, it, vi } from "vitest";
import type { LayoutGenerationRequest } from "../../internal/generation/editProtocol.ts";
import { requestChatGeneration } from "./chatGenerationRequest.ts";

const request: LayoutGenerationRequest = {
  mode: "create",
  layoutId: "test",
  messages: [{ role: "user", content: "Create" }],
  currentData: { content: [] },
};
const accepted = { type: "accepted", text: "Created", spec: { content: [] } };
const headers = { "X-Visual-Editor-Generation": "strict-puck-overrides-v2" };
const wire = (...events: unknown[]) =>
  events.map((event) => JSON.stringify(event)).join("\n");
afterEach(() => vi.unstubAllGlobals());
const send = (onUsage = vi.fn(), signal = new AbortController().signal) =>
  requestChatGeneration("/generate", request, signal, "correlation", onUsage);

it("accounts for usage and accepts a complete validated response", async () => {
  const usage = { cachedInput: 1, uncachedInput: 2, output: 3 };
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(wire({ type: "usage", usage }, accepted), { headers })
    )
  );
  const onUsage = vi.fn();
  expect(await send(onUsage)).toEqual(accepted);
  expect(onUsage).toHaveBeenCalledWith(usage);
});
it("does not accept output before EOF or after a broken transport", async () => {
  let stream!: ReadableStreamDefaultController<Uint8Array>;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              stream = controller;
            },
          }),
          { headers }
        )
    )
  );
  const finished = vi.fn();
  const pending = send().then(finished);
  await vi.waitFor(() => expect(stream).toBeDefined());
  stream.enqueue(new TextEncoder().encode(wire(accepted) + "\n"));
  await Promise.resolve();
  expect(finished).not.toHaveBeenCalled();
  stream.error(new Error("Disconnected"));
  await expect(pending).rejects.toMatchObject({ transport: true });
});
it("cancels a stalled response body", async () => {
  const controller = new AbortController();
  const cancel = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(new ReadableStream({ cancel }), { headers }))
  );
  const pending = send(vi.fn(), controller.signal);
  await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
  controller.abort();
  await expect(pending).rejects.toThrow();
  expect(cancel).toHaveBeenCalled();
});
it.each([
  [wire(accepted, accepted), { transport: true }],
  [
    wire({
      type: "error",
      error: "Bad output",
      retryable: true,
      validationFeedback: "Fix field",
    }),
    { retryable: true, feedback: "Fix field" },
  ],
  [wire({ type: "accepted", text: 42, spec: null }), { retryable: true }],
  ["", { transport: true }],
  ["{invalid", { transport: true }],
])("rejects unusable responses (%#)", async (body, expected) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(body as string, { headers }))
  );
  await expect(send()).rejects.toMatchObject(expected as object);
});
it("does not accept invalid token counts", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          wire(
            {
              type: "usage",
              usage: { cachedInput: -1, uncachedInput: 2, output: 0 },
            },
            accepted
          ),
          { headers }
        )
    )
  );
  const usage = vi.fn();
  await expect(send(usage)).rejects.toThrow();
  expect(usage).not.toHaveBeenCalled();
});

it.each([
  [422, false],
  [503, true],
  [429, true],
])(
  "distinguishes request validation from transport failures (HTTP %s)",
  async (status, transport) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: "Request failed" }), {
            status: status as number,
          })
      )
    );
    await expect(send()).rejects.toMatchObject({
      message: "Request failed",
      retryable: false,
      transport,
    });
  }
);
