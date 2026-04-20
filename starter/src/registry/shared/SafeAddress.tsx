import type { ComponentProps } from "react";
import { Address as PagesAddress } from "@yext/pages-components";

type PagesAddressProps = ComponentProps<typeof PagesAddress>;

const hasAddressContent = (address: PagesAddressProps["address"]): boolean => {
  if (!address) {
    return false;
  }

  return Boolean(
    address.line1 ||
      address.line2 ||
      address.city ||
      address.region ||
      address.postalCode ||
      address.countryCode,
  );
};

export const Address = (props: PagesAddressProps) => {
  if (!hasAddressContent(props.address)) {
    return null;
  }

  return <PagesAddress {...props} />;
};

export type { AddressLine } from "@yext/pages-components";
