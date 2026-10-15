import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { StringDecoder } from "node:string_decoder";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import { compileGenerationSchema } from "./generationSchema.ts";
import { buildGenerationPrompt } from "./generationValidation.ts";
import { createStructuredGenerationParser } from "./structuredGenerationStream.ts";
import {
  createGenerationRepetitionGuard,
  GENERATION_ATTEMPT_DEADLINE_MS,
  generationTokenBudget,
} from "./generationLimits.ts";
import { sendJsonResponse } from "../local-editor/server.ts";
import type { Content } from "../../internal/generation/authored.ts";

type GenerationOptions = {
  model: string;
  loadContext: (layoutId: string) => Promise<
    | {
        catalog: PuckGenerationCatalog;
        locales: string[];
      }
    | undefined
  >;
  log: (message: string, details: object) => void;
};

const GENERATION_GATEWAY_URL =
  "http://modelgateway.service.us3dev.consul:8008/openai/responses";

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
  )
    throw new Error("The AI gateway refused generation.");
  if (result.incomplete_details?.reason === "max_output_tokens")
    throw new Error(
      "Generation exceeded its output token budget. Try a smaller request."
    );
  if (
    result.error ||
    result.status === "failed" ||
    result.status === "incomplete"
  ) {
    throw new Error("The AI gateway did not complete generation.");
  }
  const text = extractOutputText(result);
  if (!text) throw new Error("The AI gateway returned no generated text.");
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

/** Streams the company gateway output as validated native Puck data. */
export const handleLocalEditorGenerationRequest = async (
  request: IncomingMessage & { body?: unknown },
  response: ServerResponse,
  { model, loadContext, log }: GenerationOptions
): Promise<void> => {
  const correlationId = randomUUID();
  const requestDetails = {
    correlationId,
    method: request.method,
    url: request.url,
    contentType: request.headers?.["content-type"],
    contentLength: request.headers?.["content-length"],
    bodySource: request.body === undefined ? "stream" : "middleware",
  };
  log("[local-editor generation] Request received", requestDetails);
  const rejectRequest = (error: string, status: number, details = {}) => {
    log("[local-editor generation] Request rejected", {
      ...requestDetails,
      status,
      error,
      ...details,
    });
    sendJsonResponse(response, { error }, status);
  };
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    rejectRequest("Use POST to generate a spec.", 405);
    return;
  }

  let body = "";
  const bodyDecoder = new StringDecoder("utf8");
  let bodyBytes = 0;
  // Pages middleware can consume the stream and attach its parsed JSON to req.body.
  if (request.body !== undefined) {
    body = Buffer.isBuffer(request.body)
      ? request.body.toString("utf8")
      : typeof request.body === "string"
        ? request.body
        : JSON.stringify(request.body);
    bodyBytes = Buffer.byteLength(body);
    if (bodyBytes > 1024 * 1024) {
      rejectRequest("Conversation request is too large.", 413, { bodyBytes });
      return;
    }
  } else {
    for await (const chunk of request) {
      bodyBytes += chunk.length;
      if (bodyBytes > 1024 * 1024) {
        rejectRequest("Conversation request is too large.", 413, { bodyBytes });
        return;
      }
      body += bodyDecoder.write(chunk);
    }
    body += bodyDecoder.end();
  }
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch (error) {
    rejectRequest("Request must contain valid JSON.", 400, {
      bodyBytes,
      parseError: error instanceof Error ? error.message : String(error),
    });
    return;
  }
  const messages =
    payload && typeof payload === "object" && "messages" in payload
      ? payload.messages
      : undefined;
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.some(
      (message) =>
        !message ||
        typeof message !== "object" ||
        (message.role !== "user" && message.role !== "assistant") ||
        typeof message.content !== "string" ||
        !message.content.trim()
    ) ||
    messages.at(-1).role !== "user"
  ) {
    rejectRequest(
      "A conversation with user/assistant messages ending in a non-empty user message is required.",
      400,
      { bodyBytes }
    );
    return;
  }

  const layoutId =
    payload && typeof payload === "object" && "layoutId" in payload
      ? payload.layoutId
      : undefined;
  if (typeof layoutId !== "string" || !layoutId.trim()) {
    rejectRequest("A layoutId is required.", 400);
    return;
  }
  const context = await loadContext(layoutId);
  if (!context) {
    rejectRequest("Unknown generation layoutId.", 400);
    return;
  }
  const { catalog, locales } = context;

  const currentData =
    payload && typeof payload === "object" && "currentData" in payload
      ? payload.currentData
      : undefined;
  if (
    currentData !== undefined &&
    (!currentData ||
      typeof currentData !== "object" ||
      !("content" in currentData) ||
      !Array.isArray(currentData.content))
  ) {
    rejectRequest("currentData must contain native Puck content.", 400);
    return;
  }

  let compiled: ReturnType<typeof compileGenerationSchema>;
  try {
    const prompt = messages.at(-1).content;
    // Full-page replacement requires explicit intent in the current user turn.
    const allowRedesign =
      /\b(redesign|replace|rebuild)\s+(?:(?:the|this|my|our)\s+)?(?:(?:entire|whole|full)\s+)?(?:landing\s+)?page(?:\s+layout)?(?=\s*(?:[.!?,;]|$|with\b|from\b|using\b|for\b|to\b|so\b))|\b(full-page|full page|entire page|whole page)\b[\s\S]*\b(redesign|replacement|rebuild)\b/i.test(
        prompt
      );
    compiled = compileGenerationSchema(
      catalog,
      locales,
      currentData as Content | undefined,
      { allowRedesign }
    );
  } catch (error) {
    rejectRequest(error instanceof Error ? error.message : String(error), 422);
    return;
  }
  const controller = new AbortController();
  const abort = () => controller.abort(new Error("Generation cancelled."));
  response.once("close", abort);
  const deadline = setTimeout(
    () =>
      controller.abort(
        new Error(
          "Generation exceeded the two-minute deadline. Try a smaller request."
        )
      ),
    GENERATION_ATTEMPT_DEADLINE_MS
  );
  let started = false;
  const writeEvent = (event: object) => {
    if (controller.signal.aborted) throw controller.signal.reason;
    if (!started) {
      started = true;
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
      response.setHeader(
        "X-Visual-Editor-Generation",
        "strict-puck-overrides-v2"
      );
      response.setHeader("Cache-Control", "no-cache, no-transform");
      response.setHeader("X-Accel-Buffering", "no");
      response.flushHeaders();
    }
    response.write(JSON.stringify(event) + "\n");
  };
  const writeUsage = (usage: GatewayResponse["usage"]) => {
    if (!usage) return;
    log("[local-editor generation] Usage", { correlationId, usage });
    const cachedInput = usage.input_tokens_details?.cached_tokens ?? 0;
    writeEvent({
      type: "usage",
      usage: {
        cachedInput,
        uncachedInput: Math.max(0, (usage.input_tokens ?? 0) - cachedInput),
        output: usage.output_tokens ?? 0,
      },
    });
  };
  try {
    const instructions = buildGenerationPrompt(catalog);
    const history = messages.slice(0, -1).map(({ role, content }) => {
      if (role === "assistant") {
        try {
          const parsed = JSON.parse(content);
          content = parsed.text ?? content;
        } catch {
          /* Preserve prose. */
        }
      }
      return { role, content };
    });
    let repair: { draft: string; error: string } | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      writeEvent({
        type: "progress",
        text: attempt
          ? "Repairing the candidate layout…"
          : "Generating a candidate layout…",
      });
      let outputText = "";
      const guard = createGenerationRepetitionGuard();
      const parser = createStructuredGenerationParser({
        onText: (delta) => writeEvent({ type: "commentary", delta }),
        onValue: () => {},
      });
      const consume = (delta: string) => {
        guard(delta);
        outputText += delta;
        parser.push(delta);
      };
      const requestBody = {
        model,
        stream: true,
        max_output_tokens: generationTokenBudget(compiled.context as any, {
          isBlankPage: compiled.isBlankPage,
        }),
        instructions,
        input: [
          ...history,
          {
            role: "user",
            content: JSON.stringify({
              request: messages.at(-1).content,
              currentLayout: compiled.context,
              inventory: compiled.inventory,
              ...(repair
                ? {
                    repair: {
                      ...repair,
                      instruction:
                        "Correct the rejected proposal against the unchanged starting layout. Return the complete response.",
                    },
                  }
                : {}),
            }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "puck_generation",
            strict: true,
            schema: compiled.jsonSchema,
          },
        },
      };
      log("[local-editor generation] Gateway request", {
        correlationId,
        attempt: attempt + 1,
        model,
        maxOutputTokens: requestBody.max_output_tokens,
        isBlankPage: compiled.isBlankPage,
      });
      const upstream = await fetch(GENERATION_GATEWAY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Yext-Business-Id": "1000152098",
          "Yext-Source": "blife-vle-ai-poc",
          "Correlation-Id": correlationId,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      log("[local-editor generation] Gateway response", {
        correlationId,
        attempt: attempt + 1,
        status: upstream.status,
        contentType: upstream.headers.get("Content-Type"),
      });
      if (!upstream.ok)
        throw new Error(
          `AI gateway HTTP ${upstream.status} (correlation ${correlationId}).`
        );
      if (
        !upstream.headers.get("Content-Type")?.includes("text/event-stream")
      ) {
        const result = (await upstream.json()) as GatewayResponse;
        if (result.status === "incomplete" || result.incomplete_details) {
          const responseText = extractOutputText(result);
          log("[local-editor generation] Gateway incomplete response", {
            correlationId,
            attempt: attempt + 1,
            responseId: result.id,
            model: result.model ?? model,
            status: result.status,
            maxOutputTokens: requestBody.max_output_tokens,
            incompleteDetails: result.incomplete_details,
            usage: result.usage,
            responseOutputCharacters: responseText.length,
            responseOutputBytes: Buffer.byteLength(responseText, "utf8"),
          });
        }
        const text = readOutputText(result);
        log("[local-editor generation] Gateway completed", {
          correlationId,
          attempt: attempt + 1,
          responseId: result.id,
          model: result.model ?? model,
          status: result.status,
          outputCharacters: text.length,
          incompleteDetails: result.incomplete_details,
        });
        writeUsage(result.usage);
        consume(text);
      } else {
        const reader = upstream.body?.getReader();
        if (!reader) throw new Error("The gateway returned no response body.");
        const decoder = new TextDecoder();
        let pending = "";
        let completed = false;
        const eventCounts: Record<string, number> = {};
        const streamStartedAt = Date.now();
        const processLine = (line: string) => {
          if (!line.startsWith("data:")) return;
          const raw = line.slice(5).trim();
          if (!raw || raw === "[DONE]") return;
          const event = JSON.parse(raw);
          eventCounts[event.type ?? "unknown"] =
            (eventCounts[event.type ?? "unknown"] ?? 0) + 1;
          if (event.type?.startsWith("response.refusal"))
            throw new Error("The AI gateway refused generation.");
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
              attempt: attempt + 1,
              eventType: event.type,
              error: event.error ?? event.response?.error ?? event.message,
              maxOutputTokens: requestBody.max_output_tokens,
              incompleteDetails: event.response?.incomplete_details,
              usage: event.response?.usage,
              streamedOutputCharacters: outputText.length,
              streamedOutputBytes: Buffer.byteLength(outputText, "utf8"),
              responseOutputCharacters: responseText.length,
              responseOutputBytes: Buffer.byteLength(responseText, "utf8"),
              streamDurationMs: Date.now() - streamStartedAt,
              eventCounts,
            });
            writeUsage(event.response?.usage);
            if (event.response) readOutputText(event.response);
            throw new Error("The AI gateway did not complete generation.");
          }
          if (
            event.type === "response.output_text.delta" &&
            typeof event.delta === "string"
          )
            consume(event.delta);
          if (event.type === "response.completed") {
            const text = readOutputText(event.response);
            if (!outputText) consume(text);
            log("[local-editor generation] Gateway completed", {
              correlationId,
              attempt: attempt + 1,
              responseId: event.response?.id,
              model: event.response?.model ?? model,
              status: event.response?.status,
              outputCharacters: outputText.length,
              streamDurationMs: Date.now() - streamStartedAt,
              eventCounts,
            });
            writeUsage(event.response.usage);
            completed = true;
          }
        };
        try {
          while (true) {
            const { done, value } = await reader.read();
            pending += decoder.decode(value, { stream: !done });
            const lines = pending.split("\n");
            pending = lines.pop()!;
            lines.forEach(processLine);
            if (done) break;
          }
          if (pending) processLine(pending);
          if (!completed)
            throw new Error("The gateway stream ended before completion.");
        } finally {
          await reader.cancel().catch(() => {});
        }
      }
      // Transport errors, refusals and exhaustion never reach the repair path.
      try {
        const accepted = compiled.parseResponse(outputText);
        log("[local-editor generation] Attempt outcome", {
          correlationId,
          attempt: attempt + 1,
          validationOutcome: "accepted",
          outputCharacters: outputText.length,
          repairAttempt: Boolean(repair),
        });
        writeEvent({ type: "accepted", ...accepted });
        response.end();
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log("[local-editor generation] Attempt outcome", {
          correlationId,
          attempt: attempt + 1,
          validationOutcome: "rejected",
          error: message,
          repair: attempt === 0,
        });
        if (attempt)
          throw new Error(`Generated layout failed validation: ${message}`);
        repair = { draft: outputText, error: message };
      }
    }
  } catch (error) {
    const failure = controller.signal.aborted
      ? controller.signal.reason
      : error;
    const message =
      failure instanceof Error ? failure.message : String(failure);
    log("[local-editor generation] Generation failed", {
      correlationId,
      error: message,
    });
    if (!response.destroyed) {
      if (started) {
        response.write(
          JSON.stringify({ type: "error", error: message }) + "\n"
        );
        response.end();
      } else
        sendJsonResponse(
          response,
          { error: message },
          controller.signal.aborted ? 504 : 502
        );
    }
  } finally {
    clearTimeout(deadline);
    response.off("close", abort);
    controller.abort();
  }
};
