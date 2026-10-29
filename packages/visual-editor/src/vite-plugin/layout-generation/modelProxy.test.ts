// @vitest-environment node
import type { IncomingMessage, ServerResponse } from "node:http";
import { Writable } from "node:stream";
import { afterEach, expect, it, vi } from "vitest";
import {
  GENERATION_GATEWAY_URL,
  handleLocalEditorModelRequest,
} from "./modelProxy.ts";

const body = {
  model: "configured",
  stream: true,
  max_output_tokens: 2048,
  instructions: "Synthetic instructions",
  input: [{ role: "user", content: "Synthetic prompt" }],
  text: {
    format: { type: "json_schema", name: "test", strict: true, schema: {} },
  },
};
class Reply extends Writable {
  statusCode = 0;
  headers = new Headers();
  chunks: Buffer[] = [];
  setHeader(name: string, value: string) {
    this.headers.set(name, value);
  }
  flushHeaders() {}
  get headersSent() {
    return this.statusCode === 200;
  }
  _write(chunk: Buffer, _encoding: string, callback: () => void) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }
  get text() {
    return Buffer.concat(this.chunks).toString("utf8");
  }
}
const run = (response: Reply, payload: unknown = body, method = "POST") =>
  handleLocalEditorModelRequest(
    {
      method,
      body: payload,
      headers: {
        "x-visual-editor-correlation-id":
          "11111111-1111-4111-8111-111111111111",
      },
    } as unknown as IncomingMessage,
    response as unknown as ServerResponse,
    { model: "configured", log: vi.fn() }
  );
afterEach(() => vi.unstubAllGlobals());
it("forwards prepared requests, existing headers and raw response bytes", async () => {
  const wire =
    'data: {"type":"response.output_text.delta","delta":"Français"}\n\n';
  const fetchMock = vi.fn(
    async () =>
      new Response(wire, { headers: { "Content-Type": "text/event-stream" } })
  );
  vi.stubGlobal("fetch", fetchMock);
  const response = new Reply();
  await run(response);
  expect(response.text).toBe(wire);
  expect(response.headers.get("Content-Type")).toBe("text/event-stream");
  expect(fetchMock).toHaveBeenCalledWith(
    GENERATION_GATEWAY_URL,
    expect.objectContaining({
      body: JSON.stringify(body),
      headers: expect.objectContaining({
        "Yext-Business-Id": "1000152098",
        "Correlation-Id": "11111111-1111-4111-8111-111111111111",
      }),
    })
  );
});
it.each([400, 408, 429, 500])(
  "preserves upstream HTTP %s for client failure classification",
  async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Upstream failure", { status }))
    );
    const response = new Reply();
    await run(response);
    expect(response.statusCode).toBe(status);
    expect(JSON.parse(response.text).error).toContain(`HTTP ${status}`);
  }
);
it("rejects invalid requests and stale model configuration before upstream calls", async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  for (const payload of [{}, { ...body, model: "stale" }]) {
    const response = new Reply();
    await run(response, payload);
    expect(response.statusCode).toBe(400);
  }
  const response = new Reply();
  await run(response, body, "GET");
  expect(response.statusCode).toBe(405);
  expect(fetchMock).not.toHaveBeenCalled();
});
it("aborts upstream work when the browser disconnects", async () => {
  let signal!: AbortSignal;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          signal = init.signal;
          signal.addEventListener("abort", () => reject(signal.reason));
        })
    )
  );
  const response = new Reply();
  const pending = run(response);
  await vi.waitFor(() => expect(signal).toBeDefined());
  response.destroy();
  await pending;
  expect(signal.aborted).toBe(true);
});
