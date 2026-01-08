import { StreamDocument } from "./applyTheme";
import { resolveEmbeddedFieldsInString } from "./resolveYextEntityField";
import { normalizeSlug } from "./slugifier";
import { getLocationPath, LocationDocument } from "./getLocationPath.ts";
import { normalizeLocalesInObject } from "./normalizeLocale.ts";

/**
 * Resolves a URL template using the base entity page set's URL template.
 * This function is specifically for resolving URLs of child entities (locations)
 * that are children of directory or locator pages, using the entityPageSetUrlTemplates.
 * The URL template can be either primary or alternate based on __.isPrimaryLocale.
 * It replaces embedded fields in the URL template with their corresponding values from the document.
 * If an alternate function is provided, it will be used to resolve the URL template instead of the default logic.
 *
 * @param streamDocument - The document containing the URL template and data.
 * @param relativePrefixToRoot - Prefix to prepend to the resolved URL.
 * @param alternateFunction - Alternate function to resolve the URL template (optional).
 * @returns The resolved and normalized URL.
 */
export const resolveUrlTemplateOfChild = (
  streamDocument: StreamDocument,
  relativePrefixToRoot: string = "",
  alternateFunction?: (
    streamDocument: StreamDocument,
    relativePrefixToRoot: string
  ) => string
): string => {
  // Use base entity template (entityPageSetUrlTemplates)
  const urlTemplates = JSON.parse(
    streamDocument?.__?.entityPageSetUrlTemplates || "{}"
  );

  return resolveUrlTemplateWithTemplates(
    streamDocument,
    relativePrefixToRoot,
    urlTemplates,
    alternateFunction
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
  // Use current page set template
  const pagesetJson =
    typeof streamDocument?._pageset === "string"
      ? JSON.parse(streamDocument._pageset || "{}")
      : streamDocument?._pageset || {};
  const urlTemplates = pagesetJson?.config?.urlTemplate || {};

  return resolveUrlTemplateWithTemplates(
    streamDocument,
    relativePrefixToRoot,
    urlTemplates,
    alternateFunction
  );
};

/**
 * Core URL template resolution logic used by both resolveUrlTemplateOfChild and resolvePageSetUrlTemplate.
 * Resolves a URL template using the provided URL templates object.
 */
const resolveUrlTemplateWithTemplates = (
  streamDocument: StreamDocument,
  relativePrefixToRoot: string,
  urlTemplates: { primary?: string; alternate?: string },
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
 * Adds locale prefix based on primaryLocale and includeLocalePrefixForPrimaryLocale config.
 * If the template already includes [[locale]] at the start, it won't add an additional prefix.
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

  // Get pageset config from the document's _pageset
  const pagesetJson =
    typeof streamDocument?._pageset === "string"
      ? JSON.parse(streamDocument._pageset || "{}")
      : streamDocument?._pageset || {};
  const pagesetConfig = pagesetJson?.config || {};
  // Prioritize pageset config primaryLocale, then fall back to __.isPrimaryLocale
  const isPrimaryLocale =
    locale === pagesetConfig?.primaryLocale ||
    streamDocument.__?.isPrimaryLocale;

  const localePrefix =
    !isPrimaryLocale || pagesetConfig?.includeLocalePrefixForPrimaryLocale
      ? `${locale}/`
      : "";

  return relativePrefixToRoot + localePrefix + normalizedSlug;
};
