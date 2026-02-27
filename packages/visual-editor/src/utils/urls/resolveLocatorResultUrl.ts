import { StreamDocument } from "../types/StreamDocument.ts";
import { resolveUrlFromSourcePageSets } from "./resolveUrlFromSourcePageSets.ts";
import { resolveUrlTemplateOfChild } from "./resolveUrlTemplate.ts";

/**
 * Resolves the URL for a locator result from the stream document.
 */
export function resolveLocatorResultUrl(
  profile: any,
  streamDocument: StreamDocument,
  relativePrefixToRoot: string = ""
) {
  if (streamDocument?.__?.locatorSourcePageSets) {
    return resolveUrlFromSourcePageSets(
      profile,
      streamDocument,
      relativePrefixToRoot
    );
  }
  return resolveUrlTemplateOfChild(
    profile,
    streamDocument,
    relativePrefixToRoot
  );
}
