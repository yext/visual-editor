import { createGenerationRepetitionGuard } from "./generationLimits.ts";

export const GENERATION_GATEWAY_URL =
  "http://modelgateway.service.us3dev.consul:8008/openai/responses";
const MAX_LOGGED_GATEWAY_ERROR_BYTES = 8 * 1024;

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

/** Read one complete gateway response without exposing partial output to the editor. */
export const requestGenerationOutput = async ({
  serializedRequestBody,
  model,
  maxOutputTokens,
  signal,
  correlationId,
  log,
  onUsage,
}: {
  serializedRequestBody: string;
  model: string;
  maxOutputTokens: number;
  signal: AbortSignal;
  correlationId: string;
  log: (message: string, details: object) => void;
  onUsage: (usage: GatewayResponse["usage"]) => void;
}): Promise<string> => {
  let phase = "gateway-fetch";
  let transportFailure = false;
  let outputText = "";
  const guard = createGenerationRepetitionGuard();
  const consume = (delta: string) => {
    guard(delta);
    outputText += delta;
  };
  try {
    const upstream = await fetch(GENERATION_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Yext-Business-Id": "1000152098", // blife test account
        "Yext-Source": "vle-ai-layout-generation-poc",
        "Correlation-Id": correlationId,
      },
      body: serializedRequestBody,
      signal,
    }).catch((cause) => {
      transportFailure = true;
      throw cause;
    });
    log("[local-editor generation] Gateway response", {
      correlationId,
      status: upstream.status,
      contentType: upstream.headers.get("Content-Type"),
      contentLength: upstream.headers.get("Content-Length"),
      requestId:
        upstream.headers.get("x-request-id") ??
        upstream.headers.get("request-id"),
      retryAfter: upstream.headers.get("retry-after"),
    });
    if (!upstream.ok) {
      transportFailure =
        upstream.status >= 500 ||
        upstream.status === 408 ||
        upstream.status === 429;
      const errorBody = await upstream.text();
      log("[local-editor generation] Gateway error response", {
        correlationId,
        status: upstream.status,
        responseBodyBytes: Buffer.byteLength(errorBody, "utf8"),
        responseBodyTruncated:
          Buffer.byteLength(errorBody, "utf8") > MAX_LOGGED_GATEWAY_ERROR_BYTES,
        responseBody: Buffer.from(errorBody, "utf8")
          .subarray(0, MAX_LOGGED_GATEWAY_ERROR_BYTES)
          .toString("utf8"),
      });
      throw new Error(
        `AI gateway HTTP ${upstream.status} (correlation ${correlationId}).`
      );
    }
    phase = "read-gateway-response";
    if (!upstream.headers.get("Content-Type")?.includes("text/event-stream")) {
      const result = (await upstream.json().catch((cause) => {
        transportFailure = true;
        throw cause;
      })) as GatewayResponse;
      if (result.status === "incomplete" || result.incomplete_details) {
        const responseText = extractOutputText(result);
        log("[local-editor generation] Gateway incomplete response", {
          correlationId,
          responseId: result.id,
          model: result.model ?? model,
          status: result.status,
          maxOutputTokens,
          incompleteDetails: result.incomplete_details,
          usage: result.usage,
          responseOutputCharacters: responseText.length,
          responseOutputBytes: Buffer.byteLength(responseText, "utf8"),
        });
      }
      onUsage(result.usage);
      const text = readOutputText(result);
      log("[local-editor generation] Gateway completed", {
        correlationId,
        responseId: result.id,
        model: result.model ?? model,
        status: result.status,
        outputCharacters: text.length,
        incompleteDetails: result.incomplete_details,
      });
      consume(text);
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
      const processLine = (line: string) => {
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
          log("[local-editor generation] Gateway stream error", {
            correlationId,
            eventType: event.type,
            error: event.error ?? event.response?.error ?? event.message,
            maxOutputTokens,
            incompleteDetails: event.response?.incomplete_details,
            usage: event.response?.usage,
            streamedOutputCharacters: outputText.length,
            streamedOutputBytes: Buffer.byteLength(outputText, "utf8"),
            responseOutputCharacters: responseText.length,
            responseOutputBytes: Buffer.byteLength(responseText, "utf8"),
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
          consume(event.delta);
        }
        if (event.type === "response.completed") {
          onUsage(event.response.usage);
          const text = readOutputText(event.response);
          if (!outputText) {
            consume(text);
          }
          log("[local-editor generation] Gateway completed", {
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
            transportFailure = true;
            throw cause;
          });
          pending += decoder.decode(value, { stream: !done });
          const lines = pending.split("\n");
          pending = lines.pop()!;
          lines.forEach(processLine);
          if (done) {
            break;
          }
        }
        if (pending) {
          processLine(pending);
        }
        if (!completed) {
          transportFailure = true;
          throw new Error("The gateway stream ended before completion.");
        }
      } finally {
        await reader.cancel().catch(() => {});
      }
    }
    return outputText;
  } catch (cause) {
    throw new GenerationGatewayError(
      transportFailure,
      phase,
      Buffer.byteLength(outputText, "utf8"),
      cause
    );
  }
};
