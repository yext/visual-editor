import {
  reportChatDiagnostic,
  reportChatError,
} from "./generationDiagnostics.ts";
import {
  ModelTransportError,
  isTransportStatus,
  type ModelTransport,
} from "../internal/generation/modelTransport.ts";
import type { GenerationDiagnostics } from "../internal/generation/environment.ts";

export const createLocalModelTransport =
  (api: string): ModelTransport =>
  async (body, signal, diagnosticId) => {
    const response = await fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Visual-Editor-Correlation-Id": diagnosticId,
      },
      body: JSON.stringify(body),
      signal,
    });
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      throw new ModelTransportError(
        result?.error ?? `AI gateway HTTP ${response.status}.`,
        isTransportStatus(response.status),
        response.status
      );
    }
    if (!response.body)
      throw new ModelTransportError(
        "The gateway returned no response body.",
        true
      );
    return {
      contentType: response.headers.get("Content-Type") ?? "application/json",
      body: response.body,
    };
  };

/** Report writes never affect generation state. */
export const createLocalGenerationDiagnostics = (
  api: string,
  layoutId: string
): GenerationDiagnostics => {
  let sequence = 0;
  const diagnosticId = crypto.randomUUID();
  const report: GenerationDiagnostics["report"] = (kind, details) =>
    kind === "error"
      ? reportChatError(api, details)
      : reportChatDiagnostic(api, details);
  return {
    log: (message, details) =>
      report("diagnostics", {
        layoutId,
        correlationId:
          (details as { correlationId?: string }).correlationId ?? diagnosticId,
        sequence: sequence++,
        phase: message.slice(0, 100),
        details,
      }),
    report,
  };
};
