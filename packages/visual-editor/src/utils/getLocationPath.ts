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
  const primaryLocale = pagesetConfig?.primaryLocale || "en";
  const isPrimaryLocale =
    location.__?.isPrimaryLocale === true ||
    (location.__?.isPrimaryLocale === undefined && locale === primaryLocale);

  const localePrefix =
    !isPrimaryLocale || pagesetConfig?.includeLocalePrefixForPrimaryLocale
      ? `${locale}/`
      : "";

  // If there's a slug, apply locale prefix to it
  if (location.slug) {
    return `${relativePrefixToRoot}${localePrefix}${location.slug}`;
  }

  const path = location.address
    ? `${localePrefix}${location.address.region}/${location.address.city}/${location.address.line1}`
    : `${localePrefix}${location.id}`;

  return `${relativePrefixToRoot}${normalizeSlug(path)}`;
};
