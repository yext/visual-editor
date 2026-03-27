import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type LinkItem = {
  label: string;
  link: string;
};

type NearbyLocationItem = {
  title: StyledTextProps;
  locality: StyledTextProps;
  status: StyledTextProps;
  cta: LinkItem;
};

export type CoolRunningNearbyLocationsSectionProps = {
  heading: StyledTextProps;
  locations: NearbyLocationItem[];
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
];

const textTransformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
];

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
    options: fontWeightOptions,
  },
  textTransform: {
    label: "Text Transform",
    type: "select" as const,
    options: textTransformOptions,
  },
});

const createStyledTextField = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: createStyledTextObjectFields(),
});

const CoolRunningNearbyLocationsSectionFields: Fields<CoolRunningNearbyLocationsSectionProps> =
  {
    heading: createStyledTextField("Heading"),
    locations: {
      label: "Locations",
      type: "array",
      arrayFields: {
        title: {
          label: "Title",
          type: "object",
          objectFields: createStyledTextObjectFields(),
        },
        locality: {
          label: "Locality",
          type: "object",
          objectFields: createStyledTextObjectFields(),
        },
        status: {
          label: "Status",
          type: "object",
          objectFields: createStyledTextObjectFields(),
        },
        cta: {
          label: "Call To Action",
          type: "object",
          objectFields: {
            label: { label: "Label", type: "text" },
            link: { label: "Link", type: "text" },
          },
        },
      },
      defaultItemProps: {
        title: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "CityPoint Branch",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 16,
          fontColor: "#ffffff",
          fontWeight: 700,
          textTransform: "normal",
        },
        locality: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Charlotte, NC",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 16,
          fontColor: "#ffffff",
          fontWeight: 400,
          textTransform: "normal",
        },
        status: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "24/7 access",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 16,
          fontColor: "#ffffff",
          fontWeight: 400,
          textTransform: "normal",
        },
        cta: {
          label: "View ATM",
          link: "#",
        },
      },
      getItemSummary: () => "Location",
    },
  };

const resolveText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

const copyStyle = (value: StyledTextProps) => ({
  fontFamily: '"IBM Plex Sans", "Open Sans", sans-serif',
  fontSize: `${value.fontSize}px`,
  color: value.fontColor,
  fontWeight: value.fontWeight,
  textTransform: toCssTextTransform(value.textTransform),
  lineHeight: 1.5,
});

export const CoolRunningNearbyLocationsSectionComponent: PuckComponent<
  CoolRunningNearbyLocationsSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveText(props.heading, locale, streamDocument);

  return (
    <section className="w-full border border-[#0a3657] bg-[#0e446d] py-6 text-white">
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="mb-6">
          <h2
            className="m-0"
            style={{
              fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
            }}
          >
            {heading}
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {props.locations.map((item, index) => {
            const title = resolveText(item.title, locale, streamDocument);
            const locality = resolveText(item.locality, locale, streamDocument);
            const status = resolveText(item.status, locale, streamDocument);

            return (
              <article
                key={`${title}-${index}`}
                className="grid gap-4 rounded-[14px] border border-white/20 bg-white/10 p-5"
              >
                <h3 className="m-0" style={copyStyle(item.title)}>
                  {title}
                </h3>
                <p className="m-0" style={copyStyle(item.locality)}>
                  {locality}
                </p>
                <p className="m-0" style={copyStyle(item.status)}>
                  {status}
                </p>
                <Link
                  className="text-[16px] leading-[1.5] text-white no-underline"
                  cta={{
                    link: item.cta.link,
                    linkType: "URL",
                  }}
                >
                  {item.cta.label}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const CoolRunningNearbyLocationsSection: ComponentConfig<CoolRunningNearbyLocationsSectionProps> =
  {
    label: "Cool Running Nearby Locations Section",
    fields: CoolRunningNearbyLocationsSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Nearby locations",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 32,
        fontColor: "#ffffff",
        fontWeight: 700,
        textTransform: "normal",
      },
      locations: [
        {
          title: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "CityPoint Branch",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 700,
            textTransform: "normal",
          },
          locality: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Tryon Street, Charlotte",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 400,
            textTransform: "normal",
          },
          status: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Open until 5:00 PM",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 400,
            textTransform: "normal",
          },
          cta: {
            label: "View branch",
            link: "#",
          },
        },
        {
          title: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "CityPoint ATM",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 700,
            textTransform: "normal",
          },
          locality: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "South End, Charlotte",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 400,
            textTransform: "normal",
          },
          status: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "24/7 access",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 400,
            textTransform: "normal",
          },
          cta: {
            label: "View ATM",
            link: "#",
          },
        },
        {
          title: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "CityPoint ATM",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 700,
            textTransform: "normal",
          },
          locality: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Uptown East, Charlotte",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 400,
            textTransform: "normal",
          },
          status: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "24/7 access",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 400,
            textTransform: "normal",
          },
          cta: {
            label: "View ATM",
            link: "#",
          },
        },
      ],
    },
    render: CoolRunningNearbyLocationsSectionComponent,
  };
