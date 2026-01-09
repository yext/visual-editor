import { normalizeSlug } from "./slugifier.ts";
import { AddressType } from "@yext/pages-components";
import { StreamDocument } from "./applyTheme.ts";

export interface LocationDocument extends StreamDocument {
  id: string;
  slug?: string;
  address?: AddressType;
}

export const getLocationPath = (
  location: LocationDocument,
  relativePrefixToRoot: string = ""
): string => {
  if (!location?.slug && !location?.address && !location?.id) {
    throw new Error("Could not resolve location path.");
  }

  // If there's a slug, apply locale prefix to it
  if (location.slug) {
    return `${relativePrefixToRoot}${location.slug}`;
  }

  const locale = location?.locale || location?.meta?.locale;
  if (!locale) {
    throw new Error("Missing locale for getLocationPath");
  }

  // Get pageset config from the document's _pageset
  const pagesetJson =
    typeof location?._pageset === "string"
      ? JSON.parse(location._pageset || "{}")
      : location?._pageset || {};
  const pagesetConfig = pagesetJson?.config || {};
  // Prioritize pageset config primaryLocale, if not set then fall back to __.isPrimaryLocale
  const isPrimaryLocale = !!pagesetConfig?.primaryLocale
    ? locale === pagesetConfig.primaryLocale
    : location.__?.isPrimaryLocale;

  const localePrefix =
    !isPrimaryLocale || pagesetConfig?.includeLocalePrefixForPrimaryLocale
      ? `${locale}/`
      : "";

  const path = location.address
    ? `${localePrefix}${location.address.region}/${location.address.city}/${location.address.line1}`
    : `${localePrefix}${location.id}`;

  return `${relativePrefixToRoot}${normalizeSlug(path)}`;
};
