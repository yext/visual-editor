import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";
import { Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type NearbyLocation = {
  name: StyledTextProps;
  place: StyledTextProps;
  hours: StyledTextProps;
  cta: {
    label: string;
    link: string;
  };
};

export type RuggedUtilityNearbyLocationsSectionProps = {
  heading: StyledTextProps;
  locations: NearbyLocation[];
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

const styledTextObjectFields = {
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
};

const RuggedUtilityNearbyLocationsSectionFields: Fields<RuggedUtilityNearbyLocationsSectionProps> =
  {
    heading: {
      label: "Heading",
      type: "object",
      objectFields: styledTextObjectFields,
    },
    locations: {
      label: "Locations",
      type: "array",
      getItemSummary: (item: NearbyLocation) =>
        ((item.place?.text as any)?.constantValue?.defaultValue as string) ||
        "Nearby Location",
      defaultItemProps: {
        name: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Northline Outfitters",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 17,
          fontColor: "#181715",
          fontWeight: 800,
          textTransform: "normal",
        },
        place: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Town, ST",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 15,
          fontColor: "#6d665b",
          fontWeight: 400,
          textTransform: "normal",
        },
        hours: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Open until 6:00 PM",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 15,
          fontColor: "#6d665b",
          fontWeight: 400,
          textTransform: "normal",
        },
        cta: {
          label: "View store",
          link: "#",
        },
      },
      arrayFields: {
        name: {
          label: "Name",
          type: "object",
          objectFields: styledTextObjectFields,
        },
        place: {
          label: "Place",
          type: "object",
          objectFields: styledTextObjectFields,
        },
        hours: {
          label: "Hours",
          type: "object",
          objectFields: styledTextObjectFields,
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
    },
  };

export const RuggedUtilityNearbyLocationsSectionComponent: PuckComponent<
  RuggedUtilityNearbyLocationsSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto my-3 w-full max-w-[1024px] px-6">
      <div className="mb-6">
        <h2
          className="m-0"
          style={{
            fontFamily: '"Archivo Black", "Arial Black", sans-serif',
            fontSize: `${props.heading.fontSize}px`,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform:
              props.heading.textTransform === "normal"
                ? "none"
                : props.heading.textTransform,
          }}
        >
          {heading}
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {props.locations.map((location, index) => {
          const name =
            resolveComponentData(location.name.text, locale, streamDocument) ||
            "";
          const place =
            resolveComponentData(location.place.text, locale, streamDocument) ||
            "";
          const hours =
            resolveComponentData(location.hours.text, locale, streamDocument) ||
            "";

          return (
            <article
              key={`${place}-${index}`}
              className="grid gap-4 rounded-[8px] border border-[#d3c8b6] bg-[#fffdf8] p-5"
            >
              <div className="grid gap-2">
                <h3
                  className="m-0"
                  style={{
                    fontFamily: '"Public Sans", "Open Sans", sans-serif',
                    fontSize: `${location.name.fontSize}px`,
                    lineHeight: 1.35,
                    color: location.name.fontColor,
                    fontWeight: location.name.fontWeight,
                    textTransform:
                      location.name.textTransform === "normal"
                        ? "none"
                        : location.name.textTransform,
                  }}
                >
                  {name}
                </h3>
                <p
                  className="m-0"
                  style={{
                    fontFamily: '"Public Sans", "Open Sans", sans-serif',
                    fontSize: `${location.place.fontSize}px`,
                    lineHeight: 1.5,
                    color: location.place.fontColor,
                    fontWeight: location.place.fontWeight,
                    textTransform:
                      location.place.textTransform === "normal"
                        ? "none"
                        : location.place.textTransform,
                  }}
                >
                  {place}
                </p>
                <p
                  className="m-0"
                  style={{
                    fontFamily: '"Public Sans", "Open Sans", sans-serif',
                    fontSize: `${location.hours.fontSize}px`,
                    lineHeight: 1.5,
                    color: location.hours.fontColor,
                    fontWeight: location.hours.fontWeight,
                    textTransform:
                      location.hours.textTransform === "normal"
                        ? "none"
                        : location.hours.textTransform,
                  }}
                >
                  {hours}
                </p>
              </div>
              <Link
                cta={{ link: location.cta.link, linkType: "URL" }}
                className="inline-flex min-h-[44px] items-center text-sm font-semibold text-[#ad5f2d] no-underline"
              >
                {location.cta.label}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const RuggedUtilityNearbyLocationsSection: ComponentConfig<RuggedUtilityNearbyLocationsSectionProps> =
  {
    label: "Rugged Utility Nearby Locations Section",
    fields: RuggedUtilityNearbyLocationsSectionFields,
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
        fontSize: 36,
        fontColor: "#181715",
        fontWeight: 400,
        textTransform: "normal",
      },
      locations: [
        {
          name: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Northline Outfitters",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 17,
            fontColor: "#181715",
            fontWeight: 800,
            textTransform: "normal",
          },
          place: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Redmond, OR",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 15,
            fontColor: "#6d665b",
            fontWeight: 400,
            textTransform: "normal",
          },
          hours: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Open until 6:00 PM",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 15,
            fontColor: "#6d665b",
            fontWeight: 400,
            textTransform: "normal",
          },
          cta: {
            label: "View store",
            link: "#",
          },
        },
        {
          name: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Northline Outfitters",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 17,
            fontColor: "#181715",
            fontWeight: 800,
            textTransform: "normal",
          },
          place: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Sisters, OR",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 15,
            fontColor: "#6d665b",
            fontWeight: 400,
            textTransform: "normal",
          },
          hours: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Open until 6:00 PM",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 15,
            fontColor: "#6d665b",
            fontWeight: 400,
            textTransform: "normal",
          },
          cta: {
            label: "View store",
            link: "#",
          },
        },
        {
          name: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Northline Outfitters",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 17,
            fontColor: "#181715",
            fontWeight: 800,
            textTransform: "normal",
          },
          place: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Eugene, OR",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 15,
            fontColor: "#6d665b",
            fontWeight: 400,
            textTransform: "normal",
          },
          hours: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Open until 7:00 PM",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 15,
            fontColor: "#6d665b",
            fontWeight: 400,
            textTransform: "normal",
          },
          cta: {
            label: "View store",
            link: "#",
          },
        },
      ],
    },
    render: RuggedUtilityNearbyLocationsSectionComponent,
  };
