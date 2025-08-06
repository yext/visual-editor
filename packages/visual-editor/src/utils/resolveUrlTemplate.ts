import { StreamDocument } from "./applyTheme";
import { resolveEmbeddedFieldsInString } from "./resolveYextEntityField";
import { normalizeSlug } from "./slugifier";

/**
 * Resolves a URL template using the provided stream document, locale, and relativePrefixToRoot.
 * The URL template can be either primary or alternate based on __.isPrimaryLocale.
 * It replaces embedded fields in the URL template with their corresponding values from the document.
 * If an alternate data source is provided, it uses that to resolve embedded fields instead.
 * If an alternate function is provided, it will be used to resolve the URL template instead of the default logic.
 *
 * @param streamDocument - The document containing the URL template and data.
 * @param locale - The locale to use for resolving the URL.
 * @param relativePrefixToRoot - Prefix to prepend to the resolved URL.
 * @param alternateDataSource - Alternate source of data to be used when resolving embedded fields (optional).
 * @param alternateFunction - Alternate function to resolve the URL template (optional).
 * @returns The resolved and normalized URL.
 */
export const resolveUrlTemplate = (
  streamDocument: StreamDocument,
  locale: string,
  relativePrefixToRoot: string,
  alternateDataSource?: any,
  alternateFunction?: (
    streamDocument: StreamDocument,
    locale: string,
    relativePrefixToRoot: string,
    alternateDataSource?: any
  ) => string
): string => {
  if (alternateFunction) {
    return alternateFunction(
      streamDocument,
      locale,
      relativePrefixToRoot,
      alternateDataSource
    );
  }

  const isPrimaryLocale = streamDocument.__?.isPrimaryLocale ?? false;

  const pagesetJson = JSON.parse(streamDocument?._pageset || "{}");
  const urlTemplate =
    pagesetJson?.config?.urlTemplate?.[
      isPrimaryLocale ? "primary" : "alternate"
    ];

  if (!urlTemplate) {
    throw new Error("No URL template found on document");
  }

  const normalizedSlug = normalizeSlug(
    resolveEmbeddedFieldsInString(
      urlTemplate,
      alternateDataSource ?? streamDocument,
      locale
    )
  ).replace(/\/+/g, "/"); // replace multiple slashes with a single slash

  if (!normalizedSlug) {
    throw new Error("Could not resolve URL template", urlTemplate);
  }

  return relativePrefixToRoot + normalizedSlug;
};
