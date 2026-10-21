import type { IncomingMessage, ServerResponse } from "node:http";
import { vi } from "vitest";
import type { PuckGenerationCatalog } from "../../utils/generationCatalog.ts";
import { ChatGenerationError } from "./chat/chatGenerationRequest.ts";
import { ModelTransportError, isTransportStatus } from "./modelTransport.ts";

/** Keep existing behavioral assertions while exercising the extracted engine. */
export const handleLocalEditorGenerationRequest = async (
  request: IncomingMessage & { body?: unknown },
  response: ServerResponse,
  options: {
    model: string;
    loadContext: (
      layoutId: string
    ) => Promise<
      { catalog: PuckGenerationCatalog; locales: string[] } | undefined
    >;
    log: (message: string, details: object) => void;
  }
) => {
  const { executeGeneration } =
    await vi.importActual<typeof import("./engine.ts")>("./engine.ts");
  const controller = new AbortController();
  const abort = () => controller.abort(new Error("Generation cancelled."));
  response.once("close", abort);
  const body = request.body as any;
  let started = false;
  const write = (event: object) => {
    if (response.destroyed) return;
    started = true;
    response.statusCode = 200;
    response.setHeader(
      "X-Visual-Editor-Generation",
      (body.mode ?? "create") === "create"
        ? "strict-puck-overrides-v2"
        : "section-edits-v1"
    );
    response.write(JSON.stringify(event) + "\n");
  };
  try {
    const context = await options.loadContext(body.layoutId);
    if (!context) throw new Error("Unknown layout");
    const event = await executeGeneration(
      body,
      {
        ...context,
        model: options.model,
        diagnostics: { log: options.log, report: () => {} },
        transport: async (body, signal) => {
          const response = await fetch(
            "http://modelgateway.service.us3dev.consul:8008/openai/responses",
            { method: "POST", body: JSON.stringify(body), signal }
          );
          if (!response.ok)
            throw new ModelTransportError(
              `AI gateway HTTP ${response.status}`,
              isTransportStatus(response.status)
            );
          return {
            contentType:
              response.headers.get("Content-Type") ?? "application/json",
            body: response.body!,
          };
        },
      },
      controller.signal,
      crypto.randomUUID(),
      (usage) => write({ type: "usage", usage })
    );
    write(event);
    response.end();
  } catch (error) {
    const failure = error as ChatGenerationError;
    if (!started && failure.status) {
      response.statusCode = failure.status;
      response.end(JSON.stringify({ error: failure.message }));
    } else {
      write({
        type: "error",
        error: failure.message,
        transport: failure.transport,
        retryable: failure.retryable,
        validationFeedback: failure.feedback,
      });
      response.end();
    }
  } finally {
    response.off("close", abort);
    controller.abort();
  }
};
