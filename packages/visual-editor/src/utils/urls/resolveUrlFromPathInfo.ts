import { resolveEmbeddedFieldsInString } from "../resolveYextEntityField";
import { normalizeSlug } from "../slugifier";
import { PathInfoShape, StreamDocument } from "../types/StreamDocument";

// Resolves a URL from the streamDocument's __.pathInfo.template
export const resolveUrlFromPathInfo = (
  streamDocument: StreamDocument,
  relativePrefixToRoot: string = "",
  alternateFunction?: (
    streamDocument: StreamDocument,
    relativePrefixToRoot: string
  ) => string
): string | undefined => {
  const pathInfoJson = getPathInfoJson(streamDocument);
  const urlTemplate = pathInfoJson?.template || "";

  if (!urlTemplate) {
    return;
  }

  if (alternateFunction) {
    // For Hybrid Developers, allow passing an alternate function to resolve the URL template
    return alternateFunction(streamDocument, relativePrefixToRoot);
  }

  const locale = streamDocument?.locale || streamDocument?.meta?.locale || "";
  if (!locale) {
    return normalizeSlug(
      resolveEmbeddedFieldsInString(urlTemplate, streamDocument)
    ).replace(/\/+/g, "/");
  }

  const normalizedSlug = normalizeSlug(
    resolveEmbeddedFieldsInString(urlTemplate, streamDocument, locale)
  ).replace(/\/+/g, "/");

  const isPrimary = isPrimaryLocale(streamDocument);
  const shouldIncludeLocalePrefix =
    !isPrimary ||
    (isPrimary && pathInfoJson?.includeLocalePrefixForPrimaryLocale);

  return (
    relativePrefixToRoot +
    (shouldIncludeLocalePrefix ? `${locale}/${normalizedSlug}` : normalizedSlug)
  );
};

/**
 * Determines if the streamDocument corresponds to the primary locale
 * 1. Check pathInfo.primaryLocale, if set compare with streamDocument locale
 * 2. Check streamDocument.__.isPrimaryLocale, if set use that value
 * 3. Default to 'en' as primary locale
 */
export const isPrimaryLocale = (streamDocument: StreamDocument): boolean => {
  const pathInfoJson = getPathInfoJson(streamDocument);
  const locale = streamDocument?.locale || streamDocument?.meta?.locale || "";
  if (pathInfoJson.primaryLocale) {
    return pathInfoJson?.primaryLocale === locale;
  }

  if (streamDocument.__?.isPrimaryLocale !== undefined) {
    return streamDocument.__?.isPrimaryLocale;
  }

  // Default to 'en' as primary locale if nothing is specified
  return locale === "en";
};

// Parses the __.pathInfo JSON safely
const getPathInfoJson = (streamDocument: StreamDocument): PathInfoShape => {
  try {
    return JSON.parse(streamDocument?.__?.pathInfo || "{}") as PathInfoShape;
  } catch {
    return {};
  }
};
