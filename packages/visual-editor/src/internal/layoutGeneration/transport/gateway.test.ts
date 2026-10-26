import { describe, expect, it, vi } from "vitest";
import { requestGenerationOutput } from "./gateway.ts";
import { ModelTransportError } from "./modelTransport.ts";

const read = (
  wire: string | Uint8Array[],
  contentType = "text/event-stream",
  onDelta?: (delta: string) => Promise<void>,
  log = vi.fn()
) =>
  requestGenerationOutput({
    utf8Bytes: (text) => new TextEncoder().encode(text).byteLength,
    serializedRequestBody: "{}",
    model: "test",
    maxOutputTokens: 2048,
    signal: new AbortController().signal,
    correlationId: "local-diagnostic",
    log,
    onDelta,
    transport: async () => ({
      contentType,
      body:
        typeof wire === "string"
          ? new Response(wire).body!
          : new ReadableStream<Uint8Array>({
              start(controller) {
                wire.forEach((chunk) => controller.enqueue(chunk));
                controller.close();
              },
            }),
    }),
  });
const event = (value: object) => `data: ${JSON.stringify(value)}\n\n`;
const completion = (status: string | undefined = "completed") => ({
  type: "response.completed",
  response: { status, output_text: '{"text":"世界"}' },
});
describe("shared Responses API parser", () => {
  it.each(["text/event-stream", "application/json"])(
    "ignores provider token usage in output and diagnostics for %s",
    async (contentType) => {
      for (const status of ["completed", "incomplete"]) {
        const log = vi.fn();
        const response = {
          status,
          output_text: "Hello",
          usage: { input_tokens: 20, output_tokens: 10 },
        };
        const wire =
          contentType === "application/json"
            ? JSON.stringify(response)
            : event({ type: `response.${status}`, response });
        const result = read(wire, contentType, undefined, log);
        if (status === "completed") {
          await expect(result).resolves.toBe("Hello");
        } else {
          await expect(result).rejects.toThrow();
        }
        expect(log).toHaveBeenCalled();
        expect(JSON.stringify(log.mock.calls)).not.toContain('"usage"');
      }
    }
  );
  it.each([
    undefined,
    "in_progress",
    "queued",
    "cancelled",
    "failed",
    "incomplete",
  ])("requires completed status for JSON and SSE: %s", async (status) => {
    const response = { status, output_text: '{"valid":"json"}' };
    await expect(
      read(JSON.stringify(response), "application/json")
    ).rejects.toThrow();
    await expect(
      read(event({ type: "response.completed", response }))
    ).rejects.toThrow();
  });
  it.each([
    "response.output_text.done",
    "response.output_item.done",
    "response.content_part.done",
  ])(
    "rejects EOF after valid JSON and %s without provider completion",
    async (type) => {
      await expect(
        read(
          event({
            type: "response.output_text.delta",
            delta: '{"valid":"json"}',
          }) +
            event({ type }) +
            "data: [DONE]\n\n"
        )
      ).rejects.toMatchObject({
        transport: true,
        message: expect.stringContaining("interrupted"),
      });
    }
  );
  it.each(["error", "response.failed", "response.incomplete"])(
    "rejects provider failure %s even after completion",
    async (type) => {
      await expect(
        read(event(completion()) + event({ type }))
      ).rejects.toMatchObject({ transport: false });
    }
  );
  it.each(["\n", "\r\n", "\r"])(
    "decodes byte-split UTF-8, multiline data, and SSE delimiters %j",
    async (newline) => {
      const wire = (
        "event: response.completed\ndata: {\ndata: " +
        JSON.stringify(completion()).slice(1) +
        "\n\n"
      ).replaceAll("\n", newline);
      const chunks = Array.from(
        new TextEncoder().encode(wire),
        (byte) => new Uint8Array([byte])
      );
      expect(await read(chunks)).toBe('{"text":"世界"}');
    }
  );
  it.each(["", "\n"])(
    "rejects an unterminated completion frame with suffix %j",
    async (suffix) => {
      const onDelta = vi.fn();
      await expect(
        read(
          event(completion()).trimEnd() + suffix,
          "text/event-stream",
          onDelta
        )
      ).rejects.toMatchObject({ transport: true });
      expect(onDelta).not.toHaveBeenCalled();
    }
  );
  it("rejects a truncated frame after a complete event", async () => {
    await expect(
      read(event(completion()) + 'data: {"type":')
    ).rejects.toMatchObject({ transport: true });
  });
  it.each(["text/event-stream", "application/json"])(
    "rejects truncated UTF-8 in %s",
    async (contentType) => {
      const prefix =
        contentType === "application/json"
          ? JSON.stringify(completion().response)
          : event(completion());
      await expect(
        read(
          [new TextEncoder().encode(prefix), new Uint8Array([0xe4, 0xb8])],
          contentType
        )
      ).rejects.toMatchObject({ transport: true });
    }
  );
  it("parses the full JSON fallback, rejecting trailing content", async () => {
    await expect(
      read(JSON.stringify(completion().response) + "{}", "application/json")
    ).rejects.toMatchObject({ transport: true });
  });
  it("supports JSON fallback", async () => {
    expect(
      await read(
        JSON.stringify({ status: "completed", output_text: "Hello" }),
        "application/json"
      )
    ).toBe("Hello");
  });
  it.each(["text/event-stream", "application/json"])(
    "accepts completed output containing long repeated text in %s",
    async (contentType) => {
      const text = JSON.stringify({
        text: "Sample repeated text for a greeting. ".repeat(300),
      });
      const response = { status: "completed", output_text: text };
      const wire =
        contentType === "application/json"
          ? JSON.stringify(response)
          : event({ type: "response.output_text.delta", delta: text }) +
            event({ type: "response.completed", response });
      expect(await read(wire, contentType)).toBe(text);
    }
  );
  it.each([
    ["data: {broken}\n\n", true],
    ['data: {"type":"response.output_text.delta","delta":"partial"}\n\n', true],
    ['data: {"type":"response.refusal.done"}\n\n', false],
    [
      'data: {"type":"response.incomplete","response":{"status":"incomplete","incomplete_details":{"reason":"max_output_tokens"}}}\n\n',
      false,
    ],
  ])("classifies incomplete or failed streams", async (wire, transport) => {
    await expect(read(wire)).rejects.toMatchObject({ transport });
  });
  it("preserves adapter transport classifications", async () => {
    await expect(
      requestGenerationOutput({
        utf8Bytes: (text) => new TextEncoder().encode(text).byteLength,
        serializedRequestBody: "{}",
        model: "test",
        maxOutputTokens: 10,
        signal: new AbortController().signal,
        correlationId: "local",
        log: vi.fn(),
        transport: async () => {
          throw new ModelTransportError("bad", false);
        },
      })
    ).rejects.toMatchObject({ transport: false });
  });
  it.each(["application/json", "text/event-stream"])(
    "identifies zero-usage output-budget failures before generation in %s",
    async (contentType) => {
      const response = {
        status: "incomplete",
        incomplete_details: { reason: "max_output_tokens" },
        usage: { input_tokens: 0, output_tokens: 0 },
      };
      const wire =
        contentType === "application/json"
          ? JSON.stringify(response)
          : event({ type: "response.incomplete", response });
      await expect(read(wire, contentType)).rejects.toMatchObject({
        outputBytes: 0,
        cause: { beforeGeneration: true },
        message: expect.stringContaining("before generating any content"),
      });
    }
  );
  it.each([
    undefined,
    { input_tokens: 0, output_tokens: 100 },
    { input_tokens: 100, output_tokens: 0 },
    {
      input_tokens: 0,
      output_tokens: 0,
      output_tokens_details: { reasoning_tokens: 100 },
    },
  ])(
    "does not identify missing or nonzero usage as a pre-generation budget rejection (%j)",
    async (usage) => {
      await expect(
        read(
          event({
            type: "response.incomplete",
            response: {
              status: "incomplete",
              incomplete_details: { reason: "max_output_tokens" },
              usage,
            },
          })
        )
      ).rejects.toMatchObject({ cause: { beforeGeneration: false } });
    }
  );
});
