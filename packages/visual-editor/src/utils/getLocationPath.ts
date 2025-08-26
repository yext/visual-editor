import { normalizeSlug } from "./slugifier.ts";
import { AddressType } from "@yext/pages-components";
import { StreamDocument } from "./applyTheme.ts";

export interface LocationDocument extends StreamDocument {
  slug?: string;
  id: string;
  address?: AddressType;
  isPrimary?: boolean;
}

export const getLocationPath = (
  location: LocationDocument,
  locale: string,
  relativePrefixToRoot: string | undefined
): string | undefined => {
  if (!location || (!location.slug && !location.address && !location.id)) {
    return;
  }

  if (location.slug) {
    return `${relativePrefixToRoot ?? ""}${location.slug}`;
  }

  const isPrimaryLocale = location.__?.isPrimaryLocale ?? false;

  const localePath = isPrimaryLocale ? "" : `${locale}/`;
  const path = location.address
    ? `${localePath}${location.address.region}/${location.address.city}/${location.address.line1}-${location.id}`
    : `${localePath}${location.id}`;

  return `${relativePrefixToRoot ?? ""}${normalizeSlug(path)}`;
};
