import { StreamDocument } from "./applyTheme";
import { resolveEmbeddedFieldsInString } from "./resolveYextEntityField";
import { normalizeSlug } from "./slugifier";
import { getLocationPath, LocationDocument } from "./getLocationPath.ts";
import { normalizeLocale } from "./normalizeLocale.ts";

/**
 * Resolves a URL template using the provided stream document, locale, and relativePrefixToRoot.
 * The URL template can be either primary or alternate based on __.isPrimaryLocale.
 * It replaces embedded fields in the URL template with their corresponding values from the document.
 * If an alternate function is provided, it will be used to resolve the URL template instead of the default logic.
 *
 * @param streamDocument - The document containing the URL template and data.
 * @param locale - The locale to use for resolving the URL.
 * @param relativePrefixToRoot - Prefix to prepend to the resolved URL.
 * @param alternateFunction - Alternate function to resolve the URL template (optional).
 * @returns The resolved and normalized URL.
 */
export const resolveUrlTemplate = (
  streamDocument: StreamDocument,
  locale: string,
  relativePrefixToRoot: string = "",
  alternateFunction?: (
    streamDocument: StreamDocument,
    locale: string,
    relativePrefixToRoot: string
  ) => string
): string => {
  locale = locale || streamDocument.locale || streamDocument?.meta?.locale;
  if (!locale) {
    throw new Error(`Could not determine locale from streamDocument`);
  }
  locale = normalizeLocale(locale);
  if (alternateFunction) {
    return alternateFunction(streamDocument, locale, relativePrefixToRoot);
  }

  const isPrimaryLocale = streamDocument.__?.isPrimaryLocale ?? false;

  const pagesetJson = JSON.parse(streamDocument?._pageset || "{}");
  let urlTemplate =
    pagesetJson?.config?.urlTemplate?.[
      isPrimaryLocale ? "primary" : "alternate"
    ];

  if (!urlTemplate) {
    console.warn("No URL template found on the document");
    return getLocationPath(
      streamDocument as LocationDocument,
      locale,
      relativePrefixToRoot
    );
  }

  // Replace [[locale]] in the template with the resolved locale
  urlTemplate = urlTemplate.replace(/\[\[locale\]\]/g, locale);

  const normalizedSlug = normalizeSlug(
    resolveEmbeddedFieldsInString(urlTemplate, streamDocument, locale)
  ).replace(/\/+/g, "/"); // replace multiple slashes with a single slash

  if (!normalizedSlug) {
    throw new Error("Could not resolve URL template");
  }

  return relativePrefixToRoot + normalizedSlug;
};
