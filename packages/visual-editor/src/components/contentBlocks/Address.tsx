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

export type AddressProps = {
  data: {
    address: YextEntityField<AddressType>;
  };
  styles: {
    showGetDirections: boolean;
    ctaVariant: CTAProps["variant"];
  };
};

const addressFields: Fields<AddressProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      address: YextField(msg("fields.address", "Address"), {
        type: "entityField",
        filter: { types: ["type.address"] },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
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
      ctaVariant: YextField(msg("fields.ctaVariant", "CTA Variant"), {
        type: "radio",
        options: "CTA_VARIANT",
      }),
    },
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
          {coordinates && styles.showGetDirections && (
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

export const Address: ComponentConfig<AddressProps> = {
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
      showGetDirections: true,
      ctaVariant: "link",
    },
  },
  render: (props) => <AddressComponent {...props} />,
};
