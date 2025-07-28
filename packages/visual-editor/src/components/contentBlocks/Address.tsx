import { useTranslation } from "react-i18next";
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
  EntityField,
  YextEntityField,
  CTA,
  pt,
  YextField,
  msg,
  resolveComponentData,
} from "@yext/visual-editor";

export type AddressProps = {
  address: YextEntityField<AddressType>;
  showGetDirections: boolean;
};

const addressFields: Fields<AddressProps> = {
  address: YextField<any, AddressType>(msg("fields.address", "Address"), {
    type: "entityField",
    filter: { types: ["type.address"] },
  }),
  showGetDirections: YextField(
    msg("fields.showGetDirectionsLink", "Show Get Directions Link"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    }
  ),
};

const AddressComponent = ({
  address: addressField,
  showGetDirections,
}: AddressProps) => {
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument();
  const address = resolveComponentData(
    addressField,
    i18n.language,
    streamDocument
  );
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
          displayName={pt("address", "Address")}
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
              label={t("getDirections", "Get Directions")}
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
  label: msg("components.address", "Address"),
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
