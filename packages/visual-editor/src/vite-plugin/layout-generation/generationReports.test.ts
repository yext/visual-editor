// @vitest-environment node
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { createGenerationLogger } from "./generationLogger.ts";
import {
  handleGenerationErrorReport,
  handleGenerationDiagnostics,
} from "./generationReports.ts";

describe.each([
  {
    name: "error",
    handle: handleGenerationErrorReport,
    message: "[local-editor generation] Chat failed",
    report: {
      layoutId: "location",
      correlationId: "request-one",
      phase: "resolve-and-commit",
      error: "Cannot read properties of undefined (reading 'entityField')",
      stack: "TypeError at CTAWrapper.resolveData",
      candidate: { content: [{ type: "CTAWrapper", props: { id: "cta" } }] },
    },
    invalidBody: JSON.stringify({ error: "missing layout" }),
  },
  {
    name: "diagnostic",
    handle: handleGenerationDiagnostics,
    message: "[local-editor generation] Browser diagnostic",
    report: {
      layoutId: "location",
      correlationId: "turn",
      sequence: 12,
      phase: "canvas-observed",
      details: {
        taskId: "event-colors",
        validationError: "Manual backup differs",
        changedPaths: ["/content/0/props/slots/CardSlot"],
        snapshot: { content: [] },
      },
    },
    invalidBody: JSON.stringify({ phase: "resolved" }),
  },
])("$name reports", ({ handle, message, report, invalidBody }) => {
  it.each(["stream", "middleware"])(
    "persists browser reports before acknowledging (%s)",
    async (source) => {
      const directory = mkdtempSync(path.join(tmpdir(), "chat-reports-"));
      const log = createGenerationLogger(directory);
      const request = Object.assign(Readable.from([JSON.stringify(report)]), {
        method: "POST",
        ...(source === "middleware" ? { body: report } : {}),
      });
      const response = { setHeader: vi.fn(), end: vi.fn(), statusCode: 200 };
      try {
        await handle(
          request as IncomingMessage,
          response as unknown as ServerResponse,
          log
        );
        expect(response.end).toHaveBeenCalledWith(
          JSON.stringify({ recorded: true })
        );
        const entry = JSON.parse(
          readFileSync(path.join(directory, readdirSync(directory)[0]), "utf8")
        );
        expect(entry).toMatchObject({ message, ...report });
      } finally {
        await log.close();
        rmSync(directory, { recursive: true, force: true });
      }
    }
  );

  it.each(["not JSON", invalidBody, "x".repeat(4 * 1024 * 1024 + 1)])(
    "rejects invalid reports (%#)",
    async (body) => {
      const log = Object.assign(vi.fn(), { flush: vi.fn(async () => {}) });
      const request = Object.assign(Readable.from([body]), { method: "POST" });
      const response = { setHeader: vi.fn(), end: vi.fn(), statusCode: 200 };
      await handle(
        request as IncomingMessage,
        response as unknown as ServerResponse,
        log
      );
      expect(response.statusCode).toBe(
        body.length > 4 * 1024 * 1024 ? 413 : 400
      );
      expect(log).not.toHaveBeenCalled();
    }
  );
});
