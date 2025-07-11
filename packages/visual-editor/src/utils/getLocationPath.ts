import { normalizeSlug } from "./slugifier.ts";
import { AddressType } from "@yext/pages-components";

interface LocationDocument extends Record<string, any> {
  slug?: string;
  id: string;
  address?: AddressType;
}

export const getLocationPath = (
  location: LocationDocument,
  document: Record<string, any>,
  relativePrefixToRoot: string | undefined
): string | undefined => {
  if (!location || (!location.slug && !location.address && !location.id)) {
    return;
  }

  if (location.slug) {
    return `${relativePrefixToRoot ?? ""}${location.slug}`;
  }

  const locale = document.locale;

  const localePath = locale !== "en" ? `${locale}/` : "";
  const path = location.address
    ? `${localePath}${location.address.region}/${location.address.city}/${location.address.line1}-${location.id}`
    : `${localePath}${location.id}`;

  return `${relativePrefixToRoot ?? ""}${normalizeSlug(path)}`;
};
