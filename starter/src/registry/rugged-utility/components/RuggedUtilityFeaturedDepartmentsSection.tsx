import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  Image,
  TranslatableAssetImage,
  TranslatableString,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType, Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type DepartmentCard = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  title: StyledTextProps;
  description: StyledTextProps;
  cta: {
    label: string;
    link: string;
  };
};

export type RuggedUtilityFeaturedDepartmentsSectionProps = {
  heading: StyledTextProps;
  cards: DepartmentCard[];
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

const RuggedUtilityFeaturedDepartmentsSectionFields: Fields<RuggedUtilityFeaturedDepartmentsSectionProps> =
  {
    heading: {
      label: "Heading",
      type: "object",
      objectFields: styledTextObjectFields,
    },
    cards: {
      label: "Cards",
      type: "array",
      getItemSummary: (item: DepartmentCard) =>
        ((item.title?.text as any)?.constantValue?.defaultValue as string) ||
        "Department Card",
      defaultItemProps: {
        image: {
          field: "",
          constantValue: {
            url: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80",
            width: 1200,
            height: 800,
          },
          constantValueEnabled: true,
        },
        title: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Department title",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 17,
          fontColor: "#181715",
          fontWeight: 800,
          textTransform: "normal",
        },
        description: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Department description",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 14,
          fontColor: "#6d665b",
          fontWeight: 400,
          textTransform: "normal",
        },
        cta: {
          label: "Explore",
          link: "#",
        },
      },
      arrayFields: {
        image: YextEntityFieldSelector<
          any,
          ImageType | ComplexImageType | TranslatableAssetImage
        >({
          label: "Image",
          filter: {
            types: ["type.image"],
          },
        }),
        title: {
          label: "Title",
          type: "object",
          objectFields: styledTextObjectFields,
        },
        description: {
          label: "Description",
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

export const RuggedUtilityFeaturedDepartmentsSectionComponent: PuckComponent<
  RuggedUtilityFeaturedDepartmentsSectionProps
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
        {props.cards.map((card, index) => {
          const image = resolveComponentData(
            card.image,
            locale,
            streamDocument,
          );
          const title =
            resolveComponentData(card.title.text, locale, streamDocument) || "";
          const description =
            resolveComponentData(
              card.description.text,
              locale,
              streamDocument,
            ) || "";

          return (
            <article
              key={`${title}-${index}`}
              className="grid overflow-hidden rounded-[8px] border border-[#d3c8b6] bg-[#fffdf8]"
            >
              <div className="max-h-[180px] min-h-[180px] overflow-hidden [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                {image ? <Image image={image} /> : null}
              </div>
              <div className="grid gap-4 p-5">
                <h3
                  className="m-0"
                  style={{
                    fontFamily: '"Public Sans", "Open Sans", sans-serif',
                    fontSize: `${card.title.fontSize}px`,
                    lineHeight: 1.35,
                    color: card.title.fontColor,
                    fontWeight: card.title.fontWeight,
                    textTransform:
                      card.title.textTransform === "normal"
                        ? "none"
                        : card.title.textTransform,
                  }}
                >
                  {title}
                </h3>
                <p
                  className="m-0"
                  style={{
                    fontFamily: '"Public Sans", "Open Sans", sans-serif',
                    fontSize: `${card.description.fontSize}px`,
                    lineHeight: 1.5,
                    color: card.description.fontColor,
                    fontWeight: card.description.fontWeight,
                    textTransform:
                      card.description.textTransform === "normal"
                        ? "none"
                        : card.description.textTransform,
                  }}
                >
                  {description}
                </p>
                <Link
                  cta={{ link: card.cta.link, linkType: "URL" }}
                  className="inline-flex min-h-[44px] items-center text-sm font-semibold text-[#ad5f2d] no-underline"
                >
                  {card.cta.label}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const RuggedUtilityFeaturedDepartmentsSection: ComponentConfig<RuggedUtilityFeaturedDepartmentsSectionProps> =
  {
    label: "Rugged Utility Featured Departments Section",
    fields: RuggedUtilityFeaturedDepartmentsSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Featured departments",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 36,
        fontColor: "#181715",
        fontWeight: 400,
        textTransform: "normal",
      },
      cards: [
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Trail footwear",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 17,
            fontColor: "#181715",
            fontWeight: 800,
            textTransform: "normal",
          },
          description: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Boots, hikers, and running shoes chosen for rocky ground, wet weather, and long weekends.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 14,
            fontColor: "#6d665b",
            fontWeight: 400,
            textTransform: "normal",
          },
          cta: {
            label: "Explore footwear",
            link: "#",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Camp kitchen and shelter",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 17,
            fontColor: "#181715",
            fontWeight: 800,
            textTransform: "normal",
          },
          description: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Tents, stoves, camp lighting, and practical car-camping setups for fast departures.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 14,
            fontColor: "#6d665b",
            fontWeight: 400,
            textTransform: "normal",
          },
          cta: {
            label: "Explore camp gear",
            link: "#",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Cold-weather layers",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 17,
            fontColor: "#181715",
            fontWeight: 800,
            textTransform: "normal",
          },
          description: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Insulated jackets, base layers, and gloves that hold up through shoulder season and snow days.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 14,
            fontColor: "#6d665b",
            fontWeight: 400,
            textTransform: "normal",
          },
          cta: {
            label: "Explore layers",
            link: "#",
          },
        },
      ],
    },
    render: RuggedUtilityFeaturedDepartmentsSectionComponent,
  };
