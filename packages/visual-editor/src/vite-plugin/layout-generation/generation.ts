import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { z } from "zod";
import {
  readJsonRequestBody,
  sendJsonResponse,
} from "../local-editor/server.ts";

export const GENERATION_GATEWAY_URL =
  "http://modelgateway.service.us3dev.consul:8008/openai/responses";
const modelRequestSchema = z.object({
  model: z.string().min(1),
  stream: z.literal(true),
  max_output_tokens: z.number().int().positive(),
  instructions: z.string(),
  input: z.array(
    z.object({ role: z.enum(["user", "assistant"]), content: z.string() })
  ),
  text: z.object({
    format: z.object({
      type: z.literal("json_schema"),
      name: z.string(),
      strict: z.literal(true),
      schema: z.record(z.string(), z.unknown()),
    }),
  }),
});

/** Development transport only: forward prepared requests and raw response bytes. */
export const handleLocalEditorModelRequest = async (
  request: IncomingMessage & { body?: unknown },
  response: ServerResponse,
  {
    model,
    log,
  }: { model: string; log: (message: string, details: object) => void }
) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJsonResponse(response, { error: "Use POST to generate a spec." }, 405);
    return;
  }
  const body = await readJsonRequestBody(request, 16 * 1024 * 1024);
  if (!body.ok) {
    sendJsonResponse(
      response,
      { error: "Request must contain a valid model request." },
      body.status
    );
    return;
  }
  const parsed = modelRequestSchema.safeParse(body.payload);
  if (!parsed.success || parsed.data.model !== model) {
    sendJsonResponse(
      response,
      { error: "Invalid generation request or configured model." },
      400
    );
    return;
  }
  const suppliedId = request.headers["x-visual-editor-correlation-id"];
  const correlationId =
    typeof suppliedId === "string" && /^[0-9a-f-]{36}$/i.test(suppliedId)
      ? suppliedId
      : randomUUID();
  const controller = new AbortController();
  const abort = () => controller.abort();
  response.once("close", abort);
  try {
    const upstream = await fetch(GENERATION_GATEWAY_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Yext-Business-Id": "1000152098",
        "Yext-Source": "vle-ai-layout-generation-poc",
        "Correlation-Id": correlationId,
      },
      body: JSON.stringify(body.payload),
    });
    log("[local-editor generation] Gateway response", {
      correlationId,
      status: upstream.status,
      model,
      contentType: upstream.headers.get("Content-Type"),
      contentLength: upstream.headers.get("Content-Length"),
      requestId:
        upstream.headers.get("x-request-id") ??
        upstream.headers.get("request-id"),
      retryAfter: upstream.headers.get("retry-after"),
    });
    if (!upstream.ok) {
      const errorBody = await upstream.text();
      log("[local-editor generation] Gateway error response", {
        correlationId,
        status: upstream.status,
        responseBody: errorBody.slice(0, 8192),
      });
      sendJsonResponse(
        response,
        {
          error: `AI gateway HTTP ${upstream.status} (correlation ${correlationId}).`,
        },
        upstream.status
      );
      return;
    }
    if (!upstream.body)
      throw new Error("The gateway returned no response body.");
    response.statusCode = 200;
    response.setHeader(
      "Content-Type",
      upstream.headers.get("Content-Type") ?? "application/json"
    );
    response.setHeader("Cache-Control", "no-cache, no-transform");
    response.setHeader("X-Accel-Buffering", "no");
    response.flushHeaders();
    await pipeline(Readable.fromWeb(upstream.body as any), response, {
      signal: controller.signal,
    });
  } catch (error) {
    log("[local-editor generation] Gateway failed", {
      correlationId,
      model,
      aborted: controller.signal.aborted,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (!response.destroyed) {
      if (response.headersSent)
        response.destroy(
          error instanceof Error ? error : new Error(String(error))
        );
      else
        sendJsonResponse(
          response,
          { error: error instanceof Error ? error.message : String(error) },
          502
        );
    }
  } finally {
    response.off("close", abort);
    controller.abort();
  }
};
