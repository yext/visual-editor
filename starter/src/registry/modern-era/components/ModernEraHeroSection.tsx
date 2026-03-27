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

export type ModernEraHeroSectionProps = {
  heading: StyledTextProps;
  location: StyledTextProps;
  description: StyledTextProps;
  primaryCta: CtaProps;
  secondaryCta: CtaProps;
  heroImage: YextEntityField<
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

const ModernEraHeroSectionFields: Fields<ModernEraHeroSectionProps> = {
  heading: styledTextFields("Heading"),
  location: styledTextFields("Location"),
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
  heroImage: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Hero Image",
    filter: { types: ["type.image"] },
  }),
};

export const ModernEraHeroSectionComponent: PuckComponent<
  ModernEraHeroSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveText(props.heading, locale, streamDocument);
  const location = resolveText(props.location, locale, streamDocument);
  const description = resolveText(props.description, locale, streamDocument);
  const heroImage = resolveComponentData(
    props.heroImage,
    locale,
    streamDocument,
  );

  return (
    <section className="mx-auto grid w-full max-w-[1120px] grid-cols-[minmax(0,_1.05fr)_minmax(320px,_460px)] items-center gap-10 px-6 pb-8 pt-12 max-[920px]:grid-cols-1">
      <div
        className="grid gap-4"
        style={{ fontFamily: '"Manrope", "Open Sans", sans-serif' }}
      >
        <h2
          className="m-0 text-[#19324d]"
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: `clamp(3.1rem, 6vw, ${props.heading.fontSize / 16}rem)`,
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
            fontSize: `${props.location.fontSize}px`,
            color: props.location.fontColor,
            fontWeight: props.location.fontWeight,
            textTransform: cssTextTransform(props.location.textTransform),
          }}
        >
          {location}
        </p>
        <p
          className="m-0 max-w-[40ch]"
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
            className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#2a6cb0] bg-[#2a6cb0] px-[18px] font-bold text-white no-underline"
          >
            {props.primaryCta.label}
          </Link>
          <Link
            cta={{ link: props.secondaryCta.link, linkType: "URL" }}
            className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#2a6cb0] bg-transparent px-[18px] font-bold text-[#2a6cb0] no-underline"
          >
            {props.secondaryCta.label}
          </Link>
        </div>
      </div>
      <div className="min-h-[420px] overflow-hidden rounded-[18px] border border-[#d7e2ec] bg-[linear-gradient(180deg,#f5f7fb_0%,#e6eef8_100%)]">
        {heroImage ? (
          <div className="h-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
            <Image image={heroImage} />
          </div>
        ) : null}
      </div>
    </section>
  );
};

export const ModernEraHeroSection: ComponentConfig<ModernEraHeroSectionProps> =
  {
    label: "Modern Era Hero Section",
    fields: ModernEraHeroSectionFields,
    defaultProps: {
      heading: styledTextDefault("Bluehaven Bank", 90, "#19324d", 400),
      location: styledTextDefault("Portland, ME", 21, "#2a6cb0", 800),
      description: styledTextDefault(
        "Contemporary retirement planning for people who want clear next steps, a calmer timeline, and a local advisor who can explain the numbers in plain language.",
        16,
        "#5d6b7b",
        400,
      ),
      primaryCta: {
        label: "Start retirement planning",
        link: "#",
      },
      secondaryCta: {
        label: "Visit this branch",
        link: "#",
      },
      heroImage: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1200&q=80",
          width: 1200,
          height: 900,
        },
        constantValueEnabled: true,
      },
    },
    render: ModernEraHeroSectionComponent,
  };
