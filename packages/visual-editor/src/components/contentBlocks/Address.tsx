import { useTranslation } from "react-i18next";
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
  CTAProps,
} from "@yext/visual-editor";

export interface AddressProps {
  data: {
    address: YextEntityField<AddressType>;
  };
  styles: {
    showGetDirectionsLink: boolean;
    ctaVariant: CTAProps["variant"];
  };
}

// Address field definition used in Address and CoreInfoSection
export const AddressDataField = YextField<any, AddressType>(
  msg("fields.address", "Address"),
  {
    type: "entityField",
    filter: { types: ["type.address"] },
  }
);

// Address style fields used in Address and CoreInfoSection
export const AddressStyleFields = {
  // By explicitly providing `<boolean>`, we tell YextField what type to use,
  // which prevents TypeScript from incorrectly inferring `any`.
  showGetDirectionsLink: YextField<boolean>(
    msg("fields.showGetDirectionsLink", "Show Get Directions Link"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    }
  ),
  // We do the same for the ctaVariant, specifying its exact type.
  ctaVariant: YextField<CTAProps["variant"]>(
    msg("fields.ctaVariant", "CTA Variant"),
    {
      type: "radio",
      options: "CTA_VARIANT",
    }
  ),
};

const addressFields: Fields<AddressProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      address: AddressDataField,
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: AddressStyleFields,
  }),
};

const AddressComponent = ({ data, styles }: AddressProps) => {
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument();
  const address = resolveComponentData(
    data.address,
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
          fieldId={data.address.field}
          constantValueEnabled={data.address.constantValueEnabled}
        >
          <div className="flex flex-col gap-2 text-body-fontSize font-body-fontWeight font-body-fontFamily">
            <RenderAddress
              address={address}
              lines={[
                ["line1"],
                ["line2"],
                ["city", ",", "region", "postalCode"],
              ]}
            />
          </div>
          {coordinates && styles.showGetDirectionsLink && (
            <CTA
              eventName={`getDirections`}
              className="font-bold"
              link={coordinates}
              label={t("getDirections", "Get Directions")}
              linkType="DRIVING_DIRECTIONS"
              target="_blank"
              variant={styles.ctaVariant}
            />
          )}
        </EntityField>
      )}
    </>
  );
};

export const Address: ComponentConfig<{
  props: AddressProps;
}> = {
  label: msg("components.address", "Address"),
  fields: addressFields,
  defaultProps: {
    data: {
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
    },
    styles: {
      showGetDirectionsLink: true,
      ctaVariant: "link",
    },
  },
  render: (props) => <AddressComponent {...props} />,
};
