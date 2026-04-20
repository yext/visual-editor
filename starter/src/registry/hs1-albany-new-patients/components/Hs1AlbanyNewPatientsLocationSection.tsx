import type { ComponentProps } from "react";
import { Address as PagesAddress } from "@yext/pages-components";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
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

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

export type Hs1AlbanyNewPatientsLocationSectionProps = {
  title: StyledTextProps;
  subtitle: StyledTextProps;
  locationName: StyledTextProps;
  addressLabel: StyledTextProps;
  contactLabel: StyledTextProps;
  mapUrl: string;
};

const fontWeightOptions = [
  { label: "Thin", value: 100 },
  { label: "Extra Light", value: 200 },
  { label: "Light", value: 300 },
  { label: "Regular", value: 400 },
  { label: "Medium", value: 500 },
  { label: "Semi Bold", value: 600 },
  { label: "Bold", value: 700 },
  { label: "Extra Bold", value: 800 },
  { label: "Black", value: 900 },
] as const;

const textTransformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
] as const;

const getTextTransformStyle = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const createStyledTextField = (label: string) => ({
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
      options: [...fontWeightOptions],
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: [...textTransformOptions],
    },
  },
});

const formatPhone = (phone: string | undefined) => {
  if (!phone) {
    return "";
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
};

export const Hs1AlbanyNewPatientsLocationSectionFields: Fields<Hs1AlbanyNewPatientsLocationSectionProps> =
  {
    title: createStyledTextField("Title"),
    subtitle: createStyledTextField("Subtitle"),
    locationName: createStyledTextField("Location Name"),
    addressLabel: createStyledTextField("Address Label"),
    contactLabel: createStyledTextField("Contact Label"),
    mapUrl: {
      label: "Map Url",
      type: "text",
    },
  };

export const Hs1AlbanyNewPatientsLocationSectionComponent: PuckComponent<
  Hs1AlbanyNewPatientsLocationSectionProps
> = ({ title, subtitle, locationName, addressLabel, contactLabel, mapUrl }) => {
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
  const phone = formatPhone(streamDocument.mainPhone);

  return (
    <section className="bg-white text-[#4a4a4a]">
      <div className="mx-auto grid max-w-[1440px] gap-0 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="mx-auto w-full max-w-[1170px] px-[30px] py-[50px] lg:pl-[45px] lg:pr-[30px]">
          <div className="max-w-[420px]">
            <h2
              className="m-0"
              style={{
                fontSize: `${title.fontSize}px`,
                color: title.fontColor,
                fontWeight: title.fontWeight,
                textTransform: getTextTransformStyle(title.textTransform),
                fontFamily: "Montserrat, 'Open Sans', sans-serif",
                lineHeight: 1.214,
                letterSpacing: "1px",
              }}
            >
              {resolvedTitle}
            </h2>
            <p
              className="mb-0 mt-[5px]"
              style={{
                fontSize: `${subtitle.fontSize}px`,
                color: subtitle.fontColor,
                fontWeight: subtitle.fontWeight,
                textTransform: getTextTransformStyle(subtitle.textTransform),
                fontFamily: "Montserrat, 'Open Sans', sans-serif",
                lineHeight: 1.273,
                letterSpacing: "1.5px",
              }}
            >
              {resolvedSubtitle}
            </p>
          </div>

          <div className="mt-[30px] space-y-6 px-[15px]">
            <div>
              <div className="pt-6 font-['Montserrat','Open_Sans',sans-serif] text-sm font-bold uppercase tracking-[1px] text-[#4a4a4a]">
                <span>--</span>
                <span className="ml-1">mi</span>
              </div>
              <p
                className="mb-0 mt-2"
                style={{
                  fontSize: `${locationName.fontSize}px`,
                  color: locationName.fontColor,
                  fontWeight: locationName.fontWeight,
                  textTransform: getTextTransformStyle(
                    locationName.textTransform,
                  ),
                  fontFamily: "Montserrat, 'Open Sans', sans-serif",
                  lineHeight: 1.35,
                }}
              >
                {resolvedLocationName}
              </p>
            </div>

            <div>
              <p
                className="mb-2 mt-0"
                style={{
                  fontSize: `${addressLabel.fontSize}px`,
                  color: addressLabel.fontColor,
                  fontWeight: addressLabel.fontWeight,
                  textTransform: getTextTransformStyle(
                    addressLabel.textTransform,
                  ),
                  fontFamily: "Montserrat, 'Open Sans', sans-serif",
                  lineHeight: 1.35,
                }}
              >
                {resolvedAddressLabel}
              </p>
              {streamDocument.address ? (
                <Address
                  address={streamDocument.address}
                  lines={[
                    ["line1"],
                    ["city", ",", "region", "postalCode", ",", "countryCode"],
                  ]}
                  separator=" "
                  className="space-y-1 text-base leading-7 text-[#4a4a4a]"
                />
              ) : null}
            </div>

            <div>
              <p
                className="mb-2 mt-0"
                style={{
                  fontSize: `${contactLabel.fontSize}px`,
                  color: contactLabel.fontColor,
                  fontWeight: contactLabel.fontWeight,
                  textTransform: getTextTransformStyle(
                    contactLabel.textTransform,
                  ),
                  fontFamily: "Montserrat, 'Open Sans', sans-serif",
                  lineHeight: 1.35,
                }}
              >
                {resolvedContactLabel}
              </p>
              <a
                href={phone ? `tel:${phone}` : undefined}
                className="text-base text-[#4a4a4a] no-underline"
              >
                {phone}
              </a>
            </div>
          </div>
        </div>

        <div className="min-h-[450px]">
          <iframe
            title="Primary Location Map"
            src={mapUrl}
            className="h-full min-h-[450px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyNewPatientsLocationSection: ComponentConfig<Hs1AlbanyNewPatientsLocationSectionProps> =
  {
    label: "Hs1 Albany New Patients Location Section",
    fields: Hs1AlbanyNewPatientsLocationSectionFields,
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
        fontSize: 18,
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
        fontSize: 16,
        fontColor: "#4a4a4a",
        fontWeight: 700,
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
        fontSize: 16,
        fontColor: "#4a4a4a",
        fontWeight: 700,
        textTransform: "normal",
      },
      mapUrl:
        "https://www.google.com/maps?q=41.83193,-88.010748&z=15&output=embed",
    },
    render: Hs1AlbanyNewPatientsLocationSectionComponent,
  };
