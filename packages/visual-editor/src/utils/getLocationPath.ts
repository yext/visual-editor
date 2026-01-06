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

  // Special handling for directory entities (DM cases): if slug exists and no address,
  // check if we need to add locale prefix before returning early
  if (location.slug && !location.address) {
    // Check if slug already starts with the primaryLocale prefix
    const slugStartsWithPrimaryLocale = location.slug.startsWith(
      `${primaryLocale}/`
    );

    // If locale matches primary AND includeLocalePrefixForPrimaryLocale is true,
    // add prefix if not already present
    if (
      isPrimaryLocale &&
      includeLocalePrefixForPrimary &&
      !slugStartsWithPrimaryLocale
    ) {
      return `${relativePrefixToRoot}${localePath}${location.slug}`;
    }

    // Otherwise, use slug directly (already has prefix or doesn't need one)
    return `${relativePrefixToRoot}${location.slug}`;
  }

  // If there's a slug (with address, so it's a location entity), apply locale prefix to it
  if (location.slug) {
    return `${relativePrefixToRoot}${localePath}${location.slug}`;
  }

  const path = location.address
    ? `${localePath}${location.address.region}/${location.address.city}/${location.address.line1}`
    : `${localePath}${location.id}`;

  return `${relativePrefixToRoot}${normalizeSlug(path)}`;
};
