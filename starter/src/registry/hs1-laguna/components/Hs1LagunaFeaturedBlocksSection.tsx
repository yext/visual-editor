import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
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

type LinkItem = {
  label: string;
  link: string;
};

type FeaturedCardProps = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  title: StyledTextProps;
  description: StyledTextProps;
  cta: LinkItem;
};

export type Hs1LagunaFeaturedBlocksSectionProps = {
  cardOne: FeaturedCardProps;
  cardTwo: FeaturedCardProps;
  cardThree: FeaturedCardProps;
};

const styledTextFields = (label: string) =>
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
  }) satisfies Fields<{ value: StyledTextProps }>["value"];

const cardFields = (label: string) =>
  ({
    label,
    type: "object",
    objectFields: {
      image: YextEntityFieldSelector<
        any,
        ImageType | ComplexImageType | TranslatableAssetImage
      >({
        label: "Image",
        filter: {
          types: ["type.image"],
        },
      }),
      title: styledTextFields("Title"),
      description: styledTextFields("Description"),
      cta: {
        label: "Call To Action",
        type: "object",
        objectFields: {
          label: { label: "Label", type: "text" },
          link: { label: "Link", type: "text" },
        },
      },
    },
  }) satisfies Fields<{ value: FeaturedCardProps }>["value"];

const Hs1LagunaFeaturedBlocksSectionFields: Fields<Hs1LagunaFeaturedBlocksSectionProps> =
  {
    cardOne: cardFields("Card One"),
    cardTwo: cardFields("Card Two"),
    cardThree: cardFields("Card Three"),
  };

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const resolveImageUrl = (image: unknown): string | undefined => {
  if (!image || typeof image !== "object") {
    return undefined;
  }

  if ("url" in image && typeof image.url === "string") {
    return image.url;
  }

  if (
    "image" in image &&
    image.image &&
    typeof image.image === "object" &&
    "url" in image.image &&
    typeof image.image.url === "string"
  ) {
    return image.image.url;
  }

  return undefined;
};

const renderText = (
  value: StyledTextProps,
  text: string,
  className: string,
) => (
  <span
    className={className}
    style={{
      fontSize: `${value.fontSize}px`,
      color: value.fontColor,
      fontWeight: value.fontWeight,
      textTransform:
        value.textTransform === "normal" ? undefined : value.textTransform,
      fontFamily: "Roboto, Arial, Helvetica, sans-serif",
    }}
  >
    {text}
  </span>
);

export const Hs1LagunaFeaturedBlocksSectionComponent: PuckComponent<
  Hs1LagunaFeaturedBlocksSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown>;
  const locale =
    typeof streamDocument.locale === "string" ? streamDocument.locale : "en";

  const cards = [props.cardOne, props.cardTwo, props.cardThree].map((card) => ({
    image: resolveComponentData(card.image, locale, streamDocument),
    title: resolveStyledText(card.title, locale, streamDocument),
    description: resolveStyledText(card.description, locale, streamDocument),
    cta: card.cta,
    titleStyle: card.title,
    descriptionStyle: card.description,
  }));

  return (
    <section className="bg-[#755b53]">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {cards.map((card) => (
          <article
            key={`${card.title}-${card.cta.link}`}
            className="relative flex min-h-[520px] items-end justify-center overflow-hidden px-[15px] pb-[43px] pt-8 text-white md:min-h-[540px] md:px-5"
          >
            {resolveImageUrl(card.image) ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${resolveImageUrl(card.image)})`,
                }}
              />
            ) : null}

            <div className="relative z-10 w-full max-w-[360px] bg-black/70 px-[15px] pb-[38px] pt-8 text-center md:px-5 md:pb-11">
              <h4 className="flex min-h-[62px] items-end justify-center m-0">
                {renderText(
                  card.titleStyle,
                  card.title,
                  "text-center leading-[1.2]",
                )}
              </h4>
              <div className="mt-[9px] min-h-[95px] text-left leading-[1.188]">
                {renderText(
                  card.descriptionStyle,
                  card.description,
                  "leading-[1.188]",
                )}
              </div>
              <div className="mt-8 flex justify-center">
                <Link
                  cta={{ link: card.cta.link, linkType: "URL" }}
                  className="min-w-[184px] border border-white bg-white px-6 py-3 text-center text-[13px] font-bold uppercase tracking-[0.08em] text-[#755b53] transition-colors hover:bg-transparent hover:text-white"
                >
                  {card.cta.label}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const buildTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      en: text,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform: "normal",
});

const buildCardDefault = (
  imageUrl: string,
  title: string,
  description: string,
): FeaturedCardProps => ({
  image: {
    field: "",
    constantValue: {
      url: imageUrl,
      width: 633,
      height: 800,
    },
    constantValueEnabled: true,
  },
  title: buildTextDefault(title, 20, "#ffffff", 400),
  description: buildTextDefault(description, 16, "#ffffff", 400),
  cta: {
    label: "Learn More",
    link: "https://www.ofc-laguna.com/dental-services",
  },
});

export const Hs1LagunaFeaturedBlocksSection: ComponentConfig<Hs1LagunaFeaturedBlocksSectionProps> =
  {
    label: "Featured Services",
    fields: Hs1LagunaFeaturedBlocksSectionFields,
    defaultProps: {
      cardOne: buildCardDefault(
        "https://cdcssl.ibsrv.net/ibimg/smb/633x800_80/webmgr/1o/s/5/laguna/featuredblocks_1.jpg.webp?4544b3a1dbcae2ca44b042bc470dcec3",
        "General Dentistry",
        "Dentistry encompasses array of services and procedures with a common goal: to help you to preserve your natural teeth, ensure your oral health, and keep you looking and...",
      ),
      cardTwo: buildCardDefault(
        "https://cdcssl.ibsrv.net/ibimg/smb/633x800_80/webmgr/1o/s/5/laguna/featuredblocks_2.jpg.webp?c2054054b39e2b725fddab24ac05d738",
        "Teeth Whitening",
        "Whitening procedures have effectively restored the smile of people with stained, dull, or discolored teeth.",
      ),
      cardThree: buildCardDefault(
        "https://cdcssl.ibsrv.net/ibimg/smb/633x800_80/webmgr/1o/s/5/laguna/featuredblocks_3.jpg.webp?04b0b9f33281977c308c44ecf8718976",
        "Fillings",
        "Frequently asked questions: dental fillings are dental amalgams safe? Is it possible to have an allergic reaction to amalgam?",
      ),
    },
    render: Hs1LagunaFeaturedBlocksSectionComponent,
  };
