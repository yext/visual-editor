import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  AddressType,
  getDirections,
  Address as RenderAddress,
} from "@yext/pages-components";
import "@yext/pages-components/style.css";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  CTA,
  YextField,
} from "@yext/visual-editor";

export type AddressProps = {
  address: YextEntityField<AddressType>;
  showGetDirections: boolean;
};

const addressFields: Fields<AddressProps> = {
  address: YextField<any, AddressType>("Address", {
    type: "entityField",
    filter: { types: ["type.address"] },
  }),
  showGetDirections: YextField("Show Get Directions Link", {
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  }),
};

const AddressComponent = ({
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
          <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
            <RenderAddress
              address={address as AddressType}
              lines={[["line1"], ["line2", "city", "region", "postalCode"]]}
            />
          </div>
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

export const Address: ComponentConfig<AddressProps> = {
  label: "Address",
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
    },
    showGetDirections: true,
  },
  render: (props) => <AddressComponent {...props} />,
};
