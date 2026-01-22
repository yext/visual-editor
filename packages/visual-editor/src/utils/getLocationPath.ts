import { normalizeSlug } from "./slugifier.ts";
import { AddressType } from "@yext/pages-components";
import { StreamDocument } from "./applyTheme.ts";
import {
  getIsPrimaryLocale,
  getLocalePrefix,
  getPageSetConfig,
} from "./pageset.ts";

export interface LocationDocument extends StreamDocument {
  id: string;
  slug?: string;
  address?: AddressType;
}

// Returns the path for a location document, applying locale prefixes as needed.
// If slug is present, uses slug. Otherwise, constructs path from address or id.
// Should be used as a fallback when URL templates are not available.
export const getLocationPath = (
  location: LocationDocument,
  relativePrefixToRoot: string = ""
): string => {
  if (!location?.slug && !location?.address && !location?.id) {
    throw new Error("Could not resolve location path.");
  }

  // If there's a slug, don't apply locale prefix to it
  if (location.slug) {
    return `${relativePrefixToRoot}${location.slug}`;
  }

  const locale = location?.locale || location?.meta?.locale;
  if (!locale) {
    throw new Error("Missing locale for getLocationPath");
  }

  const pageSetConfig = getPageSetConfig(location?._pageset);
  const isPrimaryLocale = getIsPrimaryLocale({
    locale,
    pageSetConfig,
    fallbackIsPrimaryLocale: location.__?.isPrimaryLocale,
  });
  const localePrefix = getLocalePrefix({
    locale,
    isPrimaryLocale,
    includeLocalePrefixForPrimaryLocale:
      pageSetConfig?.includeLocalePrefixForPrimaryLocale,
  });

  const path = location.address
    ? `${localePrefix}${location.address.region}/${location.address.city}/${location.address.line1}`
    : `${localePrefix}${location.id}`;

  return `${relativePrefixToRoot}${normalizeSlug(path)}`;
};
