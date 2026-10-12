import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { StringDecoder } from "node:string_decoder";
import type { Catalog, Spec } from "@json-render/core";
import {
  buildGenerationPrompt,
  normalizeGeneratedElement,
  isGeneratedElementShape,
  validateGeneratedText,
} from "./generationValidation.ts";
import { createStructuredGenerationParser } from "./structuredGenerationStream.ts";
import { sendJsonResponse } from "./server.ts";

type GenerationOptions = {
  model: string;
  loadCatalog: () => Promise<Catalog>;
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
  error?: unknown;
  output_text?: string;
  output?: {
    type: string;
    content?: { type: string; text?: string }[];
  }[];
};

const readOutputText = (result: GatewayResponse): string => {
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

/** Serialize complete structured specs ourselves so nested JSON never needs patch repair. */
export const serializeGenerationResponse = (
  text: string,
  catalog?: Catalog
): string => {
  // Retain compatibility with gateways that return the earlier mixed-stream format.
  if (!text.trimStart().startsWith("{")) return text;
  const response: unknown = JSON.parse(text);
  if (
    !response ||
    typeof response !== "object" ||
    !("text" in response) ||
    typeof response.text !== "string" ||
    !("spec" in response)
  ) {
    throw new Error("Generation must return a JSON object with text and spec.");
  }
  if (response.spec === null) return response.text;
  if (
    !response.spec ||
    typeof response.spec !== "object" ||
    Array.isArray(response.spec)
  ) {
    throw new Error("Generated spec must be an object or null.");
  }
  const spec = response.spec as Record<string, unknown>;
  if (
    catalog &&
    spec.elements &&
    typeof spec.elements === "object" &&
    !Array.isArray(spec.elements)
  ) {
    spec.elements = Object.fromEntries(
      Object.entries(spec.elements).map(([key, element]) => [
        key,
        normalizeGeneratedElement(catalog, element),
      ])
    );
  }
  const patches = Object.entries(spec).map(([key, value]) => ({
    op: "add",
    path: "/" + key.replaceAll("~", "~0").replaceAll("/", "~1"),
    value,
  }));
  return (
    response.text +
    "\n```spec\n" +
    patches.map((patch) => JSON.stringify(patch)).join("\n") +
    "\n```\n"
  );
};

/** Streams the company's Responses gateway output as mixed text and spec patches. */
export const handleLocalEditorGenerationRequest = async (
  request: IncomingMessage & { body?: unknown },
  response: ServerResponse,
  { model, loadCatalog, log }: GenerationOptions
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

  const abortController = new AbortController();
  let generatedText = "";
  const abort = () => abortController.abort();
  response.once("close", abort);
  try {
    const catalog = await loadCatalog();
    const input = messages.map(({ role, content }) => ({ role, content }));
    const instructions = buildGenerationPrompt(catalog);
    let started = false;
    const writeEvent = (event: object) => {
      if (!started) {
        started = true;
        response.statusCode = 200;
        response.setHeader(
          "Content-Type",
          "application/x-ndjson; charset=utf-8"
        );
        response.setHeader("X-Visual-Editor-Generation", "validated-v1");
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
      generatedText = "";
      const preview: Spec = { root: "", elements: {} };
      const components = (
        catalog.data as { components: Record<string, { slots?: string[] }> }
      ).components;
      let stateReady = false;
      const needsState = (value: unknown): boolean => {
        if (!value || typeof value !== "object") return false;
        if ("$state" in value || "statePath" in value) return true;
        return Object.values(value).some(needsState);
      };
      const writePreview = () => {
        const elements: Spec["elements"] = {};
        for (const [key, element] of Object.entries(preview.elements)) {
          if (
            !isGeneratedElementShape(key, element) ||
            (!stateReady && needsState(element))
          )
            continue;
          // Validate complete props, including initial state bindings. Child references
          // may still be arriving; the client substitutes placeholders for those.
          const component = components[element.type];
          const leaf = component?.slots?.length === 0;
          const candidate = {
            ...preview,
            root: key,
            elements: {
              [key]: leaf ? element : { ...element, children: [], slots: {} },
            },
          };
          const content = serializeGenerationResponse(
            JSON.stringify({ text: "", spec: candidate }),
            catalog
          );
          if (!validateGeneratedText(catalog, content).length)
            Object.defineProperty(elements, key, {
              value: element,
              enumerable: true,
              configurable: true,
            });
        }
        // A provisional graph must not recurse into a cycle before final validation.
        const visit = (key: string, ancestors: Set<string>) => {
          if (ancestors.has(key)) {
            for (const ancestor of ancestors) delete elements[ancestor];
            return;
          }
          const element = Object.hasOwn(elements, key)
            ? elements[key]
            : undefined;
          if (!element) return;
          const next = new Set(ancestors).add(key);
          for (const child of [
            ...(element.children ?? []),
            ...Object.values(element.slots ?? {}).flat(),
          ])
            visit(child, next);
        };
        visit(preview.root, new Set());
        if (preview.root)
          writeEvent({ type: "preview-spec", spec: { ...preview, elements } });
      };
      const structuredParser = createStructuredGenerationParser({
        onText: (delta) => writeEvent({ type: "preview-text", delta }),
        onValue: (path, value) => {
          if (
            path.length === 2 &&
            path[0] === "spec" &&
            path[1] === "root" &&
            typeof value === "string"
          ) {
            preview.root = value;
            writePreview();
          } else if (
            path.length === 2 &&
            path[0] === "spec" &&
            path[1] === "state" &&
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
          ) {
            preview.state = value as Record<string, unknown>;
            stateReady = true;
            writePreview();
          } else if (
            path.length === 3 &&
            path[0] === "spec" &&
            path[1] === "elements"
          ) {
            const element = normalizeGeneratedElement(catalog, value);
            if (
              element &&
              typeof element === "object" &&
              !Array.isArray(element)
            ) {
              Object.defineProperty(preview.elements, path[2], {
                value: element,
                enumerable: true,
                configurable: true,
                writable: true,
              });
              writePreview();
            }
          }
        },
      });
      let streamFormat: "structured" | "mixed" | undefined;
      const previewDelta = (delta: string) => {
        if (!streamFormat && generatedText.trimStart())
          streamFormat = generatedText.trimStart().startsWith("{")
            ? "structured"
            : "mixed";
        if (streamFormat === "structured") structuredParser.push(delta);
        else if (streamFormat === "mixed")
          writeEvent({ type: "preview", delta });
      };
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
          text: {
            format: {
              type: "json_schema",
              name: "visual_editor_response",
              strict: false,
              schema: {
                type: "object",
                required: ["text", "spec"],
                additionalProperties: false,
                properties: {
                  text: { type: "string" },
                  spec: {
                    anyOf: [
                      { type: "null" },
                      {
                        type: "object",
                        required: ["root", "elements"],
                        properties: {
                          root: { type: "string" },
                          elements: { type: "object" },
                          state: { type: "object" },
                        },
                      },
                    ],
                  },
                },
              },
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
              previewDelta(event.delta);
            }
            if (event.type === "response.completed") {
              completed = true;
              completedResponse = event.response;
              if (!receivedText) {
                generatedText = readOutputText(event.response);
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
      const structured = generatedText.trimStart().startsWith("{");
      generatedText = serializeGenerationResponse(generatedText, catalog);
      if (structured && streamFormat !== "structured")
        writeEvent({ type: "preview", delta: generatedText });
      const errors = validateGeneratedText(catalog, generatedText);
      if (!errors.length) {
        writeEvent({ type: "accepted", content: generatedText });
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
    log("[local-editor generation] Generation failed", {
      correlationId,
      model,
      error: error instanceof Error ? error.message : String(error),
      text: generatedText,
    });
    throw error;
  } finally {
    response.off("close", abort);
    abortController.abort();
  }
};
