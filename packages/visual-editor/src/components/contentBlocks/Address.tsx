import { useTranslation } from "react-i18next";
import {
  ComponentConfig,
  ComponentData,
  DefaultComponentProps,
  Fields,
  PuckComponent,
  setDeep,
} from "@puckeditor/core";
import {
  AddressType,
  getDirections,
  Address as RenderAddress,
} from "@yext/pages-components";
import { useDocument } from "../../hooks/useDocument.tsx";
import { EntityField } from "../../editor/EntityField.tsx";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { CTA, CTAVariant } from "../atoms/cta.tsx";
import { pt, msg } from "../../utils/i18n/platform.ts";
import { YextField } from "../../editor/YextField.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import {
  BackgroundStyle,
  backgroundColors,
} from "../../utils/themeConfigOptions.ts";
import { resolveDataFromParent } from "../../editor/ParentData.tsx";

/** Props for the Address component */
export interface AddressProps {
  data: {
    /** The address data to display. */
    address: YextEntityField<AddressType>;
  };

  styles: {
    /** Whether to include a "Get Directions" CTA to Google Maps */
    showGetDirectionsLink: boolean;
    /** The variant of the get directions button */
    ctaVariant: CTAVariant;
    color?: BackgroundStyle;
    hideCountry?: boolean;
  };

  /** @internal */
  parentData?: {
    field: string;
    address: AddressType;
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
export const AddressStyleFields: Fields<AddressProps["styles"]> = {
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
  ctaVariant: YextField<CTAVariant>(msg("fields.ctaVariant", "CTA Variant"), {
    type: "radio",
    options: "CTA_VARIANT",
  }),
  color: YextField(msg("fields.color", "Color"), {
    type: "select",
    options: "SITE_COLOR",
  }),
};

export const addressFields: Fields<AddressProps> = {
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

const AddressComponent: PuckComponent<AddressProps> = (props) => {
  const { data, styles, puck, parentData } = props;
  const { t, i18n } = useTranslation();
  const { hideCountry = false } = styles;
  const streamDocument = useDocument();

  const resolvedColor = styles.color;
  const address = parentData
    ? parentData.address
    : (resolveComponentData(
        data.address,
        i18n.language,
        streamDocument
      ) as unknown as AddressType | undefined);

  const listings = streamDocument.ref_listings ?? [];
  const listingsLink = getDirections(
    undefined,
    listings,
    undefined,
    { provider: "google" },
    undefined
  );
  const addressLink = getDirections(
    address as AddressType,
    undefined,
    undefined,
    { provider: "google" }
  );

  // If ref_listings doesn't exist or the address field selected isn't just address, use the address link.
  const useAddressLink: boolean =
    data.address.field !== "address" || !streamDocument.ref_listings?.length;

  // Only show the address component if there's at least one line of the address
  const showAddress = !!(
    address?.line1 ||
    address?.line2 ||
    address?.city ||
    address?.region ||
    address?.postalCode
  );

  return showAddress ? (
    <div className="flex flex-col gap-2 text-body-fontSize font-body-fontWeight font-body-fontFamily">
      <EntityField
        displayName={parentData ? parentData.field : pt("address", "Address")}
        fieldId={data.address.field}
        constantValueEnabled={!parentData && data.address.constantValueEnabled}
      >
        <RenderAddress
          address={address}
          lines={
            hideCountry
              ? [["line1"], ["line2"], ["city", "region", "postalCode"]]
              : undefined
          }
        />
      </EntityField>
      {(useAddressLink ? !!addressLink : !!listingsLink) &&
        styles.showGetDirectionsLink && (
          <CTA
            setPadding={true}
            ctaType="getDirections"
            eventName={`getDirections`}
            link={useAddressLink ? addressLink : listingsLink}
            label={t("getDirections", "Get Directions")}
            linkType="DRIVING_DIRECTIONS"
            target="_blank"
            variant={styles.ctaVariant}
            color={resolvedColor}
          />
        )}
    </div>
  ) : puck.isEditing ? (
    <div className="min-h-[40px]"></div>
  ) : (
    <></>
  );
};

export const resolveAddressFields = (
  data: Omit<
    ComponentData<AddressProps, string, Record<string, DefaultComponentProps>>,
    "type"
  >
) => {
  const updatedFields = resolveDataFromParent(addressFields, data);
  const showGetDirectionsLink = data.props.styles.showGetDirectionsLink;
  setDeep(
    updatedFields,
    "styles.objectFields.ctaVariant.visible",
    showGetDirectionsLink
  );
  const ctaVariant = data.props.styles.ctaVariant;
  const showColor = ctaVariant === "primary" || ctaVariant === "secondary";
  setDeep(
    updatedFields,
    "styles.objectFields.color.visible",
    showGetDirectionsLink && showColor
  );

  return updatedFields;
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
      color: backgroundColors.color1.value,
      hideCountry: false,
    },
  },
  resolveFields: resolveAddressFields,
  render: (props) => <AddressComponent {...props} />,
};
