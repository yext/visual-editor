import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import {
  GENERATION_ERROR_MAX_CHARACTERS,
  GENERATION_PHASE_MAX_CHARACTERS,
  GENERATION_REPORT_MAX_BYTES,
  GENERATION_STACK_MAX_CHARACTERS,
} from "../../internal/layoutGeneration/limits.ts";
import {
  readJsonRequestBody,
  sendJsonResponse,
} from "../local-editor/server.ts";

const errorReportSchema = z.object({
  layoutId: z.string().max(1024),
  correlationId: z.string().max(100).optional(),
  phase: z.string().max(GENERATION_PHASE_MAX_CHARACTERS).optional(),
  historyMessageCount: z.number().int().nonnegative().optional(),
  status: z.number().int().optional(),
  error: z.string().max(GENERATION_ERROR_MAX_CHARACTERS),
  stack: z.string().max(GENERATION_STACK_MAX_CHARACTERS).optional(),
  candidate: z.unknown().optional(),
});

const diagnosticReportSchema = z.object({
  layoutId: z.string().max(1024),
  correlationId: z.string().max(100),
  sequence: z.number().int().nonnegative(),
  phase: z.string().max(GENERATION_PHASE_MAX_CHARACTERS),
  details: z.record(z.string(), z.unknown()),
});

type ReportOptions = {
  schema: z.ZodType<object>;
  methodError: string;
  oversizedError: string;
  jsonError: string;
  validationError: string;
  message: string;
};

/** Persist validated browser reports in the generation session log. */
const createReportHandler =
  (options: ReportOptions) =>
  async (
    request: IncomingMessage & { body?: unknown },
    response: ServerResponse,
    log: ((message: string, details: object) => void) & {
      flush: () => Promise<void>;
    }
  ) => {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      sendJsonResponse(response, { error: options.methodError }, 405);
      return;
    }
    const body = await readJsonRequestBody(
      request,
      GENERATION_REPORT_MAX_BYTES
    );
    if (!body.ok) {
      sendJsonResponse(
        response,
        {
          error:
            body.status === 413 ? options.oversizedError : options.jsonError,
        },
        body.status
      );
      return;
    }
    const result = options.schema.safeParse(body.payload);
    if (!result.success) {
      sendJsonResponse(response, { error: options.validationError }, 400);
      return;
    }
    log(options.message, result.data);
    await log.flush();
    sendJsonResponse(response, { recorded: true });
  };

/** Browser resolution can fail after the server accepts a generated result. */
export const handleGenerationErrorReport = createReportHandler({
  schema: errorReportSchema,
  methodError: "Use POST to report a chat error.",
  oversizedError: "Chat error report is too large.",
  jsonError: "Invalid chat error report JSON.",
  validationError: "Invalid chat error report.",
  message: "[local-editor generation] Chat failed",
});

/** Keep browser commit and resolution snapshots alongside model requests. */
export const handleGenerationDiagnostics = createReportHandler({
  schema: diagnosticReportSchema,
  methodError: "Use POST to record diagnostics.",
  oversizedError: "Invalid or oversized diagnostic report.",
  jsonError: "Invalid or oversized diagnostic report.",
  validationError: "Invalid diagnostic report.",
  message: "[local-editor generation] Browser diagnostic",
});
