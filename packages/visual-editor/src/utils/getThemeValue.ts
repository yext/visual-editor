import { themeValuesToCss } from "../internal/utils/internalThemeResolver.ts";
import { legacyThemeVariables } from "../internal/theme/legacyTheme.ts";
import { PUCK_PREVIEW_IFRAME_ID } from "./applyTheme.ts";
import { StreamDocument } from "./types/StreamDocument.ts";

const resolveThemeVariables = (
  variableName: string,
  read: (name: string) => string | undefined,
  seen = new Set<string>()
): string | undefined => {
  if (seen.has(variableName)) {
    return undefined;
  }

  seen.add(variableName);

  const value = read(variableName)?.replace("!important", "").trim();
  if (!value) {
    return undefined;
  }
  return (
    value.replace(
      /var\((--[\w-]+)\)/g,
      (_, name) => resolveThemeVariables(name, read, new Set(seen)) ?? ""
    ) || undefined
  );
};

const getThemeValueFromDocument = (
  targetDocument: Document,
  variableName: string
): string | undefined => {
  const styleReader = targetDocument.defaultView?.getComputedStyle;
  if (!styleReader) return undefined;
  const styles = styleReader(targetDocument.documentElement);
  return resolveThemeVariables(variableName, (name) =>
    styles.getPropertyValue(name)
  );
};

const getThemeValueFromPublishedTheme = (
  variableName: string,
  streamDocument?: StreamDocument | Record<string, any>
): string | undefined => {
  let values = {};
  try {
    values = JSON.parse(streamDocument?.__?.theme ?? "{}");
  } catch {
    // Match applyTheme: malformed published data still uses legacy defaults.
  }
  const variables = {
    ...legacyThemeVariables,
    ...themeValuesToCss(values ?? {}),
  };
  return resolveThemeVariables(variableName, (name) => variables[name]);
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
    }

    const publishedValue = getThemeValueFromPublishedTheme(
      variableName,
      streamDocument
    );
    if (publishedValue) {
      return publishedValue;
    }
  } catch {
    // return undefined and let callers apply fallback behavior
  }

  return undefined;
};
