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

type CtaProps = {
  label: string;
  link: string;
};

export type ModernEraWorkshopPromoSectionProps = {
  heading: StyledTextProps;
  description: StyledTextProps;
  primaryCta: CtaProps;
  secondaryCta: CtaProps;
  promoImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
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

const styledTextFields = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    text: YextEntityFieldSelector<any, TranslatableString>({
      label: "Text",
      filter: { types: ["type.string"] },
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
  },
});

const styledTextDefault = (
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

const resolveText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const cssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const ModernEraWorkshopPromoSectionFields: Fields<ModernEraWorkshopPromoSectionProps> =
  {
    heading: styledTextFields("Heading"),
    description: styledTextFields("Description"),
    primaryCta: {
      label: "Primary Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    secondaryCta: {
      label: "Secondary Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
    promoImage: YextEntityFieldSelector<
      any,
      ImageType | ComplexImageType | TranslatableAssetImage
    >({
      label: "Promo Image",
      filter: { types: ["type.image"] },
    }),
  };

export const ModernEraWorkshopPromoSectionComponent: PuckComponent<
  ModernEraWorkshopPromoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveText(props.heading, locale, streamDocument);
  const description = resolveText(props.description, locale, streamDocument);
  const promoImage = resolveComponentData(
    props.promoImage,
    locale,
    streamDocument,
  );

  return (
    <section className="mx-auto w-full max-w-[1120px] px-6 pb-6 pt-14">
      <div className="grid grid-cols-[1.15fr_0.85fr] items-center gap-6 overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#163350_0%,#2a6cb0_100%)] p-8 text-white max-[920px]:grid-cols-1">
        <div
          className="grid gap-4"
          style={{ fontFamily: '"Manrope", "Open Sans", sans-serif' }}
        >
          <h2
            className="m-0 text-white"
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: `${props.heading.fontSize}px`,
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: cssTextTransform(props.heading.textTransform),
            }}
          >
            {heading}
          </h2>
          <p
            className="m-0"
            style={{
              fontSize: `${props.description.fontSize}px`,
              color: props.description.fontColor,
              fontWeight: props.description.fontWeight,
              textTransform: cssTextTransform(props.description.textTransform),
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              cta={{ link: props.primaryCta.link, linkType: "URL" }}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-white bg-white px-[18px] font-bold text-[#19324d] no-underline"
            >
              {props.primaryCta.label}
            </Link>
            <Link
              cta={{ link: props.secondaryCta.link, linkType: "URL" }}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-white bg-transparent px-[18px] font-bold text-white no-underline"
            >
              {props.secondaryCta.label}
            </Link>
          </div>
        </div>
        <div className="min-h-[260px] overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.12)]">
          {promoImage ? (
            <div className="h-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
              <Image image={promoImage} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export const ModernEraWorkshopPromoSection: ComponentConfig<ModernEraWorkshopPromoSectionProps> =
  {
    label: "Modern Era Workshop Promo Section",
    fields: ModernEraWorkshopPromoSectionFields,
    defaultProps: {
      heading: styledTextDefault(
        "Retirement readiness sessions every Thursday evening",
        42,
        "#ffffff",
        400,
      ),
      description: styledTextDefault(
        "Join a free in-branch workshop on timing, rollover decisions, healthcare planning, and how to turn a rough goal into a working plan.",
        16,
        "#ffffff",
        400,
      ),
      primaryCta: {
        label: "Reserve a seat",
        link: "#",
      },
      secondaryCta: {
        label: "See upcoming sessions",
        link: "#",
      },
      promoImage: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
          width: 1200,
          height: 900,
        },
        constantValueEnabled: true,
      },
    },
    render: ModernEraWorkshopPromoSectionComponent,
  };
