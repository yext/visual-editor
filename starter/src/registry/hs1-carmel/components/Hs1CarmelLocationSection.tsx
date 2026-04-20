import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
} from "@yext/visual-editor";
import { AddressType } from "@yext/pages-components";
import { HoursStatus, HoursTable } from "@yext/pages-components";
import { Address } from "../../shared/SafeAddress";
import { Link } from "../../shared/SafeLink";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
};

type ActionLink = {
  label: string;
  link: string;
};

export type Hs1CarmelLocationSectionProps = {
  heading: StyledTextProps;
  address: YextEntityField<AddressType>;
  directionsCta: ActionLink;
};

const createStyledTextField = (label: string) =>
  ({
    label,
    type: "object",
    objectFields: {
      text: YextEntityFieldSelector<any, TranslatableString>({
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      }),
      fontSize: { label: "Font Size", type: "number" },
      fontColor: { label: "Font Color", type: "text" },
      fontWeight: {
        label: "Font Weight",
        type: "select",
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
        type: "select",
        options: [
          { label: "Normal", value: "none" },
          { label: "Uppercase", value: "uppercase" },
          { label: "Lowercase", value: "lowercase" },
          { label: "Capitalize", value: "capitalize" },
        ],
      },
    },
  }) satisfies Fields<Hs1CarmelLocationSectionProps>["heading"];

const Hs1CarmelLocationSectionFields: Fields<Hs1CarmelLocationSectionProps> = {
  heading: createStyledTextField("Heading"),
  address: YextEntityFieldSelector<any, AddressType>({
    label: "Address",
    filter: {
      types: ["type.address"],
    },
  }),
  directionsCta: {
    label: "Directions Call To Action",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
};

export const Hs1CarmelLocationSectionComponent: PuckComponent<
  Hs1CarmelLocationSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedAddress = resolveComponentData(
    props.address,
    locale,
    streamDocument,
  ) as AddressType | undefined;
  const directionsLink =
    props.directionsCta.link ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      [
        resolvedAddress?.line1,
        resolvedAddress?.city,
        resolvedAddress?.region,
        resolvedAddress?.postalCode,
      ]
        .filter(Boolean)
        .join(" "),
    )}`;
  const mapQuery = [
    resolvedAddress?.line1,
    resolvedAddress?.city,
    resolvedAddress?.region,
    resolvedAddress?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="bg-[#F7F7F7] px-4 py-16 lg:px-6">
      <div className="mx-auto grid max-w-[1140px] gap-8 lg:grid-cols-[minmax(0,474px)_minmax(0,1fr)]">
        <div className="rounded-lg bg-white px-8 py-10 shadow-[4px_4px_8px_rgba(0,0,0,0.08)]">
          <h2
            className="m-0 font-['Poppins','Open_Sans',sans-serif]"
            style={{
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: props.heading.textTransform,
            }}
          >
            {resolvedHeading}
          </h2>
          <div className="mt-6 font-['Gothic_A1','Open_Sans',sans-serif] text-[#04364E]">
            <div className="mb-4">
              <HoursStatus
                hours={streamDocument.hours}
                timezone={streamDocument.timezone}
              />
            </div>
            {resolvedAddress && (
              <div className="mb-6">
                <Address
                  address={resolvedAddress}
                  lines={[
                    ["line1"],
                    ["city", ",", "region", "postalCode", ",", "countryCode"],
                  ]}
                  separator=" "
                />
              </div>
            )}
            {streamDocument.mainPhone && (
              <div className="mb-6">
                <Link
                  cta={{
                    link: `tel:${streamDocument.mainPhone}`,
                    linkType: "URL",
                  }}
                  className="text-[#04364E] no-underline hover:underline"
                >
                  {streamDocument.mainPhone}
                </Link>
              </div>
            )}
            {streamDocument.hours && (
              <div className="mb-6 text-sm">
                <HoursTable
                  hours={streamDocument.hours}
                  startOfWeek="today"
                  collapseDays={false}
                />
              </div>
            )}
            <Link
              cta={{
                link: directionsLink,
                linkType: "URL",
              }}
              className="inline-flex rounded-md bg-[#04364E] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white no-underline transition hover:bg-[#7CB0D3]"
            >
              {props.directionsCta.label}
            </Link>
          </div>
        </div>
        <div className="min-h-[420px] overflow-hidden rounded-lg border border-[#d8dde3] bg-white">
          {mapQuery ? (
            <iframe
              title="Carmel location map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
              className="h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="relative h-[420px] bg-[linear-gradient(135deg,#dfe7ec_0%,#b9cfdc_100%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.7),transparent_35%),radial-gradient(circle_at_70%_60%,rgba(4,54,78,0.18),transparent_30%)]" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const Hs1CarmelLocationSection: ComponentConfig<Hs1CarmelLocationSectionProps> =
  {
    label: "HS1 Carmel Location Section",
    fields: Hs1CarmelLocationSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            en: "Our Location",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 32,
        fontColor: "#04364E",
        fontWeight: 700,
        textTransform: "none",
      },
      address: {
        field: "address",
        constantValue: {
          line1: "",
          city: "",
          postalCode: "",
          countryCode: "",
        },
      },
      directionsCta: {
        label: "Driving Directions",
        link: "",
      },
    },
    render: Hs1CarmelLocationSectionComponent,
  };
