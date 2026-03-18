import { normalizeSlug } from "../slugifier.ts";
import { StreamDocument } from "../types/StreamDocument.ts";
import { isPrimaryLocale } from "./resolveUrlFromPathInfo.ts";

type DirectoryListChildrenResolver = (
  streamDocument: StreamDocument,
  child: {
    slug?: string;
  }
) => string | undefined;

const resolveDirectoryListChildrenFromPathInfo: DirectoryListChildrenResolver =
  (streamDocument, child): string | undefined => {
    if (!streamDocument.__?.pathInfo) {
      return;
    }

    const childSlug = child?.slug;
    if (typeof childSlug !== "string") {
      return childSlug;
    }

    const locale = streamDocument?.locale || streamDocument?.meta?.locale || "";
    if (!locale) {
      return;
    }

    const includeLocalePrefix =
      !isPrimaryLocale(streamDocument) ||
      streamDocument.__?.pathInfo?.includeLocalePrefixForPrimaryLocale;

    const breadcrumbPrefix = normalizeSlug(
      streamDocument.__?.pathInfo?.breadcrumbPrefix ?? ""
    );
    const slugWithPrefix = breadcrumbPrefix
      ? `${breadcrumbPrefix}/${childSlug}`
      : childSlug;

    return includeLocalePrefix
      ? `${normalizeSlug(locale)}/${slugWithPrefix}`
      : slugWithPrefix;
  };

const resolveDirectoryListChildrenFromSlug: DirectoryListChildrenResolver = (
  _streamDocument,
  child
): string | undefined => {
  return child?.slug;
};

const resolvers: DirectoryListChildrenResolver[] = [
  resolveDirectoryListChildrenFromPathInfo,
  resolveDirectoryListChildrenFromSlug,
];

export const resolveDirectoryListChildren = (
  streamDocument: StreamDocument,
  child: { slug?: string }
): string | undefined => {
  for (const resolve of resolvers) {
    try {
      const result = resolve(streamDocument, child);
      if (result !== undefined) {
        return result;
      }
    } catch {
      // continue to next resolver
    }
  }

  return undefined;
};
