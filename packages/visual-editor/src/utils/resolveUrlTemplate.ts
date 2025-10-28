import { StreamDocument } from "./applyTheme";
import { resolveEmbeddedFieldsInString } from "./resolveYextEntityField";
import { normalizeSlug } from "./slugifier";
import { getLocationPath, LocationDocument } from "./getLocationPath.ts";
import { normalizeLocalesInObject } from "./normalizeLocale.ts";

/**
 * Resolves a URL template using the provided stream document, locale, and relativePrefixToRoot.
 * The URL template can be either primary or alternate based on __.isPrimaryLocale.
 * It replaces embedded fields in the URL template with their corresponding values from the document.
 * If an alternate function is provided, it will be used to resolve the URL template instead of the default logic.
 *
 * @param streamDocument - The document containing the URL template and data.
 * @param relativePrefixToRoot - Prefix to prepend to the resolved URL.
 * @param alternateFunction - Alternate function to resolve the URL template (optional).
 * @param options - Additional options for URL template resolution.
 * @param options.useCurrentPageSetTemplate - If true, uses the current page set template instead of the base entity template for directory/locator pages (default: false).
 * @returns The resolved and normalized URL.
 */
export const resolveUrlTemplate = (
  streamDocument: StreamDocument,
  relativePrefixToRoot: string = "",
  alternateFunction?: (
    streamDocument: StreamDocument,
    relativePrefixToRoot: string
  ) => string,
  options?: {
    useCurrentPageSetTemplate?: boolean;
  }
): string => {
  streamDocument = normalizeLocalesInObject(streamDocument);
  const locale = streamDocument.locale || streamDocument?.meta?.locale || "";
  if (!locale) {
    throw new Error(`Could not determine locale from streamDocument`);
  }

  if (alternateFunction) {
    return alternateFunction(streamDocument, relativePrefixToRoot);
  }

  const isPrimaryLocale = streamDocument.__?.isPrimaryLocale !== false;

  let urlTemplates;
  const isDirectoryOrLocator =
    streamDocument?.__?.codeTemplate === "directory" ||
    streamDocument?.__?.codeTemplate === "locator";

  if (isDirectoryOrLocator && !options?.useCurrentPageSetTemplate) {
    // Use base entity template for directory/locator (legacy behavior)
    urlTemplates = JSON.parse(
      streamDocument?.__?.entityPageSetUrlTemplates || "{}"
    );
  } else {
    // Use current page set template
    const pagesetJson = JSON.parse(streamDocument?._pageset || "{}");
    urlTemplates = pagesetJson?.config?.urlTemplate || {};
  }

  let urlTemplate: string | undefined;
  if (isPrimaryLocale && urlTemplates.primary) {
    urlTemplate = urlTemplates.primary;
  } else if (!isPrimaryLocale && urlTemplates.alternate) {
    urlTemplate = urlTemplates.alternate;
  } else {
    urlTemplate = urlTemplates.primary || urlTemplates.alternate;
  }

  if (!urlTemplate) {
    return getLocationPath(
      streamDocument as LocationDocument,
      relativePrefixToRoot
    );
  }

  const normalizedSlug = normalizeSlug(
    resolveEmbeddedFieldsInString(urlTemplate, streamDocument, locale)
  ).replace(/\/+/g, "/"); // replace multiple slashes with a single slash

  if (!normalizedSlug) {
    throw new Error(`Could not resolve URL template ${urlTemplate}`);
  }

  return relativePrefixToRoot + normalizedSlug;
};
