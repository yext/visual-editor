import { ModelTransportError, type ModelTransport } from "./modelTransport.ts";
import { createGenerationRepetitionGuard } from "./generationLimits.ts";

type GatewayResponse = {
  id?: string;
  model?: string;
  usage?: {
    input_tokens?: number;
    input_tokens_details?: { cached_tokens?: number };
    output_tokens?: number;
    output_tokens_details?: { reasoning_tokens?: number };
  };
  status?: string;
  incomplete_details?: { reason?: string };
  error?: unknown;
  output_text?: string;
  output?: {
    type: string;
    content?: { type: string; text?: string }[];
  }[];
};

const readOutputText = (result: GatewayResponse): string => {
  if (
    result.output?.some((item) =>
      item.content?.some((content) => content.type === "refusal")
    )
  ) {
    throw new Error("The AI gateway refused generation.");
  }
  if (result.incomplete_details?.reason === "max_output_tokens") {
    throw new Error(
      "Generation exceeded its output token budget. Try a smaller request."
    );
  }
  if (
    result.error ||
    result.status === "failed" ||
    result.status === "incomplete"
  ) {
    throw new Error("The AI gateway did not complete generation.");
  }
  const text = extractOutputText(result);
  if (!text) {
    throw new Error("The AI gateway returned no generated text.");
  }
  return text;
};

const extractOutputText = (result: GatewayResponse): string =>
  result.output_text ??
  result.output
    ?.filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text ?? "")
    .join("") ??
  "";

/** Keep transport failures distinct from invalid model output. */
export class GenerationGatewayError extends Error {
  constructor(
    readonly transport: boolean,
    readonly phase: string,
    readonly outputBytes: number,
    cause: unknown
  ) {
    super(cause instanceof Error ? cause.message : String(cause), { cause });
    const stacks = [this.stack];
    const seen = new Set<Error>([this]);
    for (
      let current: unknown = cause;
      current instanceof Error && !seen.has(current);
      current = current.cause
    ) {
      seen.add(current);
      stacks.push(current.stack ?? current.message);
    }
    this.stack = stacks.filter(Boolean).join("\nCaused by: ");
  }
}

/** Decode provider output with backpressure for validated creation reveals.
 * The returned text still requires provider completion and whole-response validation. */
export const requestGenerationOutput = async ({
  serializedRequestBody,
  transport,
  model,
  maxOutputTokens,
  signal,
  correlationId,
  log,
  onUsage,
  onDelta,
}: {
  serializedRequestBody: string;
  transport: ModelTransport;
  model: string;
  maxOutputTokens: number;
  signal: AbortSignal;
  correlationId: string;
  log: (message: string, details: object) => void;
  onDelta?: (delta: string) => Promise<void>;
  onUsage: (usage: GatewayResponse["usage"]) => void;
}): Promise<string> => {
  let phase = "gateway-fetch";
  let transportFailure = false;
  let outputText = "";
  const guard = createGenerationRepetitionGuard();
  const consume = async (delta: string) => {
    guard(delta);
    outputText += delta;
    await onDelta?.(delta);
  };
  try {
    const upstream = await transport(
      JSON.parse(serializedRequestBody),
      signal,
      correlationId
    ).catch((cause) => {
      transportFailure =
        !(cause instanceof ModelTransportError) || cause.transport;
      throw cause;
    });
    phase = "read-gateway-response";
    if (!upstream.contentType?.includes("text/event-stream")) {
      const result = (await new Response(upstream.body)
        .json()
        .catch((cause) => {
          transportFailure = true;
          throw cause;
        })) as GatewayResponse;
      if (result.status === "incomplete" || result.incomplete_details) {
        const responseText = extractOutputText(result);
        log("[layout generation] Gateway incomplete response", {
          correlationId,
          responseId: result.id,
          model: result.model ?? model,
          status: result.status,
          maxOutputTokens,
          incompleteDetails: result.incomplete_details,
          usage: result.usage,
          responseOutputCharacters: responseText.length,
          responseOutputBytes: utf8Bytes(responseText, "utf8"),
        });
      }
      onUsage(result.usage);
      const text = readOutputText(result);
      log("[layout generation] Gateway completed", {
        correlationId,
        responseId: result.id,
        model: result.model ?? model,
        status: result.status,
        outputCharacters: text.length,
        incompleteDetails: result.incomplete_details,
      });
      guard(text);
      outputText = text;
    } else {
      const reader = upstream.body?.getReader();
      if (!reader) {
        transportFailure = true;
        throw new Error("The gateway returned no response body.");
      }
      const decoder = new TextDecoder();
      let pending = "";
      let completed = false;
      const eventCounts: Record<string, number> = {};
      const streamStartedAt = Date.now();
      const processLine = async (line: string) => {
        if (!line.startsWith("data:")) {
          return;
        }
        const raw = line.slice(5).trim();
        if (!raw || raw === "[DONE]") {
          return;
        }
        let event;
        try {
          event = JSON.parse(raw);
        } catch (cause) {
          transportFailure = true;
          throw cause;
        }
        if (
          !event ||
          typeof event !== "object" ||
          typeof event.type !== "string" ||
          (event.type === "response.output_text.delta" &&
            typeof event.delta !== "string") ||
          (event.type === "response.completed" &&
            (!event.response || typeof event.response !== "object")) ||
          (completed &&
            ["response.completed", "response.output_text.delta"].includes(
              event.type
            ))
        ) {
          transportFailure = true;
          throw new Error("Invalid gateway stream event.");
        }
        eventCounts[event.type ?? "unknown"] =
          (eventCounts[event.type ?? "unknown"] ?? 0) + 1;
        if (event.type?.startsWith("response.refusal")) {
          throw new Error("The AI gateway refused generation.");
        }
        if (
          ["error", "response.failed", "response.incomplete"].includes(
            event.type
          ) ||
          event.error
        ) {
          const responseText = event.response
            ? extractOutputText(event.response)
            : "";
          log("[layout generation] Gateway stream error", {
            correlationId,
            eventType: event.type,
            error: event.error ?? event.response?.error ?? event.message,
            maxOutputTokens,
            incompleteDetails: event.response?.incomplete_details,
            usage: event.response?.usage,
            streamedOutputCharacters: outputText.length,
            streamedOutputBytes: utf8Bytes(outputText, "utf8"),
            responseOutputCharacters: responseText.length,
            responseOutputBytes: utf8Bytes(responseText, "utf8"),
            streamDurationMs: Date.now() - streamStartedAt,
            eventCounts,
          });
          onUsage(event.response?.usage);
          if (event.response) {
            readOutputText(event.response);
          }
          throw new Error("The AI gateway did not complete generation.");
        }
        if (
          event.type === "response.output_text.delta" &&
          typeof event.delta === "string"
        ) {
          await consume(event.delta);
        }
        if (event.type === "response.completed") {
          onUsage(event.response.usage);
          const text = readOutputText(event.response);
          if (outputText && text !== outputText) {
            transportFailure = true;
            throw new Error(
              "Completed gateway output differs from streamed text."
            );
          }
          if (!outputText) {
            await consume(text);
          }
          log("[layout generation] Gateway completed", {
            correlationId,
            responseId: event.response?.id,
            model: event.response?.model ?? model,
            status: event.response?.status,
            outputCharacters: outputText.length,
            streamDurationMs: Date.now() - streamStartedAt,
            eventCounts,
          });
          completed = true;
        }
      };
      try {
        while (true) {
          const { done, value } = await reader.read().catch((cause) => {
            transportFailure =
              !(cause instanceof ModelTransportError) || cause.transport;
            throw cause;
          });
          pending += decoder.decode(value, { stream: !done });
          const lines = pending.split("\n");
          pending = lines.pop()!;
          for (const line of lines) await processLine(line);
          if (done) {
            break;
          }
        }
        if (pending) {
          await processLine(pending);
        }
        if (!completed) {
          transportFailure = true;
          throw new Error("The gateway stream ended before completion.");
        }
      } finally {
        await reader.cancel().catch(() => {});
      }
    }
    signal.throwIfAborted();
    return outputText;
  } catch (cause) {
    throw new GenerationGatewayError(
      transportFailure ||
        (cause instanceof ModelTransportError && cause.transport),
      phase,
      utf8Bytes(outputText, "utf8"),
      cause
    );
  }
};

const utf8Bytes = (text: string, _encoding?: string) =>
  new TextEncoder().encode(text).byteLength;
