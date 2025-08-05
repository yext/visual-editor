import { StreamDocument } from "./applyTheme";
import { resolveEmbeddedFieldsInString } from "./resolveYextEntityField";
import { normalizeSlug } from "./slugifier";

/**
 * Resolves a URL template using the provided stream document and locale.
 * The URL template can be either primary or alternate based on __.isPrimaryLocale.
 *
 * @param streamDocument - The document containing the URL template and data.
 * @param locale - The locale to use for resolving the URL.
 * @param relativePrefixToRoot - Optional prefix to prepend to the resolved URL.
 * @returns The resolved and normalized URL.
 */
export const resolveUrlTemplate = (
  streamDocument: StreamDocument,
  locale: string,
  relativePrefixToRoot?: string
): string => {
  const isPrimaryLocale = streamDocument.__?.isPrimaryLocale ?? false;

  const pagesetJson = JSON.parse(streamDocument?._pageset || "{}");
  const urlTemplate =
    pagesetJson?.config?.urlTemplate?.[
      isPrimaryLocale ? "primary" : "alternate"
    ];
  if (!urlTemplate) {
    return "";
  }

  return (
    (relativePrefixToRoot ?? "") +
    normalizeSlug(
      resolveEmbeddedFieldsInString(urlTemplate, streamDocument, locale)
    )
  );
};
