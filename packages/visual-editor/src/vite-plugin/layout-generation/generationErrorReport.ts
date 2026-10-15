import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { sendJsonResponse } from "../local-editor/server.ts";

const reportSchema = z.object({
  layoutId: z.string().max(1024),
  correlationId: z.string().max(100).optional(),
  phase: z.string().max(100).optional(),
  historyMessageCount: z.number().int().nonnegative().optional(),
  status: z.number().int().optional(),
  error: z.string().max(32_768),
  stack: z.string().max(65_536).optional(),
  candidate: z.unknown().optional(),
});

/** Browser resolution happens after server acceptance; keep its failures in the session log. */
export const handleGenerationErrorReport = async (
  request: IncomingMessage & { body?: unknown },
  response: ServerResponse,
  log: ((message: string, details: object) => void) & {
    flush: () => Promise<void>;
  }
) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJsonResponse(
      response,
      { error: "Use POST to report a chat error." },
      405
    );
    return;
  }
  const maxBytes = 4 * 1024 * 1024;
  let body: string;
  if (request.body !== undefined) {
    body = Buffer.isBuffer(request.body)
      ? request.body.toString("utf8")
      : typeof request.body === "string"
        ? request.body
        : JSON.stringify(request.body);
  } else {
    const chunks: Buffer[] = [];
    let bytes = 0;
    for await (const chunk of request) {
      const buffer = Buffer.from(chunk);
      bytes += buffer.length;
      if (bytes > maxBytes) {
        sendJsonResponse(
          response,
          { error: "Chat error report is too large." },
          413
        );
        return;
      }
      chunks.push(buffer);
    }
    body = Buffer.concat(chunks).toString("utf8");
  }
  if (Buffer.byteLength(body) > maxBytes) {
    sendJsonResponse(
      response,
      { error: "Chat error report is too large." },
      413
    );
    return;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    sendJsonResponse(
      response,
      { error: "Invalid chat error report JSON." },
      400
    );
    return;
  }
  const result = reportSchema.safeParse(parsed);
  if (!result.success) {
    sendJsonResponse(response, { error: "Invalid chat error report." }, 400);
    return;
  }
  log("[local-editor generation] Chat failed", result.data);
  await log.flush();
  sendJsonResponse(response, { recorded: true });
};
