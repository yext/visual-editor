import { resolveEmbeddedFieldsInString } from "../resolveYextEntityField.ts";
import { normalizeSlug } from "../slugifier.ts";
import { StreamDocument } from "../types/StreamDocument.ts";

// Resolves a URL from the streamDocument's __.pathInfo.template
// or __.pathInfo.sourceEntityPageSetTemplate (if isChild is true).
export const resolveUrlFromPathInfo = (
  streamDocument: StreamDocument,
  relativePrefixToRoot: string = "",
  isChild: boolean = false
): string | undefined => {
  const pathInfoJson = streamDocument.__?.pathInfo;

  let urlTemplate;
  if (isChild) {
    urlTemplate = pathInfoJson?.sourceEntityPageSetTemplate || "";
  } else {
    urlTemplate = pathInfoJson?.template || "";
  }

  if (!urlTemplate) {
    return;
  }

  const locale = streamDocument?.locale || streamDocument?.meta?.locale || "";
  if (!locale) {
    throw new Error("Missing locale for resolveUrlFromPathInfo");
  }

  const normalizedSlug = normalizeSlug(
    resolveEmbeddedFieldsInString(urlTemplate, streamDocument, locale)
  );

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
  const pathInfoJson = streamDocument.__?.pathInfo;
  const locale = streamDocument?.locale || streamDocument?.meta?.locale || "";
  if (pathInfoJson?.primaryLocale) {
    return pathInfoJson?.primaryLocale === locale;
  }

  if (streamDocument.__?.isPrimaryLocale !== undefined) {
    return streamDocument.__?.isPrimaryLocale;
  }

  // Default to 'en' as primary locale if nothing is specified
  return locale === "en";
};
