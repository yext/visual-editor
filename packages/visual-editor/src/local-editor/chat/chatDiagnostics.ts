import { isDeepEqual } from "../../utils/deepEqual.ts";

/** Locate changed values, including changes inside visible cards and manual backups. */
export const changedChatPaths = (before: unknown, after: unknown): string[] => {
  const paths: string[] = [];
  const visit = (left: any, right: any, path: string) => {
    if (paths.length >= 100 || isDeepEqual(left, right)) {
      return;
    }
    if (
      left &&
      right &&
      typeof left === "object" &&
      typeof right === "object"
    ) {
      for (const key of new Set([
        ...Object.keys(left),
        ...Object.keys(right),
      ])) {
        visit(
          left[key],
          right[key],
          `${path}/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`
        );
      }
    } else {
      paths.push(path || "/");
    }
  };
  visit(before, after, "");
  return paths;
};

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
