import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { StringDecoder } from "node:string_decoder";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import type { GeneratedContent } from "../../local-editor/types.ts";
import { compileGenerationSchema } from "./generationSchema.ts";
import { createPuckGenerationPreview } from "./generationPreview.ts";
import {
  buildGenerationPrompt,
  generatedContentShape,
  validateGeneratedContent,
} from "./generationValidation.ts";
import { createStructuredGenerationParser } from "./structuredGenerationStream.ts";
import {
  createGenerationRepetitionGuard,
  GENERATION_ATTEMPT_DEADLINE_MS,
  generationTokenBudget,
} from "./generationLimits.ts";
import { sendJsonResponse } from "../local-editor/server.ts";

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
  const text =
    result.output_text ??
    result.output
      ?.filter((item) => item.type === "message")
      .flatMap((item) => item.content ?? [])
      .filter((content) => content.type === "output_text")
      .map((content) => content.text ?? "")
      .join("");
  if (!text) throw new Error("The AI gateway returned no generated text.");
  return text;
};

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
    !generatedContentShape.safeParse(currentData).success
  ) {
    rejectRequest("currentData must contain native Puck content.", 400);
    return;
  }

  let compiled: ReturnType<typeof compileGenerationSchema>;
  try {
    compiled = compileGenerationSchema(
      catalog,
      locales,
      currentData as GeneratedContent | undefined
    );
    if (currentData !== undefined) {
      const errors = validateGeneratedContent(catalog, currentData);
      if (errors.length)
        throw new Error(
          "Current editor content is invalid: " + errors.join("; ")
        );
    }
  } catch (error) {
    rejectRequest(error instanceof Error ? error.message : String(error), 422);
    return;
  }

  const abortController = new AbortController();
  let generatedText = "";
  let started = false;
  let disconnected = false;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  const abort = () => {
    disconnected = true;
    abortController.abort();
  };
  response.once("close", abort);
  try {
    const input = messages.map(({ role, content }) => {
      if (role === "assistant") {
        try {
          const historical = JSON.parse(content);
          if (generatedContentShape.safeParse(historical.spec).success)
            content = JSON.stringify({
              ...historical,
              spec: compiled.stripMetadata(historical.spec),
            });
        } catch {
          /* Plain assistant prose has no structured metadata. */
        }
      }
      return { role, content };
    });
    if (currentData !== undefined) {
      input.splice(input.length - 1, 0, {
        role: "user",
        content:
          "CURRENT EDITOR CONTENT (authoritative starting point; overrides content in earlier messages):\n" +
          JSON.stringify({
            text: "",
            spec: compiled.stripMetadata(currentData as GeneratedContent),
          }),
      });
    }
    const instructions = buildGenerationPrompt(
      catalog,
      compiled.availableComponentNames,
      compiled.stripMetadata
    );
    const writeEvent = (event: object) => {
      if (!started) {
        started = true;
        response.statusCode = 200;
        response.setHeader(
          "Content-Type",
          "application/x-ndjson; charset=utf-8"
        );
        response.setHeader(
          "X-Visual-Editor-Generation",
          "validated-puck-content-v1"
        );
        response.setHeader("Cache-Control", "no-cache, no-transform");
        response.setHeader("X-Accel-Buffering", "no");
        response.flushHeaders();
      }
      response.write(JSON.stringify(event) + "\n");
    };
    const writeUsage = (usage: GatewayResponse["usage"]) => {
      if (!usage) return;
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
    for (let attempt = 0; attempt < 3; attempt++) {
      clearTimeout(deadline);
      deadline = setTimeout(
        () =>
          abortController.abort(
            new Error(
              "Generation exceeded the two-minute deadline. Try a smaller request."
            )
          ),
        GENERATION_ATTEMPT_DEADLINE_MS
      );
      generatedText = "";
      const guardRepetition = createGenerationRepetitionGuard();
      const structuredParser = createStructuredGenerationParser({
        onText: (delta) => writeEvent({ type: "preview-text", delta }),
        onValue: createPuckGenerationPreview(
          catalog,
          (spec) => writeEvent({ type: "preview-spec", spec }),
          compiled.normalizeContent
        ),
      });
      const previewDelta = (delta: string) => structuredParser.push(delta);
      const gatewayRequest = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Yext-Business-Id": "1000152098",
          "Yext-Source": "blife-vle-ai-poc",
          "Correlation-Id": correlationId,
        },
        body: JSON.stringify({
          model,
          stream: true,
          max_output_tokens: generationTokenBudget(
            currentData === undefined
              ? undefined
              : compiled.stripMetadata(currentData as GeneratedContent)
          ),
          text: {
            format: {
              type: "json_schema",
              name: "visual_editor_response",
              strict: true,
              schema: compiled.jsonSchema,
            },
          },
          instructions,
          input,
        }),
        signal: abortController.signal,
      };
      log("[local-editor generation] Gateway request", {
        correlationId,
        attempt,
        url: GENERATION_GATEWAY_URL,
        body: JSON.parse(gatewayRequest.body),
      });
      const upstream = await fetch(GENERATION_GATEWAY_URL, gatewayRequest);
      log("[local-editor generation] Gateway response", {
        correlationId,
        model,
        status: upstream.status,
        contentType: upstream.headers.get("Content-Type"),
      });
      if (!upstream.ok || !upstream.body) {
        log("[local-editor generation] Gateway error response", {
          correlationId,
          model,
          status: upstream.status,
          body: await upstream.text(),
        });
        if (started) {
          writeEvent({
            type: "error",
            error: `AI gateway HTTP ${upstream.status} during repair`,
          });
          response.end();
          return;
        }
        sendJsonResponse(
          response,
          {
            error: `Generation failed (AI gateway HTTP ${upstream.status}, correlation ${correlationId}). Check gateway access and model ${model}.`,
          },
          502
        );
        return;
      }

      // Some gateway wrappers return a complete Responses object even when streaming is requested.
      if (
        !upstream.headers.get("Content-Type")?.includes("text/event-stream")
      ) {
        const result = (await upstream.json()) as GatewayResponse;
        log("[local-editor generation] Gateway response body", {
          correlationId,
          result,
        });
        writeUsage(result.usage);
        generatedText = readOutputText(result);
        guardRepetition(generatedText);
        log("[local-editor generation] Completed response", {
          correlationId,
          model: result.model ?? model,
          responseId: result.id,
          status: result.status,
          usage: result.usage,
          text: generatedText,
        });
      } else {
        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let pending = "";
        let completed = false;
        let receivedText = false;
        let completedResponse: GatewayResponse | undefined;
        while (true) {
          const { done, value } = await reader.read();
          pending += decoder.decode(value, { stream: !done });
          const lines = pending.split("\n");
          pending = done ? "" : lines.pop()!;
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            const event = JSON.parse(data);
            if (
              event.type === "response.refusal.delta" ||
              event.type === "response.refusal.done" ||
              (event.type === "response.completed" &&
                event.response?.output?.some(
                  (item: NonNullable<GatewayResponse["output"]>[number]) =>
                    item.content?.some((content) => content.type === "refusal")
                ))
            )
              throw new Error("The AI gateway refused generation.");
            log("[local-editor generation] Gateway stream event", {
              correlationId,
              event,
            });
            if (
              event.response?.usage &&
              (event.type === "response.completed" ||
                event.type === "response.failed" ||
                event.type === "response.incomplete")
            )
              writeUsage(event.response.usage);
            if (
              event.type === "error" ||
              event.type === "response.failed" ||
              event.type === "response.incomplete" ||
              event.error
            ) {
              log("[local-editor generation] Gateway stream error", {
                correlationId,
                model,
                eventType: event.type,
                error: event.error ?? event.response?.error ?? event.message,
                incompleteDetails: event.response?.incomplete_details,
              });
              if (
                event.response?.incomplete_details?.reason ===
                "max_output_tokens"
              )
                throw new Error(
                  "Generation exceeded its output token budget. Try a smaller request."
                );
              throw new Error(
                `The AI gateway returned a streaming error (correlation ${correlationId}).`
              );
            }
            if (
              event.type === "response.output_text.delta" &&
              typeof event.delta === "string"
            ) {
              receivedText = true;
              generatedText += event.delta;
              guardRepetition(event.delta);
              previewDelta(event.delta);
            }
            if (event.type === "response.completed") {
              completed = true;
              completedResponse = event.response;
              if (!receivedText) {
                generatedText = readOutputText(event.response);
                guardRepetition(generatedText);
                previewDelta(generatedText);
              }
            }
          }
          if (done) break;
        }
        if (!completed)
          throw new Error(
            `The AI gateway stream ended before completion (correlation ${correlationId}).`
          );
        log("[local-editor generation] Completed response", {
          correlationId,
          model: completedResponse?.model ?? model,
          responseId: completedResponse?.id,
          status: completedResponse?.status,
          usage: completedResponse?.usage,
          text: generatedText,
        });
      }
      let accepted: { text: string; spec: GeneratedContent | null } | undefined;
      let errors: string[];
      try {
        accepted = compiled.parseResponse(generatedText);
        errors =
          accepted.spec === null
            ? []
            : validateGeneratedContent(catalog, accepted.spec);
      } catch (error) {
        errors = [error instanceof Error ? error.message : String(error)];
      }
      if (!errors.length) {
        writeEvent({
          type: "accepted",
          ...accepted,
        });
        response.end();
        return;
      }
      if (attempt === 2) {
        writeEvent({
          type: "error",
          error: "Generated spec failed validation: " + errors.join("; "),
        });
        response.end();
        return;
      }
      writeEvent({ type: "reset" });
      input.push(
        { role: "assistant", content: generatedText },
        {
          role: "user",
          content:
            "Repair the complete spec using these validation errors. Preserve the requested content.\n" +
            errors.join("\n"),
        }
      );
    }
  } catch (error) {
    const failure =
      !disconnected && abortController.signal.reason instanceof Error
        ? abortController.signal.reason
        : error;
    log("[local-editor generation] Generation failed", {
      correlationId,
      model,
      error: failure instanceof Error ? failure.message : String(failure),
      text: generatedText,
    });
    if (started && !disconnected) {
      response.write(
        JSON.stringify({
          type: "error",
          error: failure instanceof Error ? failure.message : String(failure),
        }) + "\n"
      );
      response.end();
      return;
    }
    if (!disconnected && abortController.signal.aborted) {
      sendJsonResponse(
        response,
        { error: String((failure as Error).message) },
        504
      );
      return;
    }
    throw error;
  } finally {
    clearTimeout(deadline);
    response.off("close", abort);
    abortController.abort();
  }
};
