import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Address } from "../../shared/SafeAddress";
import { Link } from "../../shared/SafeLink";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

export type Hs1AlbanyStaffLocationSectionProps = {
  title: StyledTextProps;
  subtitle: StyledTextProps;
  locationLabel: StyledTextProps;
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

const toCssTextTransform = (
  value: StyledTextProps["textTransform"],
): "none" | "uppercase" | "lowercase" | "capitalize" =>
  value === "normal" ? "none" : value;

export const Hs1AlbanyStaffLocationSectionFields: Fields<Hs1AlbanyStaffLocationSectionProps> =
  {
    title: styledTextFields("Title"),
    subtitle: styledTextFields("Subtitle"),
    locationLabel: styledTextFields("Location Label"),
    addressLabel: styledTextFields("Address Label"),
    contactLabel: styledTextFields("Contact Label"),
  };

const resolveStyledText = (
  textField: StyledTextProps,
  locale: string,
  streamDocument: Record<string, any>,
) => resolveComponentData(textField.text, locale, streamDocument) || "";

const textStyles = (
  textField: StyledTextProps,
  lineHeight: string,
  letterSpacing = "normal",
) => ({
  fontFamily:
    textField.fontWeight >= 500
      ? '"Montserrat", "Open Sans", sans-serif'
      : '"Nunito Sans", "Open Sans", sans-serif',
  fontSize: `${textField.fontSize}px`,
  color: textField.fontColor,
  fontWeight: textField.fontWeight,
  lineHeight,
  letterSpacing,
  textTransform: toCssTextTransform(textField.textTransform),
});

export const Hs1AlbanyStaffLocationSectionComponent: PuckComponent<
  Hs1AlbanyStaffLocationSectionProps
> = ({ title, subtitle, locationLabel, addressLabel, contactLabel }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle = resolveStyledText(title, locale, streamDocument);
  const resolvedSubtitle = resolveStyledText(subtitle, locale, streamDocument);
  const resolvedLocationLabel = resolveStyledText(
    locationLabel,
    locale,
    streamDocument,
  );
  const resolvedAddressLabel = resolveStyledText(
    addressLabel,
    locale,
    streamDocument,
  );
  const resolvedContactLabel = resolveStyledText(
    contactLabel,
    locale,
    streamDocument,
  );
  const mainPhone = streamDocument.mainPhone || "(877) 393-3348";
  const telHref = `tel:${String(mainPhone).replace(/[^\d+]/g, "")}`;

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto flex max-w-[1140px] flex-col px-[15px] py-[57px] lg:min-h-[418px] lg:flex-row">
        <div className="w-full bg-white px-[30px] py-[50px] lg:w-[475px] lg:shrink-0">
          <h2 className="m-0" style={textStyles(title, "28px", "1px")}>
            {resolvedTitle}
          </h2>
          <p
            className="mb-[30px] mt-[5px]"
            style={textStyles(subtitle, "22px", "1.5px")}
          >
            {resolvedSubtitle}
          </p>
          <p
            className="mb-[8px] mt-0"
            style={textStyles(locationLabel, "26.4px")}
          >
            {resolvedLocationLabel}
          </p>
          <div className="mb-[24px]">
            <p
              className="mb-[8px] mt-0"
              style={textStyles(addressLabel, "24px")}
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
                className="text-[16px] leading-6 text-[#4a4a4a] [font-family:'Nunito_Sans','Open_Sans',sans-serif]"
              />
            ) : null}
          </div>
          <div>
            <p
              className="mb-[8px] mt-0"
              style={textStyles(contactLabel, "24px")}
            >
              {resolvedContactLabel}
            </p>
            <Link
              href={telHref}
              className="text-[16px] leading-6 text-[#000000] no-underline [font-family:'Nunito_Sans','Open_Sans',sans-serif]"
            >
              Phone:&nbsp;&nbsp;{mainPhone}
            </Link>
          </div>
        </div>
        <div className="min-h-[240px] flex-1 bg-white lg:min-h-full" />
      </div>
    </section>
  );
};

export const Hs1AlbanyStaffLocationSection: ComponentConfig<Hs1AlbanyStaffLocationSectionProps> =
  {
    label: "HS1 Albany Staff Location Section",
    fields: Hs1AlbanyStaffLocationSectionFields,
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
      locationLabel: {
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
        fontWeight: 500,
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
    },
    render: Hs1AlbanyStaffLocationSectionComponent,
  };
