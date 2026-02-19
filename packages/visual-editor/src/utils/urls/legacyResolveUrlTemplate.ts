import { resolveEmbeddedFieldsInString } from "../resolveYextEntityField.ts";
import { normalizeSlug } from "../slugifier.ts";
import { getLocationPath, LocationDocument } from "./getLocationPath.ts";
import { StreamDocument } from "../types/StreamDocument.ts";

/**
 * Legacy method to resolve a URL template using the current page set's URL template.
 * This should be used for language dropdown links and other cases where you want to stay within the same page set.
 * The URL template can be either primary or alternate based on __.isPrimaryLocale.
 * It replaces embedded fields in the URL template with their corresponding values from the document.
 *
 * @param streamDocument - The document containing the URL template and data.
 * @param relativePrefixToRoot - Prefix to prepend to the resolved URL.
 * @param isChild - Flag indicating if resolving for a child entity.
 * @returns The resolved and normalized URL.
 */
export const legacyResolveUrlTemplate = (
  streamDocument: StreamDocument,
  relativePrefixToRoot: string = "",
  isChild: boolean = false
): string | undefined => {
  let urlTemplates;

  if (isChild) {
    urlTemplates = JSON.parse(
      streamDocument?.__?.entityPageSetUrlTemplates || "{}"
    );
  } else {
    const pagesetJson = JSON.parse(streamDocument?._pageset || "{}");
    // Don't attempt to resolve URL template for DIRECTORY or LOCATOR page sets
    if (pagesetJson?.type === "DIRECTORY" || pagesetJson?.type === "LOCATOR") {
      return;
    }
    urlTemplates = pagesetJson?.config?.urlTemplate || {};
  }

  return legacyResolveUrlTemplateWithTemplates(
    streamDocument,
    relativePrefixToRoot,
    urlTemplates
  );
};

/**
 * Core URL template resolution logic used by legacyResolveUrlTemplate.
 * Resolves a URL template using the provided URL templates object.
 */
const legacyResolveUrlTemplateWithTemplates = (
  streamDocument: StreamDocument,
  relativePrefixToRoot: string,
  urlTemplates: { primary?: string; alternate?: string }
): string | undefined => {
  const locale = streamDocument.locale || streamDocument?.meta?.locale || "";
  if (!locale) {
    return;
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
export const buildUrlFromTemplate = (
  urlTemplate: string,
  streamDocument: StreamDocument,
  locale: string,
  relativePrefixToRoot: string
): string | undefined => {
  const normalizedSlug = normalizeSlug(
    resolveEmbeddedFieldsInString(urlTemplate, streamDocument, locale)
  );

  if (!normalizedSlug) {
    return;
  }

  return relativePrefixToRoot + normalizedSlug;
};
