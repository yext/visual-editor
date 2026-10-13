import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { StringDecoder } from "node:string_decoder";
import { buildUserPrompt, type Spec } from "@json-render/core";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import type { GeneratedContent } from "../../local-editor/types.ts";
import { compileGenerationSchema } from "./generationSchema.ts";
import {
  buildGenerationPrompt,
  generatedContentShape,
  validateGeneratedContent,
} from "./generationValidation.ts";
import { createFlatPatchStream, FlatPatchError } from "./flatPatchStream.ts";
import {
  copyPuckFlatSidecar,
  flatSpecToPuckData,
  puckDataToFlatSpec,
  type FlatLayoutSpec,
} from "./puckFlatAdapter.ts";
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

  const baselineData = {
    root: { props: {} },
    content: (currentData as GeneratedContent | undefined)?.content ?? [],
    zones: {},
  } as any;
  let flatBaseline: FlatLayoutSpec;
  try {
    flatBaseline = puckDataToFlatSpec(catalog, baselineData);
  } catch (error) {
    rejectRequest(error instanceof Error ? error.message : String(error), 422);
    return;
  }

  const abortController = new AbortController();
  let generatedText = "";
  let started = false;
  let gatewayStarted = false;
  let disconnected = false;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  const abort = () => {
    disconnected = true;
    abortController.abort();
  };
  response.once("close", abort);
  try {
    const history = messages.slice(0, -1).flatMap(({ role, content }) => {
      if (role === "assistant") {
        try {
          const parsed = JSON.parse(content);
          if (parsed && typeof parsed === "object" && "spec" in parsed) {
            content = typeof parsed.text === "string" ? parsed.text : "";
            if (!content) return [];
          }
        } catch {
          // Plain assistant prose remains useful conversational context.
        }
        const lines = content.split(/\r?\n/);
        const proseLines = lines.filter((rawLine: string) => {
          const line = rawLine.trim();
          if (!line || line === "```" || line === "```json") return false;
          try {
            const operation = JSON.parse(line);
            return !(
              operation &&
              typeof operation === "object" &&
              typeof operation.op === "string" &&
              typeof operation.path === "string"
            );
          } catch {
            return true;
          }
        });
        content = proseLines.join("\n").trim();
        if (!content) return [];
      }
      return [{ role, content }];
    });
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
    let repairErrors: string[] | undefined;
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
      let attemptUsage: GatewayResponse["usage"];
      const guardRepetition = createGenerationRepetitionGuard();
      const attemptBaseline: FlatLayoutSpec = structuredClone(flatBaseline);
      copyPuckFlatSidecar(flatBaseline, attemptBaseline);
      let latestCandidate: FlatLayoutSpec = attemptBaseline;
      let validPreviewCount = 0;
      const patchStream = createFlatPatchStream(
        attemptBaseline,
        (delta) => {
          generatedText += delta;
          writeEvent({ type: "preview-text", delta });
        },
        (candidate) => {
          copyPuckFlatSidecar(flatBaseline, candidate);
          latestCandidate = candidate;
          try {
            const preview = flatSpecToPuckData(
              catalog,
              candidate,
              baselineData,
              undefined,
              flatBaseline
            );
            compiled.validateContent({ content: preview.content });
            validPreviewCount++;
            writeEvent({
              type: "preview-spec",
              spec: { content: preview.content },
            });
          } catch {
            // Incomplete or invalid intermediate graphs do not replace the last valid preview.
          }
        }
      );
      const checkRepetition = (delta: string) => {
        try {
          guardRepetition(delta);
        } catch (error) {
          patchStream.cancel();
          throw error;
        }
      };
      const promptText = [
        messages.at(-1).content,
        ...(repairErrors
          ? [
              "The supplied starting graph is your rejected draft, not the editor layout. Correct this proposal using the validation errors below. Some checks report the first failure; inspect the whole draft against the catalog and flat mapping and fix all similar issues in the same response. This draft may be only a partial prefix because generation stopped early. Complete the original request in full, including content that has not yet been generated; do not stop merely because the current draft validates. Preserve requested additions and existing components. Do not replace an add request with a change to an existing component.\n" +
                repairErrors.join("\n") +
                "\nEach operation must be a complete JSON object on its own line, separated by an actual newline. Do not concatenate objects or print literal \\n separators.\nSyntax example only (generate operations for the requested changes):\n" +
                JSON.stringify({
                  op: "test",
                  path: "/root",
                  value: flatBaseline.root,
                }) +
                "\n" +
                JSON.stringify({
                  op: "test",
                  path: `/elements/${flatBaseline.root}/type`,
                  value: "__PuckContentRoot",
                }),
            ]
          : []),
      ].join("\n\n");
      const input = [
        ...history,
        {
          role: "user",
          content: buildUserPrompt({
            prompt: promptText,
            currentSpec: flatBaseline as Spec,
            editModes: ["patch"],
            format: "json",
          }),
        },
      ];
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
      let accepted: { text: string; spec: GeneratedContent | null } | undefined;
      let errors: string[] = [];
      let phase: "upstream" | "reconstruction" | "schema" = "upstream";
      let failureCategory: string | undefined;
      let diagnostic: Record<string, unknown> | undefined;
      let attemptReader: ReadableStreamDefaultReader<Uint8Array> | undefined;
      const logOutcome = (
        validationOutcome: string,
        details: Record<string, unknown> = {}
      ) =>
        log("[local-editor generation] Attempt outcome", {
          correlationId,
          attempt: attempt + 1,
          attemptCount: attempt + 1,
          validationOutcome,
          ...patchStream.stats,
          validPreviewCount,
          usage: attemptUsage,
          ...details,
        });
      try {
        const upstream = await fetch(GENERATION_GATEWAY_URL, gatewayRequest);
        log("[local-editor generation] Gateway response", {
          correlationId,
          model,
          status: upstream.status,
          contentType: upstream.headers.get("Content-Type"),
        });
        if (!upstream.ok || !upstream.body) {
          logOutcome("error", { failureCategory: "upstream", repair: false });
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
        gatewayStarted = true;

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
          attemptUsage = result.usage;
          const outputText = readOutputText(result);
          checkRepetition(outputText);
          await patchStream.push(outputText);
          log("[local-editor generation] Completed response", {
            correlationId,
            model: result.model ?? model,
            responseId: result.id,
            status: result.status,
            usage: result.usage,
            text: outputText,
          });
        } else {
          attemptReader = upstream.body.getReader();
          const reader = attemptReader;
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
                      item.content?.some(
                        (content) => content.type === "refusal"
                      )
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
              if (event.response?.usage) attemptUsage = event.response.usage;
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
                checkRepetition(event.delta);
                await patchStream.push(event.delta);
              }
              if (event.type === "response.completed") {
                completed = true;
                completedResponse = event.response;
                if (!receivedText) {
                  const outputText = readOutputText(event.response);
                  checkRepetition(outputText);
                  await patchStream.push(outputText);
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
        const result = await patchStream.finish();
        phase = "reconstruction";
        const finalData = result.patchCount
          ? flatSpecToPuckData(
              catalog,
              result.spec,
              baselineData,
              undefined,
              flatBaseline
            )
          : undefined;
        phase = "schema";
        accepted = {
          text:
            generatedText.trim() ||
            (result.patchCount ? "Updated the layout." : ""),
          spec: finalData ? { content: finalData.content } : null,
        };
        errors = finalData
          ? validateGeneratedContent(catalog, accepted.spec)
          : [];
        if (finalData) compiled.validateContent(accepted.spec);
        if (errors.length) failureCategory = "schema";
      } catch (error) {
        if (error instanceof FlatPatchError) {
          failureCategory = error.category;
          diagnostic = {
            lineNumber: error.lineNumber,
            operationNumber: error.operationNumber,
            path: error.path,
            excerpt: error.excerpt,
          };
        } else if (phase !== "upstream") failureCategory = phase;
        else {
          logOutcome("error", {
            failureCategory: "upstream",
            repair: false,
            validationErrors: [
              error instanceof Error ? error.message : String(error),
            ],
          });
          throw error;
        }
        errors = [error instanceof Error ? error.message : String(error)];
      } finally {
        await patchStream.cancel();
        await attemptReader?.cancel().catch(() => {});
      }
      logOutcome(errors.length ? "rejected" : "accepted", {
        failureCategory,
        diagnostic,
        validationErrors: errors.length ? errors : undefined,
        repair: errors.length > 0 && attempt < 2,
      });
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
      flatBaseline = latestCandidate;
      repairErrors = errors;
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
      validationOutcome: "error",
    });
    if (gatewayStarted && !disconnected) {
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
