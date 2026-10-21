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
