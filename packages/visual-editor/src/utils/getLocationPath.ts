import { normalizeSlug } from "./slugifier.ts";
import { AddressType } from "@yext/pages-components";
import { StreamDocument } from "./applyTheme.ts";

export interface LocationDocument extends StreamDocument {
  slug?: string;
  id: string;
  address?: AddressType;
  locale?: string;
}

export const getLocationPath = (
  location: LocationDocument,
  locale: string,
  relativePrefixToRoot: string = ""
): string => {
  if (!location || (!location.slug && !location.address && !location.id)) {
    throw new Error(
      `Could not resolve location path. Document is invalid: ${JSON.stringify(location)}`
    );
  }

  if (!locale) {
    throw new Error("Missing locale for getLocationPath");
  }

  if (location.slug) {
    return `${relativePrefixToRoot ?? ""}${location.slug}`;
  }

  const isPrimaryLocale = location.__?.isPrimaryLocale ?? false;

  const localePath = isPrimaryLocale ? "" : `${locale ?? location.locale}/`;
  const path = location.address
    ? `${localePath}${location.address.region}/${location.address.city}/${location.address.line1}`
    : `${localePath}${location.id}`;

  return `${relativePrefixToRoot}${normalizeSlug(path)}`;
};
