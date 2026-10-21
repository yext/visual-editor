import type { GenerationDiagnostics } from "../internal/generation/environment.ts";

/** Persist browser reports without affecting generation or chat error state. */
const postChatReport = (
  url: string,
  details: object,
  failureMessage: string
) => {
  void (async () => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
    } catch (error) {
      console.error(failureMessage, error);
    }
  })();
};

export const reportChatDiagnostic = (api: string, details: object) =>
  postChatReport(
    `${api}/diagnostics`,
    details,
    "Unable to record chat diagnostics:"
  );

export const reportChatError = (api: string, details: object) =>
  postChatReport(`${api}/error`, details, "Unable to report chat error:");

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
