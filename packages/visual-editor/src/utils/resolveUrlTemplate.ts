import { StreamDocument } from "./applyTheme";
import { resolveEmbeddedFieldsInString } from "./resolveYextEntityField";
import { normalizeSlug } from "./slugifier";
import { getLocationPath, LocationDocument } from "./getLocationPath.ts";
import { normalizeLocalesInObject } from "./normalizeLocale.ts";

/**
 * Resolves a URL template using the entity page set's URL template (for directory/locator base entities).
 * The URL template can be either primary or alternate based on __.isPrimaryLocale.
 * It replaces embedded fields in the URL template with their corresponding values from the document.
 * If an alternate function is provided, it will be used to resolve the URL template instead of the default logic.
 *
 * @param streamDocument - The document containing the URL template and data.
 * @param relativePrefixToRoot - Prefix to prepend to the resolved URL.
 * @param alternateFunction - Alternate function to resolve the URL template (optional).
 * @returns The resolved and normalized URL.
 */
export const resolveUrlTemplate = (
  streamDocument: StreamDocument,
  relativePrefixToRoot: string = "",
  alternateFunction?: (
    streamDocument: StreamDocument,
    relativePrefixToRoot: string
  ) => string
): string => {
  streamDocument = normalizeLocalesInObject(streamDocument);
  const locale = streamDocument.locale || streamDocument?.meta?.locale || "";
  if (!locale) {
    throw new Error(`Could not determine locale from streamDocument`);
  }

  if (alternateFunction) {
    return alternateFunction(streamDocument, relativePrefixToRoot);
  }

  const isDirectoryOrLocator =
    streamDocument?.__?.codeTemplate === "directory" ||
    streamDocument?.__?.codeTemplate === "locator";

  let urlTemplates;
  if (isDirectoryOrLocator) {
    // Use base entity template for directory/locator
    urlTemplates = JSON.parse(
      streamDocument?.__?.entityPageSetUrlTemplates || "{}"
    );
  } else {
    // Use current page set template
    const pagesetJson = JSON.parse(streamDocument?._pageset || "{}");
    urlTemplates = pagesetJson?.config?.urlTemplate || {};
  }

  const urlTemplate = selectUrlTemplate(streamDocument, urlTemplates);

  if (!urlTemplate) {
    return getLocationPath(
      streamDocument as LocationDocument,
      relativePrefixToRoot
    );
  }

  return buildUrlFromTemplate(
    urlTemplate,
    streamDocument,
    locale,
    relativePrefixToRoot
  );
};

/**
 * Resolves a URL template using the current page set's URL template.
 * This should be used for language dropdown links and other cases where you want to stay within the same page set.
 * The URL template can be either primary or alternate based on __.isPrimaryLocale.
 * It replaces embedded fields in the URL template with their corresponding values from the document.
 * If an alternate function is provided, it will be used to resolve the URL template instead of the default logic.
 *
 * @param streamDocument - The document containing the URL template and data.
 * @param relativePrefixToRoot - Prefix to prepend to the resolved URL.
 * @param alternateFunction - Alternate function to resolve the URL template (optional).
 * @returns The resolved and normalized URL.
 */
export const resolvePageSetUrlTemplate = (
  streamDocument: StreamDocument,
  relativePrefixToRoot: string = "",
  alternateFunction?: (
    streamDocument: StreamDocument,
    relativePrefixToRoot: string
  ) => string
): string => {
  streamDocument = normalizeLocalesInObject(streamDocument);
  const locale = streamDocument.locale || streamDocument?.meta?.locale || "";
  if (!locale) {
    throw new Error(`Could not determine locale from streamDocument`);
  }

  if (alternateFunction) {
    return alternateFunction(streamDocument, relativePrefixToRoot);
  }

  // Always use current page set template
  const pagesetJson = JSON.parse(streamDocument?._pageset || "{}");
  const urlTemplates = pagesetJson?.config?.urlTemplate || {};

  const urlTemplate = selectUrlTemplate(streamDocument, urlTemplates);

  if (!urlTemplate) {
    return getLocationPath(
      streamDocument as LocationDocument,
      relativePrefixToRoot
    );
  }

  return buildUrlFromTemplate(
    urlTemplate,
    streamDocument,
    locale,
    relativePrefixToRoot
  );
};

/**
 * Selects the appropriate URL template (primary or alternate) based on isPrimaryLocale.
 */
const selectUrlTemplate = (
  streamDocument: StreamDocument,
  urlTemplates: { primary?: string; alternate?: string }
): string | undefined => {
  const isPrimaryLocale = streamDocument.__?.isPrimaryLocale !== false;

  if (isPrimaryLocale && urlTemplates.primary) {
    return urlTemplates.primary;
  } else if (!isPrimaryLocale && urlTemplates.alternate) {
    return urlTemplates.alternate;
  } else {
    return urlTemplates.primary || urlTemplates.alternate;
  }
};

/**
 * Builds a URL from a template string by resolving embedded fields and normalizing the slug.
 */
const buildUrlFromTemplate = (
  urlTemplate: string,
  streamDocument: StreamDocument,
  locale: string,
  relativePrefixToRoot: string
): string => {
  const normalizedSlug = normalizeSlug(
    resolveEmbeddedFieldsInString(urlTemplate, streamDocument, locale)
  ).replace(/\/+/g, "/"); // replace multiple slashes with a single slash

  if (!normalizedSlug) {
    throw new Error(`Could not resolve URL template ${urlTemplate}`);
  }

  return relativePrefixToRoot + normalizedSlug;
};
