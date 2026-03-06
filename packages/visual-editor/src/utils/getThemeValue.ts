import { StreamDocument } from "./types/StreamDocument.ts";

/**
 * Reads a theme CSS variable value in both editor and page-generation contexts.
 */
export const getThemeValue = (
  variableName: string,
  streamDocument?: StreamDocument | Record<string, any>
): string | undefined => {
  try {
    if (typeof window !== "undefined") {
      let themedRoot: Element | null = null;

      const previewFrame = document.getElementById(
        "preview-frame"
      ) as HTMLIFrameElement | null;
      if (previewFrame?.contentDocument) {
        themedRoot =
          previewFrame.contentDocument.getElementsByClassName(
            "components"
          )?.[0] ?? null;
      }

      if (!themedRoot) {
        themedRoot = document.getElementsByClassName("components")?.[0] ?? null;
      }

      if (themedRoot) {
        const value = window
          .getComputedStyle(themedRoot)
          .getPropertyValue(variableName)
          .replace("!important", "")
          .trim();
        if (value) {
          return value;
        }
      }

      const rootValue = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .replace("!important", "")
        .trim();
      if (rootValue) {
        return rootValue;
      }
    } else if (streamDocument?.__?.theme) {
      const publishedValue = JSON.parse(streamDocument.__.theme)?.[
        variableName
      ];
      if (publishedValue) {
        return String(publishedValue).trim();
      }
    }
  } catch {
    // return undefined and let callers apply fallback behavior
  }

  return undefined;
};
