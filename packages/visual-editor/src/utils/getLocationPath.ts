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
  relativePrefixToRoot: string = "",
  pagesetConfig?: {
    primaryLocale?: string;
    includeLocalePrefixForPrimaryLocale?: boolean;
  }
): string => {
  if (!location?.slug && !location?.address && !location?.id) {
    throw new Error("Could not resolve location path.");
  }

  if (location.slug) {
    return `${relativePrefixToRoot}${location.slug}`;
  }

  const locale = location?.locale || location?.meta?.locale;
  if (!locale) {
    throw new Error("Missing locale for getLocationPath");
  }

  // Use primaryLocale from pageset config, defaulting to "en" for backward compatibility
  const primaryLocale = pagesetConfig?.primaryLocale || "en";
  const isPrimaryLocale =
    location.__?.isPrimaryLocale === true ||
    (location.__?.isPrimaryLocale === undefined && locale === primaryLocale);

  const includeLocalePrefixForPrimary =
    pagesetConfig?.includeLocalePrefixForPrimaryLocale === true;
  const shouldIncludeLocalePrefix =
    !isPrimaryLocale || (isPrimaryLocale && includeLocalePrefixForPrimary);
  const localePath = shouldIncludeLocalePrefix ? `${locale}/` : "";

  const path = location.address
    ? `${localePath}${location.address.region}/${location.address.city}/${location.address.line1}`
    : `${localePath}${location.id}`;

  return `${relativePrefixToRoot}${normalizeSlug(path)}`;
};
