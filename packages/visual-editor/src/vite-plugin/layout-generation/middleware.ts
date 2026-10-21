import type { IncomingMessage, ServerResponse } from "node:http";
import type { SectionLibraryLayout } from "../../types/sectionLibrary.ts";
import { getLocalEditorGenerationLocales } from "../local-editor/data.ts";
import { sendJsonResponse } from "../local-editor/server.ts";
import type { createGenerationLogger } from "./generationLogger.ts";
import {
  handleGenerationDiagnostics,
  handleGenerationErrorReport,
} from "./generationReports.ts";
import { handleLocalEditorModelRequest } from "./modelProxy.ts";

/** Local generation routes fall through to the rest of the Vite middleware stack. */
export const createGenerationMiddleware =
  ({
    rootDir,
    getLayouts,
    getModel,
    logGeneration,
  }: {
    rootDir: string;
    getLayouts: () => SectionLibraryLayout[];
    getModel: () => string;
    logGeneration: ReturnType<typeof createGenerationLogger>;
  }) =>
  (request: IncomingMessage, response: ServerResponse, next: () => void) => {
    if (!request.url) {
      next();
      return;
    }
    const reportPath = new URL(request.url, "http://localhost").pathname;
    if (reportPath === "/__yext_visual_editor/local-editor/generate/context") {
      const layoutId = new URL(
        request.url,
        "http://localhost"
      ).searchParams.get("layoutId");
      void (async () => {
        if (!layoutId) {
          sendJsonResponse(response, { error: "A layoutId is required." }, 400);
          return;
        }
        sendJsonResponse(response, {
          model: getModel(),
          locales: await getLocalEditorGenerationLocales(
            rootDir,
            getLayouts(),
            layoutId
          ),
        });
      })().catch((error) =>
        sendJsonResponse(response, { error: String(error) }, 500)
      );
      return;
    }

    if (
      reportPath === "/__yext_visual_editor/local-editor/generate/error" ||
      reportPath === "/__yext_visual_editor/local-editor/generate/diagnostics"
    ) {
      const handleReport = reportPath.endsWith("/diagnostics")
        ? handleGenerationDiagnostics
        : handleGenerationErrorReport;
      void handleReport(request, response, logGeneration).catch(
        (error: unknown) => {
          logGeneration("[local-editor generation] Error report failed", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          if (!response.headersSent) {
            sendJsonResponse(
              response,
              { error: "Unable to record chat error" },
              500
            );
          } else {
            response.destroy();
          }
        }
      );
      return;
    }
    if (
      new URL(request.url, "http://localhost").pathname ===
      "/__yext_visual_editor/local-editor/generate"
    ) {
      void handleLocalEditorModelRequest(request, response, {
        log: logGeneration,
        model: getModel(),
      }).catch((error: unknown) => {
        logGeneration("[local-editor generation] Request failed", {
          correlationId: request.headers["x-visual-editor-correlation-id"],
          method: request.method,
          url: request.url,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        void logGeneration.flush();
        if (response.headersSent) {
          response.destroy(
            error instanceof Error ? error : new Error(String(error))
          );
        } else {
          sendJsonResponse(
            response,
            {
              error: error instanceof Error ? error.message : String(error),
            },
            500
          );
        }
      });
      return;
    }
    next();
  };
