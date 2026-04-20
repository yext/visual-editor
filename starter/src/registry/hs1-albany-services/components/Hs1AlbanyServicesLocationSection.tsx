import type { ComponentProps } from "react";
import {
  Address as PagesAddress,
  type AddressLine,
} from "@yext/pages-components";
import { Link as PagesLink } from "@yext/pages-components";
import {
  type ComponentConfig,
  type Fields,
  type PuckComponent,
} from "@puckeditor/core";
import {
  type TranslatableString,
  resolveComponentData,
  useDocument,
  type YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";

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

const Address = (props: PagesAddressProps) => {
  if (!hasAddressContent(props.address)) {
    return null;
  }

  return <PagesAddress {...props} />;
};

const getSafeHref = (href?: string): string => {
  const trimmedHref = href?.trim();
  return trimmedHref ? trimmedHref : "#";
};

type PagesLinkProps = ComponentProps<typeof PagesLink>;

const Link = (props: PagesLinkProps) => {
  const safeProps = { ...props } as any;

  if ("cta" in safeProps && safeProps.cta) {
    safeProps.cta = {
      ...safeProps.cta,
      link: getSafeHref(safeProps.cta.link),
    };
  }

  if ("href" in safeProps) {
    safeProps.href = getSafeHref(safeProps.href);
  }

  return <PagesLink {...safeProps} />;
};

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

export type Hs1AlbanyServicesLocationSectionProps = {
  title: StyledTextProps;
  subtitle: StyledTextProps;
  locationName: StyledTextProps;
  addressLabel: StyledTextProps;
  contactLabel: StyledTextProps;
};

const styledTextFields = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    text: YextEntityFieldSelector<any, TranslatableString>({
      label: "Text",
      filter: {
        types: ["type.string"],
      },
    }),
    fontSize: { label: "Font Size", type: "number" as const },
    fontColor: { label: "Font Color", type: "text" as const },
    fontWeight: {
      label: "Font Weight",
      type: "select" as const,
      options: [
        { label: "Thin", value: 100 },
        { label: "Extra Light", value: 200 },
        { label: "Light", value: 300 },
        { label: "Regular", value: 400 },
        { label: "Medium", value: 500 },
        { label: "Semi Bold", value: 600 },
        { label: "Bold", value: 700 },
        { label: "Extra Bold", value: 800 },
        { label: "Black", value: 900 },
      ],
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: [
        { label: "Normal", value: "normal" },
        { label: "Uppercase", value: "uppercase" },
        { label: "Lowercase", value: "lowercase" },
        { label: "Capitalize", value: "capitalize" },
      ],
    },
  },
});

const addressLines: AddressLine[] = [
  ["line1"],
  ["city", ",", "region", ",", "postalCode", ",", "countryCode"],
];

const renderPhone = (phone?: string) => {
  if (!phone) {
    return "(877) 393-3348";
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
};

export const Hs1AlbanyServicesLocationSectionFields: Fields<Hs1AlbanyServicesLocationSectionProps> =
  {
    title: styledTextFields("Title"),
    subtitle: styledTextFields("Subtitle"),
    locationName: styledTextFields("Location Name"),
    addressLabel: styledTextFields("Address Label"),
    contactLabel: styledTextFields("Contact Label"),
  };

export const Hs1AlbanyServicesLocationSectionComponent: PuckComponent<
  Hs1AlbanyServicesLocationSectionProps
> = ({ title, subtitle, locationName, addressLabel, contactLabel }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle =
    resolveComponentData(title.text, locale, streamDocument) || "";
  const resolvedSubtitle =
    resolveComponentData(subtitle.text, locale, streamDocument) || "";
  const resolvedLocationName =
    resolveComponentData(locationName.text, locale, streamDocument) || "";
  const resolvedAddressLabel =
    resolveComponentData(addressLabel.text, locale, streamDocument) || "";
  const resolvedContactLabel =
    resolveComponentData(contactLabel.text, locale, streamDocument) || "";
  const displayPhone = renderPhone(streamDocument.mainPhone);
  const phoneHref = displayPhone.replace(/[^\d+]/g, "");
  const titleTextTransform =
    title.textTransform === "normal" ? undefined : title.textTransform;
  const subtitleTextTransform =
    subtitle.textTransform === "normal" ? undefined : subtitle.textTransform;
  const locationNameTextTransform =
    locationName.textTransform === "normal"
      ? undefined
      : locationName.textTransform;
  const addressLabelTextTransform =
    addressLabel.textTransform === "normal"
      ? undefined
      : addressLabel.textTransform;
  const contactLabelTextTransform =
    contactLabel.textTransform === "normal"
      ? undefined
      : contactLabel.textTransform;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1170px] px-6 py-[56px]">
        <div className="grid gap-12 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-6">
          <div className="max-w-[420px]">
            <h2
              className="m-0"
              style={{
                fontFamily: "'Montserrat', 'Open Sans', sans-serif",
                fontSize: `${title.fontSize}px`,
                color: title.fontColor,
                fontWeight: title.fontWeight,
                textTransform: titleTextTransform,
                lineHeight: 1.2,
                letterSpacing: "1px",
              }}
            >
              {resolvedTitle}
            </h2>
            <p
              className="mb-0 mt-[10px]"
              style={{
                fontFamily: "'Montserrat', 'Open Sans', sans-serif",
                fontSize: `${subtitle.fontSize}px`,
                color: subtitle.fontColor,
                fontWeight: subtitle.fontWeight,
                textTransform: subtitleTextTransform,
                lineHeight: 1.2,
                letterSpacing: "1.5px",
              }}
            >
              {resolvedSubtitle}
            </p>

            <h3
              className="mb-0 mt-[52px]"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: `${locationName.fontSize}px`,
                color: locationName.fontColor,
                fontWeight: locationName.fontWeight,
                textTransform: locationNameTextTransform,
                lineHeight: 1.2,
              }}
            >
              {resolvedLocationName}
            </h3>

            <div className="mt-10">
              <p
                className="mb-2 mt-0"
                style={{
                  fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
                  fontSize: `${addressLabel.fontSize}px`,
                  color: addressLabel.fontColor,
                  fontWeight: addressLabel.fontWeight,
                  textTransform: addressLabelTextTransform,
                  lineHeight: 1.4,
                }}
              >
                {resolvedAddressLabel}
              </p>
              {streamDocument.address && (
                <Address
                  address={streamDocument.address}
                  lines={addressLines}
                  className="text-[17px] leading-[1.55] text-[#4a4a4a]"
                  style={{
                    fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
                  }}
                />
              )}
            </div>

            <div className="mt-8">
              <p
                className="mb-2 mt-0"
                style={{
                  fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
                  fontSize: `${contactLabel.fontSize}px`,
                  color: contactLabel.fontColor,
                  fontWeight: contactLabel.fontWeight,
                  textTransform: contactLabelTextTransform,
                  lineHeight: 1.4,
                }}
              >
                {resolvedContactLabel}
              </p>
              <div
                className="text-[17px] leading-[1.55] text-[#4a4a4a]"
                style={{
                  fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
                }}
              >
                <span className="mr-2">Phone:</span>
                <Link
                  href={`tel:${phoneHref}`}
                  className="text-inherit no-underline"
                >
                  {displayPhone}
                </Link>
              </div>
            </div>
          </div>

          <div className="min-h-[450px] bg-white" />
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyServicesLocationSection: ComponentConfig<Hs1AlbanyServicesLocationSectionProps> =
  {
    label: "HS1 Albany Services Location Section",
    fields: Hs1AlbanyServicesLocationSectionFields,
    defaultProps: {
      title: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Our Location",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 28,
        fontColor: "#4a4a4a",
        fontWeight: 400,
        textTransform: "uppercase",
      },
      subtitle: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Find us on the map",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 22,
        fontColor: "#d3a335",
        fontWeight: 300,
        textTransform: "normal",
      },
      locationName: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Primary Location",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 22,
        fontColor: "#4a4a4a",
        fontWeight: 700,
        textTransform: "normal",
      },
      addressLabel: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Address",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 17,
        fontColor: "#4a4a4a",
        fontWeight: 400,
        textTransform: "normal",
      },
      contactLabel: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Contact Information",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 17,
        fontColor: "#4a4a4a",
        fontWeight: 400,
        textTransform: "normal",
      },
    },
    render: Hs1AlbanyServicesLocationSectionComponent,
  };
