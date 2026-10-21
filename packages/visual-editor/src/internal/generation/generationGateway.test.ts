import { describe, expect, it, vi } from "vitest";
import { requestGenerationOutput } from "./generationGateway.ts";
import { ModelTransportError } from "./modelTransport.ts";

const read = (wire: string, contentType = "text/event-stream") =>
  requestGenerationOutput({
    serializedRequestBody: "{}",
    model: "test",
    maxOutputTokens: 2048,
    signal: new AbortController().signal,
    correlationId: "local-diagnostic",
    log: vi.fn(),
    onUsage: vi.fn(),
    transport: async () => ({ contentType, body: new Response(wire).body! }),
  });
describe("shared Responses API parser", () => {
  it("supports JSON fallback", async () => {
    expect(
      await read(
        JSON.stringify({ status: "completed", output_text: "Hello" }),
        "application/json"
      )
    ).toBe("Hello");
  });
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
        serializedRequestBody: "{}",
        model: "test",
        maxOutputTokens: 10,
        signal: new AbortController().signal,
        correlationId: "local",
        log: vi.fn(),
        onUsage: vi.fn(),
        transport: async () => {
          throw new ModelTransportError("bad", false);
        },
      })
    ).rejects.toMatchObject({ transport: false });
  });
});
