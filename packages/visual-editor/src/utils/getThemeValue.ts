import { PUCK_PREVIEW_IFRAME_ID } from "./applyTheme.ts";
import { StreamDocument } from "./types/StreamDocument.ts";

const getThemeValueFromDocument = (
  targetDocument: Document,
  variableName: string
): string | undefined => {
  const themedRoot =
    targetDocument.getElementsByClassName("components")?.[0] ?? null;
  const styleReader = targetDocument.defaultView?.getComputedStyle;

  if (!styleReader) {
    return undefined;
  }

  const elementsToRead = [themedRoot, targetDocument.documentElement].filter(
    (element): element is Element => !!element
  );

  for (const element of elementsToRead) {
    const value = styleReader(element)
      .getPropertyValue(variableName)
      .replace("!important", "")
      .trim();

    if (value) {
      return value;
    }
  }

  return undefined;
};

/**
 * Reads a theme CSS variable value in both editor and page-generation contexts.
 */
export const getThemeValue = (
  variableName: string,
  streamDocument?: StreamDocument | Record<string, any>
): string | undefined => {
  try {
    if (typeof window !== "undefined") {
      const previewFrame = document.getElementById(
        PUCK_PREVIEW_IFRAME_ID
      ) as HTMLIFrameElement | null;
      const documentsToCheck = [previewFrame?.contentDocument, document].filter(
        (targetDocument): targetDocument is Document => !!targetDocument
      );

      for (const targetDocument of documentsToCheck) {
        const value = getThemeValueFromDocument(targetDocument, variableName);
        if (value) {
          return value;
        }
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
