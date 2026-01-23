import { StreamDocument } from "../index.ts";
import { normalizeSlug } from "../slugifier.ts";
import { AddressType } from "@yext/pages-components";
import { isPrimaryLocale } from "./resolveUrlFromPathInfo.ts";

export interface LocationDocument extends StreamDocument {
  id: string;
  slug?: string;
  address?: AddressType;
}

// Fallback method to get location path when no URL template is defined
export const getLocationPath = (
  location: LocationDocument,
  relativePrefixToRoot: string = ""
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

  const isPrimary = isPrimaryLocale(location);

  const localePath = isPrimary ? "" : `${locale}/`;
  const path = location.address
    ? `${localePath}${location.address.region}/${location.address.city}/${location.address.line1}`
    : `${localePath}${location.id}`;

  return `${relativePrefixToRoot}${normalizeSlug(path)}`;
};
