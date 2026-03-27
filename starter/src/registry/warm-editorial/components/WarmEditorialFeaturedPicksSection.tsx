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

type FeaturedPickItem = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  title: StyledTextProps;
  description: StyledTextProps;
  cta: {
    label: string;
    link: string;
  };
};

export type WarmEditorialFeaturedPicksSectionProps = {
  heading: StyledTextProps;
  picks: FeaturedPickItem[];
};

const createStyledTextFields = (label: string) =>
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
          { label: "Normal", value: "normal" },
          { label: "Uppercase", value: "uppercase" },
          { label: "Lowercase", value: "lowercase" },
          { label: "Capitalize", value: "capitalize" },
        ],
      },
    },
  }) as const;

const createStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
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
  textTransform: "normal",
});

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const WarmEditorialFeaturedPicksSectionFields: Fields<WarmEditorialFeaturedPicksSectionProps> =
  {
    heading: createStyledTextFields("Heading"),
    picks: {
      label: "Picks",
      type: "array",
      getItemSummary: () => "Pick",
      defaultItemProps: {
        image: {
          field: "",
          constantValue: {
            url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
            width: 1200,
            height: 800,
          },
          constantValueEnabled: true,
        },
        title: createStyledTextDefault("Featured pick", 19, "#2b211d", 700),
        description: createStyledTextDefault(
          "Add a short description for this featured item.",
          16,
          "#2b211d",
          500,
        ),
        cta: {
          label: "View menu",
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
        title: createStyledTextFields("Title"),
        description: createStyledTextFields("Description"),
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

export const WarmEditorialFeaturedPicksSectionComponent: PuckComponent<
  WarmEditorialFeaturedPicksSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";

  return (
    <section className="w-full bg-[#fffaf3] px-6 py-6">
      <div className="mx-auto max-w-[1024px]">
        <div className="mb-6">
          <h2
            className="m-0"
            style={{
              fontFamily: '"Newsreader", Georgia, serif',
              fontSize: `${props.heading.fontSize}px`,
              lineHeight: 0.98,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
            }}
          >
            {resolvedHeading}
          </h2>
        </div>
        <div className="grid gap-5 max-[900px]:grid-cols-1 min-[901px]:grid-cols-3">
          {props.picks.map((item, index) => {
            const resolvedImage = resolveComponentData(
              item.image,
              locale,
              streamDocument,
            );

            return (
              <article
                key={`${item.cta.label}-${index}`}
                className="grid overflow-hidden rounded-[8px] border border-[#eadbcb] bg-[#ffffff]"
              >
                {resolvedImage ? (
                  <Image
                    image={resolvedImage}
                    className="h-[210px] w-full object-cover"
                  />
                ) : null}
                <div className="grid gap-4 p-5">
                  <h3
                    className="m-0"
                    style={{
                      fontFamily: '"Space Grotesk", Arial, sans-serif',
                      fontSize: `${item.title.fontSize}px`,
                      color: item.title.fontColor,
                      fontWeight: item.title.fontWeight,
                      textTransform: toCssTextTransform(
                        item.title.textTransform,
                      ),
                      lineHeight: 1.4,
                    }}
                  >
                    {resolveStyledText(item.title, locale, streamDocument)}
                  </h3>
                  <p
                    className="m-0"
                    style={{
                      fontFamily: '"Space Grotesk", Arial, sans-serif',
                      fontSize: `${item.description.fontSize}px`,
                      color: item.description.fontColor,
                      fontWeight: item.description.fontWeight,
                      textTransform: toCssTextTransform(
                        item.description.textTransform,
                      ),
                      lineHeight: 1.5,
                    }}
                  >
                    {resolveStyledText(
                      item.description,
                      locale,
                      streamDocument,
                    )}
                  </p>
                  <div className="w-full">
                    <Link
                      cta={{
                        link: item.cta.link,
                        linkType: "URL",
                      }}
                      className="flex min-h-[46px] w-full items-center justify-center rounded-full border-2 border-[#a55739] bg-transparent px-[18px] text-[#a55739] no-underline"
                    >
                      <span
                        style={{
                          fontFamily: '"Space Grotesk", Arial, sans-serif',
                          fontWeight: 700,
                        }}
                      >
                        {item.cta.label}
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const WarmEditorialFeaturedPicksSection: ComponentConfig<WarmEditorialFeaturedPicksSectionProps> =
  {
    label: "Warm Editorial Featured Picks Section",
    fields: WarmEditorialFeaturedPicksSectionFields,
    defaultProps: {
      heading: createStyledTextDefault("Bakeshop picks", 34, "#2b211d", 700),
      picks: [
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: createStyledTextDefault(
            "Morning pastry case",
            19,
            "#2b211d",
            700,
          ),
          description: createStyledTextDefault(
            "Croissants, buns, and laminated seasonal specials that rotate through the week.",
            16,
            "#2b211d",
            500,
          ),
          cta: {
            label: "View menu",
            link: "#",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: createStyledTextDefault(
            "Loaves and house bread",
            19,
            "#2b211d",
            700,
          ),
          description: createStyledTextDefault(
            "Slow-fermented breads for pickup, table service, and regular neighborhood orders.",
            16,
            "#2b211d",
            500,
          ),
          cta: {
            label: "View menu",
            link: "#",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: createStyledTextDefault(
            "Preorder cakes and boxes",
            19,
            "#2b211d",
            700,
          ),
          description: createStyledTextDefault(
            "Celebration desserts, weekend pastry assortments, and pickup-ready bundles.",
            16,
            "#2b211d",
            500,
          ),
          cta: {
            label: "View menu",
            link: "#",
          },
        },
      ],
    },
    render: WarmEditorialFeaturedPicksSectionComponent,
  };
