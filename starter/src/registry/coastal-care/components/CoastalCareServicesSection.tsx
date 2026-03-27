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

type LinkProps = {
  label: string;
  link: string;
};

type ServiceCardProps = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  title: StyledTextProps;
  description: StyledTextProps;
  cta: LinkProps;
};

export type CoastalCareServicesSectionProps = {
  sectionHeading: StyledTextProps;
  services: ServiceCardProps[];
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

const linkFields = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    label: { label: "Label", type: "text" as const },
    link: { label: "Link", type: "text" as const },
  },
});

const imageField = (label: string) =>
  YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label,
    filter: {
      types: ["type.image"],
    },
  });

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const CoastalCareServicesSectionFields: Fields<CoastalCareServicesSectionProps> =
  {
    sectionHeading: styledTextFields("Section Heading"),
    services: {
      label: "Services",
      type: "array",
      arrayFields: {
        image: imageField("Image"),
        title: styledTextFields("Title"),
        description: styledTextFields("Description"),
        cta: linkFields("Call To Action"),
      },
      defaultItemProps: {
        image: {
          field: "",
          constantValue: {
            url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
            width: 1200,
            height: 800,
          },
          constantValueEnabled: true,
        },
        title: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Service Title",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 18,
          fontColor: "#183347",
          fontWeight: 800,
          textTransform: "normal",
        },
        description: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Service description.",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 16,
          fontColor: "#5f7684",
          fontWeight: 400,
          textTransform: "normal",
        },
        cta: {
          label: "See details",
          link: "#",
        },
      },
      getItemSummary: (item: any) =>
        item?.title?.text?.constantValue?.defaultValue || "Service Card",
    },
  };

export const CoastalCareServicesSectionComponent: PuckComponent<
  CoastalCareServicesSectionProps
> = ({ sectionHeading, services }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedSectionHeading =
    resolveComponentData(sectionHeading.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto w-full max-w-[1024px] px-6 py-6">
      <div className="mb-6">
        <h2
          className="m-0 font-['DM_Serif_Display','Times_New_Roman',serif] leading-none"
          style={{
            fontSize: `${sectionHeading.fontSize}px`,
            color: sectionHeading.fontColor,
            fontWeight: sectionHeading.fontWeight,
            textTransform: toCssTextTransform(sectionHeading.textTransform),
          }}
        >
          {resolvedSectionHeading}
        </h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {services.map((service, index) => {
          const resolvedImage = resolveComponentData(
            service.image,
            locale,
            streamDocument,
          );
          const resolvedTitle =
            resolveComponentData(service.title.text, locale, streamDocument) ||
            "";
          const resolvedDescription =
            resolveComponentData(
              service.description.text,
              locale,
              streamDocument,
            ) || "";

          return (
            <article
              key={`${resolvedTitle}-${index}`}
              className="grid overflow-hidden rounded-[24px] border border-[#d7e3e7] bg-white"
            >
              {resolvedImage && (
                <div className="h-[220px] overflow-hidden [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                  <Image image={resolvedImage} />
                </div>
              )}
              <div className="grid gap-4 p-5">
                <h3
                  className="m-0 font-['Public_Sans','Open_Sans',sans-serif] leading-[1.2]"
                  style={{
                    fontSize: `${service.title.fontSize}px`,
                    color: service.title.fontColor,
                    fontWeight: service.title.fontWeight,
                    textTransform: toCssTextTransform(
                      service.title.textTransform,
                    ),
                  }}
                >
                  {resolvedTitle}
                </h3>
                <p
                  className="m-0 font-['Public_Sans','Open_Sans',sans-serif] leading-[1.55]"
                  style={{
                    fontSize: `${service.description.fontSize}px`,
                    color: service.description.fontColor,
                    fontWeight: service.description.fontWeight,
                    textTransform: toCssTextTransform(
                      service.description.textTransform,
                    ),
                  }}
                >
                  {resolvedDescription}
                </p>
                <div>
                  <Link
                    cta={{
                      link: service.cta.link,
                      linkType: "URL",
                    }}
                    className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#2d6f83] bg-transparent px-[18px] font-['Public_Sans','Open_Sans',sans-serif] text-sm font-bold text-[#2d6f83] no-underline"
                  >
                    {service.cta.label}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const CoastalCareServicesSection: ComponentConfig<CoastalCareServicesSectionProps> =
  {
    label: "Coastal Care Services Section",
    fields: CoastalCareServicesSectionFields,
    defaultProps: {
      sectionHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Services",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 35,
        fontColor: "#183347",
        fontWeight: 400,
        textTransform: "normal",
      },
      services: [
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Preventive visits",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 18,
            fontColor: "#183347",
            fontWeight: 800,
            textTransform: "normal",
          },
          description: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Routine wellness exams, vaccines, and seasonal preventive plans.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#5f7684",
            fontWeight: 400,
            textTransform: "normal",
          },
          cta: {
            label: "See details",
            link: "#",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Same-week care",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 18,
            fontColor: "#183347",
            fontWeight: 800,
            textTransform: "normal",
          },
          description: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Reserved scheduling space for sudden symptoms and urgent follow-up needs.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#5f7684",
            fontWeight: 400,
            textTransform: "normal",
          },
          cta: {
            label: "See details",
            link: "#",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Dental and long-term care",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 18,
            fontColor: "#183347",
            fontWeight: 800,
            textTransform: "normal",
          },
          description: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Oral health support and treatment plans for pets who need ongoing attention.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#5f7684",
            fontWeight: 400,
            textTransform: "normal",
          },
          cta: {
            label: "See details",
            link: "#",
          },
        },
      ],
    },
    render: CoastalCareServicesSectionComponent,
  };
