import { resolveEmbeddedFieldsInString } from "../resolveYextEntityField.ts";
import { normalizeSlug } from "../slugifier.ts";
import { StreamDocument } from "../types/StreamDocument.ts";
import { isPrimaryLocale } from "./resolveUrlFromPathInfo.ts";

export type BreadcrumbLink = {
  name: string;
  slug: string;
};

/**
 * Builds breadcrumb links from __.pathInfo.breadcrumbTemplates when available.
 * Each template is resolved with the current streamDocument, normalized, and
 * optionally prefixed with locale based on includeLocalePrefixForPrimaryLocale.
 */
export const resolveBreadcrumbsFromPathInfo = (
  streamDocument: StreamDocument
): BreadcrumbLink[] | undefined => {
  const templates = streamDocument.__?.pathInfo?.breadcrumbTemplates;
  if (!templates || !Array.isArray(templates) || templates.length === 0) {
    return undefined;
  }

  const locale = streamDocument?.locale || streamDocument?.meta?.locale || "";
  if (!locale) {
    return undefined;
  }

  const includeLocalePrefix =
    !isPrimaryLocale(streamDocument) ||
    streamDocument.__?.pathInfo?.includeLocalePrefixForPrimaryLocale;

  const crumbs: BreadcrumbLink[] = [];

  for (const template of templates) {
    if (!template) {
      continue;
    }

    const resolved = resolveEmbeddedFieldsInString(
      template,
      streamDocument,
      locale
    );

    const normalizedSlug = normalizeSlug(resolved).replace(/\/+/g, "/");
    if (!normalizedSlug) {
      continue;
    }

    const slug = includeLocalePrefix
      ? `${locale}/${normalizedSlug}`
      : normalizedSlug;

    const segment = normalizedSlug.split("/").filter(Boolean).pop();
    const name = segment || streamDocument.name || slug;

    crumbs.push({ name, slug });
  }

  return crumbs.length ? crumbs : undefined;
};
