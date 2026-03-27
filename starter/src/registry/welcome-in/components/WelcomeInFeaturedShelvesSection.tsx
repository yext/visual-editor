import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  Image,
  resolveComponentData,
  TranslatableAssetImage,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType, Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type ShelfCard = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  title: StyledTextProps;
  description: StyledTextProps;
  cta: {
    label: string;
    link: string;
  };
};

export type WelcomeInFeaturedShelvesSectionProps = {
  heading: StyledTextProps;
  cards: ShelfCard[];
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

const createStyledTextField = (label: string): any => ({
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
      options: fontWeightOptions,
    },
    textTransform: {
      label: "Text Transform",
      type: "select",
      options: textTransformOptions,
    },
  },
});

const defaultStyledText = (
  value: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
) => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: value,
      hasLocalizedValue: "true" as const,
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
  streamDocument: Record<string, any>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const WelcomeInFeaturedShelvesSectionFields: Fields<WelcomeInFeaturedShelvesSectionProps> =
  {
    heading: createStyledTextField("Heading"),
    cards: {
      label: "Cards",
      type: "array",
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
        title: createStyledTextField("Title"),
        description: createStyledTextField("Description"),
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
        image: {
          field: "",
          constantValue: {
            url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
            width: 1200,
            height: 800,
          },
          constantValueEnabled: true,
        },
        title: defaultStyledText("Shelf title", 17, "#24324d", 800),
        description: defaultStyledText("Shelf description", 16, "#24324d", 400),
        cta: {
          label: "Browse Shelf",
          link: "#",
        },
      },
      getItemSummary: (item: ShelfCard) =>
        (item as any)?.title?.text?.constantValue?.defaultValue || "Card",
    },
  };

export const WelcomeInFeaturedShelvesSectionComponent: PuckComponent<
  WelcomeInFeaturedShelvesSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveStyledText(props.heading, locale, streamDocument);

  return (
    <section className="w-full bg-[#fffdfb] py-3">
      <div className="mx-auto w-full max-w-[1024px] px-6">
        <div className="mb-6 text-center">
          <h2
            className="m-0"
            style={{
              fontFamily: '"Baloo 2", "Trebuchet MS", sans-serif',
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            {heading}
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {props.cards.map((card, index) => {
            const title = resolveStyledText(card.title, locale, streamDocument);
            const description = resolveStyledText(
              card.description,
              locale,
              streamDocument,
            );
            const resolvedImage = resolveComponentData(
              card.image,
              locale,
              streamDocument,
            );

            return (
              <article
                key={`${title}-${index}`}
                className="grid overflow-hidden rounded-[34px] border border-[#d9dced] bg-[#fffdfb]"
              >
                <div className="max-h-[180px] min-h-[180px] overflow-hidden">
                  {resolvedImage ? (
                    <div className="[&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                      <Image image={resolvedImage} />
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-4 p-5">
                  <h3
                    className="m-0"
                    style={{
                      fontFamily:
                        '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
                      fontSize: `${card.title.fontSize}px`,
                      color: card.title.fontColor,
                      fontWeight: card.title.fontWeight,
                      textTransform: toCssTextTransform(
                        card.title.textTransform,
                      ),
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    className="m-0"
                    style={{
                      fontFamily:
                        '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
                      fontSize: `${card.description.fontSize}px`,
                      color: card.description.fontColor,
                      fontWeight: card.description.fontWeight,
                      textTransform: toCssTextTransform(
                        card.description.textTransform,
                      ),
                      lineHeight: 1.55,
                    }}
                  >
                    {description}
                  </p>
                  <Link
                    cta={{
                      link: card.cta.link,
                      linkType: "URL",
                    }}
                    className="text-[16px] text-[#db5d7d]"
                  >
                    {card.cta.label}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const WelcomeInFeaturedShelvesSection: ComponentConfig<WelcomeInFeaturedShelvesSectionProps> =
  {
    label: "Welcome In Featured Shelves Section",
    fields: WelcomeInFeaturedShelvesSectionFields,
    defaultProps: {
      heading: defaultStyledText("Featured shelves", 35, "#24324d", 800),
      cards: [
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: defaultStyledText(
            "Picture books and read-aloud picks",
            17,
            "#24324d",
            800,
          ),
          description: defaultStyledText(
            "Bright favorites, new releases, and bedtime standouts for families who read together often.",
            16,
            "#24324d",
            400,
          ),
          cta: {
            label: "Browse picture books",
            link: "#",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: defaultStyledText("Gift-ready bundles", 17, "#24324d", 800),
          description: defaultStyledText(
            "Curated birthday picks, teacher gifts, and easy grab-and-go stacks for last-minute celebrations.",
            16,
            "#24324d",
            400,
          ),
          cta: {
            label: "Browse gift bundles",
            link: "#",
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
              width: 1200,
              height: 800,
            },
            constantValueEnabled: true,
          },
          title: defaultStyledText(
            "Early reader favorites",
            17,
            "#24324d",
            800,
          ),
          description: defaultStyledText(
            "Friendly chapter books, graphic readers, and series starters for kids building confidence on their own.",
            16,
            "#24324d",
            400,
          ),
          cta: {
            label: "Browse early readers",
            link: "#",
          },
        },
      ],
    },
    render: WelcomeInFeaturedShelvesSectionComponent,
  };
