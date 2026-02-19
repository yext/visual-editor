import { getDirectoryParents } from "../schema/helpers.ts";
import { normalizeSlug } from "../slugifier.ts";
import { StreamDocument } from "../types/StreamDocument.ts";
import { isPrimaryLocale } from "./resolveUrlFromPathInfo.ts";

export type BreadcrumbLink = {
  name: string;
  slug: string;
};

/**
 * Builds breadcrumb links from __.pathInfo.breadcrumbPrefix and the
 * dm_directoryParents_* field when available.
 */
export const resolveBreadcrumbsFromPathInfo = (
  streamDocument: StreamDocument
): BreadcrumbLink[] | undefined => {
  const breadcrumbPrefix = streamDocument.__?.pathInfo?.breadcrumbPrefix;
  if (typeof breadcrumbPrefix !== "string") {
    return;
  }

  const locale = streamDocument?.locale || streamDocument?.meta?.locale || "";
  if (!locale) {
    return undefined;
  }

  const includeLocalePrefix =
    !isPrimaryLocale(streamDocument) ||
    streamDocument.__?.pathInfo?.includeLocalePrefixForPrimaryLocale;

  const normalizedPrefix = normalizeSlug(breadcrumbPrefix);

  const directoryParents = getDirectoryParents(streamDocument);
  if (directoryParents.length === 0) {
    return undefined;
  }

  const crumbs: BreadcrumbLink[] = [];

  for (const parent of directoryParents) {
    if (!parent || typeof parent !== "object") {
      continue;
    }

    const directoryLevelSlug =
      typeof parent.slug === "string" ? normalizeSlug(parent.slug) : "";
    if (!directoryLevelSlug) {
      continue;
    }

    const normalizedSlug = normalizedPrefix
      ? `${normalizedPrefix}/${directoryLevelSlug}`
      : directoryLevelSlug;
    const slug = includeLocalePrefix
      ? `${locale}/${normalizedSlug}`
      : normalizedSlug;

    const name = (typeof parent.name === "string" && parent.name) || slug;

    crumbs.push({ name, slug });
  }

  if (!crumbs.length) {
    return undefined;
  }

  crumbs.push({ name: streamDocument.name ?? "", slug: "" });

  return crumbs;
};
