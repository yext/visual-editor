import { normalizeLocalesInObject } from "../normalizeLocale";
import { StreamDocument } from "../types/StreamDocument";
import { getLocationPath, LocationDocument } from "./getLocationPath";
import { resolveUrlFromPathInfo } from "./resolveUrlFromPathInfo";
import {
  resolvePageSetUrlTemplate,
  resolveUrlTemplateOfChild,
} from "./resolveUrlTemplate";

// Order of resolvers to attempt for resolving the PageSet's url
// 1. resolveUrlFromPathInfo
// 2. resolvePageSetUrlTemplate
// 3. getLocationPath
const resolvers: Array<
  (
    streamDocument: StreamDocument,
    relativePrefixToRoot: string,
    alternateFunction?: (
      streamDocument: StreamDocument,
      relativePrefixToRoot: string
    ) => string
  ) => string | undefined
> = [
  (streamDocument, relativePrefixToRoot, alternateFunction) =>
    resolveUrlFromPathInfo(
      streamDocument,
      relativePrefixToRoot,
      alternateFunction
    ),
  (streamDocument, relativePrefixToRoot, alternateFunction) =>
    resolvePageSetUrlTemplate(
      streamDocument,
      relativePrefixToRoot,
      alternateFunction
    ),
  (streamDocument, relativePrefixToRoot) =>
    getLocationPath(streamDocument as LocationDocument, relativePrefixToRoot),
];

// Resolves the URL for a PageSet entity using new or legacy methods
export const resolvePageSetUrl = (
  streamDocument: StreamDocument,
  relativePrefixToRoot: string,
  alternateFunction?: (
    streamDocument: StreamDocument,
    relativePrefixToRoot: string
  ) => string
): string => {
  streamDocument = normalizeLocalesInObject(streamDocument);

  for (const resolve of resolvers) {
    try {
      const result = resolve(
        streamDocument,
        relativePrefixToRoot,
        alternateFunction
      );
      if (result) {
        return result;
      }
    } catch {
      // Continue to the next resolver in the array
    }
  }
  console.error("failed to resolve url");
  return "";
};

const childResolvers: Array<
  (
    streamDocument: StreamDocument,
    relativePrefixToRoot: string,
    alternateFunction?: (
      streamDocument: StreamDocument,
      relativePrefixToRoot: string
    ) => string
  ) => string | undefined
> = [
  (streamDocument, relativePrefixToRoot, alternateFunction) =>
    resolveUrlFromPathInfo(
      streamDocument,
      relativePrefixToRoot,
      alternateFunction
    ),
  (streamDocument, relativePrefixToRoot, alternateFunction) =>
    resolveUrlTemplateOfChild(
      streamDocument,
      relativePrefixToRoot,
      alternateFunction
    ),
];

// Resolves the URL for a PageSet entity's child using new or legacy methods
export const resolvePageSetUrlOfChild = (
  streamDocument: StreamDocument,
  relativePrefixToRoot?: string,
  alternateFunction?: (
    streamDocument: StreamDocument,
    relativePrefixToRoot: string
  ) => string
): string => {
  streamDocument = normalizeLocalesInObject(streamDocument);

  for (const resolve of childResolvers) {
    try {
      const result = resolve(
        streamDocument,
        relativePrefixToRoot ?? "",
        alternateFunction
      );
      if (result) {
        return result;
      }
    } catch {
      // Continue to the next resolver in the array
    }
  }

  console.error("failed to resolve url for child entity");
  return "";
};
