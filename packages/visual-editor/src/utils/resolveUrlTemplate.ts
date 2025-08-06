import { StreamDocument } from "./applyTheme";
import { resolveEmbeddedFieldsInString } from "./resolveYextEntityField";
import { normalizeSlug } from "./slugifier";

/**
 * Resolves a URL template using the provided stream document, locale, and relativePrefixToRoot.
 * It replaces embedded fields in the URL template with their corresponding values from the document.
 * If an alternate data source is provided, it uses that to resolve embedded fields instead.
 * The URL template can be either primary or alternate based on __.isPrimaryLocale.
 *
 * @param streamDocument - The document containing the URL template and data.
 * @param locale - The locale to use for resolving the URL.
 * @param relativePrefixToRoot - Prefix to prepend to the resolved URL.
 * @param alternateDataSource - Alternate source of data to be used when resolving embedded fields (optional).
 * @returns The resolved and normalized URL.
 */
export const resolveUrlTemplate = (
  streamDocument: StreamDocument,
  locale: string,
  relativePrefixToRoot: string,
  alternateDataSource?: any
): string => {
  const isPrimaryLocale = streamDocument.__?.isPrimaryLocale ?? false;

  const pagesetJson = JSON.parse(streamDocument?._pageset || "{}");
  const urlTemplate =
    pagesetJson?.config?.urlTemplate?.[
      isPrimaryLocale ? "primary" : "alternate"
    ];

  if (!urlTemplate) {
    console.error("No URL template found on document");
    return "";
  }

  const normalizedSlug = normalizeSlug(
    resolveEmbeddedFieldsInString(
      urlTemplate,
      alternateDataSource ?? streamDocument,
      locale
    )
  ).replace(/\/+/g, "/"); // replace multiple slashes with a single slash

  if (!normalizedSlug) {
    console.error("Could not resolve URL template", urlTemplate);
    return "";
  }

  return relativePrefixToRoot + normalizedSlug;
};
