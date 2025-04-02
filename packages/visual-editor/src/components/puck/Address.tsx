import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  AddressType,
  getDirections,
  Address as RenderAddress,
} from "@yext/pages-components";
import { Body } from "./atoms/body.js";
import "@yext/pages-components/style.css";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  CTA,
} from "../../index.ts";

type AddressProps = {
  address: YextEntityField<AddressType>;
  showGetDirections: boolean;
};

const addressFields: Fields<AddressProps> = {
  address: YextEntityFieldSelector<any, AddressType>({
    label: "Address",
    filter: { types: ["type.address"] },
  }),
  showGetDirections: {
    label: "Show Get Directions Link",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
};

const Address = ({
  address: addressField,
  showGetDirections,
}: AddressProps) => {
  const document = useDocument();
  const address = resolveYextEntityField(document, addressField);
  const coordinates = getDirections(
    address as AddressType,
    undefined,
    undefined,
    { provider: "google" }
  );

  return (
    <>
      {address && (
        <EntityField
          displayName="Address"
          fieldId={addressField.field}
          constantValueEnabled={addressField.constantValueEnabled}
        >
          <Body variant="base">
            <RenderAddress
              address={address as AddressType}
              lines={[["line1"], ["line2", "city", "region", "postalCode"]]}
            />
          </Body>
          {coordinates && showGetDirections && (
            <CTA
              link={coordinates}
              label="Get Directions"
              linkType="DRIVING_DIRECTIONS"
              target="_blank"
              variant="link"
            />
          )}
        </EntityField>
      )}
    </>
  );
};

const AddressComponent: ComponentConfig<AddressProps> = {
  fields: addressFields,
  defaultProps: {
    address: {
      field: "address",
      constantValue: {
        line1: "",
        city: "",
        region: "",
        postalCode: "",
        countryCode: "",
      },
      constantValueEnabled: true,
    },
    showGetDirections: true,
  },
  label: "Address",
  render: (props) => <Address {...props} />,
};

export { type AddressProps, AddressComponent as Address };
