import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Address } from "@yext/pages-components";
import { Link } from "../../shared/SafeLink";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

export type Hs1AlbanyOfficeLocationSectionProps = {
  title: StyledTextProps;
  subtitle: StyledTextProps;
  locationLabel: StyledTextProps;
  addressLabel: StyledTextProps;
  contactLabel: StyledTextProps;
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

const createStyledTextObjectFields = () => ({
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
});

const createStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: text,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const cssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const Hs1AlbanyOfficeLocationSectionFields: Fields<Hs1AlbanyOfficeLocationSectionProps> =
  {
    title: {
      label: "Title",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    subtitle: {
      label: "Subtitle",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    locationLabel: {
      label: "Location Label",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    addressLabel: {
      label: "Address Label",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    contactLabel: {
      label: "Contact Label",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
  };

export const Hs1AlbanyOfficeLocationSectionComponent: PuckComponent<
  Hs1AlbanyOfficeLocationSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown>;
  const locale = (streamDocument.locale as string) ?? "en";
  const title = resolveStyledText(props.title, locale, streamDocument);
  const subtitle = resolveStyledText(props.subtitle, locale, streamDocument);
  const locationLabel = resolveStyledText(
    props.locationLabel,
    locale,
    streamDocument,
  );
  const addressLabel = resolveStyledText(
    props.addressLabel,
    locale,
    streamDocument,
  );
  const contactLabel = resolveStyledText(
    props.contactLabel,
    locale,
    streamDocument,
  );
  const mainPhone = String(streamDocument.mainPhone ?? "");
  const address = streamDocument.address as
    | {
        line1?: string;
        city?: string;
        region?: string;
        postalCode?: string;
      }
    | undefined;
  const mapQuery = [
    address?.line1,
    address?.city,
    address?.region,
    address?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="bg-white font-['Montserrat','Open_Sans',sans-serif]">
      <div className="mx-auto max-w-[1260px] px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
          <div className="max-w-[320px]">
            <h2
              className="m-0 leading-none"
              style={{
                fontSize: `${props.title.fontSize}px`,
                color: props.title.fontColor,
                fontWeight: props.title.fontWeight,
                textTransform: cssTextTransform(props.title.textTransform),
                letterSpacing: "1px",
              }}
            >
              {title}
            </h2>
            <p
              className="mb-8 mt-2"
              style={{
                fontSize: `${props.subtitle.fontSize}px`,
                color: props.subtitle.fontColor,
                fontWeight: props.subtitle.fontWeight,
                textTransform: cssTextTransform(props.subtitle.textTransform),
              }}
            >
              {subtitle}
            </p>
            <p
              className="m-0 text-[18px] font-bold text-[#4a4a4a]"
              style={{
                fontSize: `${props.locationLabel.fontSize}px`,
                color: props.locationLabel.fontColor,
                fontWeight: props.locationLabel.fontWeight,
                textTransform: cssTextTransform(
                  props.locationLabel.textTransform,
                ),
              }}
            >
              {locationLabel}
            </p>
            <p
              className="mb-2 mt-6 text-[13px] text-[#767676]"
              style={{
                fontSize: `${props.addressLabel.fontSize}px`,
                color: props.addressLabel.fontColor,
                fontWeight: props.addressLabel.fontWeight,
                textTransform: cssTextTransform(
                  props.addressLabel.textTransform,
                ),
              }}
            >
              {addressLabel}
            </p>
            <Address
              address={streamDocument.address as never}
              lines={[
                ["line1"],
                ["city", ",", "region", "postalCode", ",", "countryCode"],
              ]}
              className="font-['Arial','Helvetica',sans-serif] text-[14px] leading-[1.7] not-italic text-[#4a4a4a]"
            />
            <p
              className="mb-1 mt-5 text-[13px] text-[#767676]"
              style={{
                fontSize: `${props.contactLabel.fontSize}px`,
                color: props.contactLabel.fontColor,
                fontWeight: props.contactLabel.fontWeight,
                textTransform: cssTextTransform(
                  props.contactLabel.textTransform,
                ),
              }}
            >
              {contactLabel}
            </p>
            <Link
              cta={{
                link: mainPhone,
                linkType: "PHONE",
              }}
              className="font-['Arial','Helvetica',sans-serif] text-[14px] text-[#4a4a4a]"
            >
              {mainPhone}
            </Link>
          </div>
          <div className="min-h-[320px] border border-[#dddddd] bg-white">
            <iframe
              title="Primary location map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
              className="h-[320px] w-full lg:h-[360px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyOfficeLocationSection: ComponentConfig<Hs1AlbanyOfficeLocationSectionProps> =
  {
    label: "Hs1 Albany Office Location Section",
    fields: Hs1AlbanyOfficeLocationSectionFields,
    defaultProps: {
      title: createStyledTextDefault(
        "Our Location",
        28,
        "#4a4a4a",
        400,
        "uppercase",
      ),
      subtitle: createStyledTextDefault(
        "Find us on the map",
        16,
        "#d3a335",
        300,
      ),
      locationLabel: createStyledTextDefault(
        "Primary Location",
        18,
        "#4a4a4a",
        700,
      ),
      addressLabel: createStyledTextDefault("Address", 13, "#767676", 400),
      contactLabel: createStyledTextDefault(
        "Contact Information",
        13,
        "#767676",
        400,
      ),
    },
    render: Hs1AlbanyOfficeLocationSectionComponent,
  };
