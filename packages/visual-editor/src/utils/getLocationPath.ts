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
  if (!location || (!location.slug && !location.address && !location.id)) {
    throw new Error("Could not resolve location path.");
  }

  const locale = location?.locale || location?.meta?.locale;
  if (!locale) {
    throw new Error("Missing locale for getLocationPath");
  }

  if (location.slug) {
    return `${relativePrefixToRoot}${location.slug}`;
  }

  const isPrimaryLocale =
    location.__?.isPrimaryLocale === true ||
    location.__?.isPrimaryLocale === "true" ||
    (location.__?.isPrimaryLocale === undefined && location.locale === "en");

  const localePath = isPrimaryLocale ? "" : `${locale}/`;
  const path = location.address
    ? `${localePath}${location.address.region}/${location.address.city}/${location.address.line1}`
    : `${localePath}${location.id}`;

  return `${relativePrefixToRoot}${normalizeSlug(path)}`;
};
