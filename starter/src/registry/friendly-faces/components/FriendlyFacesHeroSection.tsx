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

type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type TextTransform = "normal" | "uppercase" | "lowercase" | "capitalize";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: FontWeight;
  textTransform: TextTransform;
};

type CtaProps = {
  label: string;
  link: string;
  variant: "solid" | "outline";
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

const buildStyledTextFields = (label: string) => ({
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
      options: fontWeightOptions,
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: textTransformOptions,
    },
  },
});

const buildStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: FontWeight,
  textTransform: TextTransform = "normal",
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

const getTextTransformStyle = (value: TextTransform) =>
  value === "normal" ? undefined : value;

export type FriendlyFacesHeroSectionProps = {
  heading: StyledTextProps;
  location: StyledTextProps;
  description: StyledTextProps;
  primaryCta: CtaProps;
  secondaryCta: CtaProps;
  heroImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
};

const FriendlyFacesHeroSectionFields: Fields<FriendlyFacesHeroSectionProps> = {
  heading: buildStyledTextFields("Heading"),
  location: buildStyledTextFields("Location"),
  description: buildStyledTextFields("Description"),
  primaryCta: {
    label: "Primary Call To Action",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      variant: {
        label: "Variant",
        type: "select",
        options: [{ label: "Solid", value: "solid" }],
      },
    },
  },
  secondaryCta: {
    label: "Secondary Call To Action",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      variant: {
        label: "Variant",
        type: "select",
        options: [{ label: "Outline", value: "outline" }],
      },
    },
  },
  heroImage: YextEntityFieldSelector<
    any,
    ImageType | ComplexImageType | TranslatableAssetImage
  >({
    label: "Hero Image",
    filter: {
      types: ["type.image"],
    },
  }),
};

export const FriendlyFacesHeroSectionComponent: PuckComponent<
  FriendlyFacesHeroSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedLocation =
    resolveComponentData(props.location.text, locale, streamDocument) || "";
  const resolvedDescription =
    resolveComponentData(props.description.text, locale, streamDocument) || "";
  const resolvedHeroImage = resolveComponentData(
    props.heroImage,
    locale,
    streamDocument,
  );

  const ctaClassName = (variant: "solid" | "outline") =>
    variant === "solid"
      ? "inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#0f7c82] bg-[#0f7c82] px-[18px] font-['Nunito','Open_Sans',sans-serif] text-base font-extrabold text-white no-underline"
      : "inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#0f7c82] px-[18px] font-['Nunito','Open_Sans',sans-serif] text-base font-extrabold text-[#0f7c82] no-underline";

  return (
    <section
      id="main-content"
      className="mx-auto w-full max-w-[1100px] px-6 pb-8 pt-12"
    >
      <div className="grid justify-items-center gap-5 rounded-[32px] border border-[#d5e8ea] bg-[linear-gradient(180deg,#edf9f8_0%,#ffffff_100%)] p-10 text-center">
        <h1
          className="m-0 max-w-[12ch]"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: `clamp(3rem, 6vw, ${props.heading.fontSize}px)`,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: getTextTransformStyle(props.heading.textTransform),
          }}
        >
          {resolvedHeading}
        </h1>
        <p
          className="m-0 font-['Nunito','Open_Sans',sans-serif]"
          style={{
            fontSize: `${props.location.fontSize}px`,
            color: props.location.fontColor,
            fontWeight: props.location.fontWeight,
            textTransform: getTextTransformStyle(props.location.textTransform),
          }}
        >
          {resolvedLocation}
        </p>
        <p
          className="m-0 max-w-[52ch] font-['Nunito','Open_Sans',sans-serif] leading-[1.6]"
          style={{
            fontSize: `${props.description.fontSize}px`,
            color: props.description.fontColor,
            fontWeight: props.description.fontWeight,
            textTransform: getTextTransformStyle(
              props.description.textTransform,
            ),
          }}
        >
          {resolvedDescription}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            cta={{ link: props.primaryCta.link, linkType: "URL" }}
            className={ctaClassName(props.primaryCta.variant)}
          >
            {props.primaryCta.label}
          </Link>
          <Link
            cta={{ link: props.secondaryCta.link, linkType: "URL" }}
            className={ctaClassName(props.secondaryCta.variant)}
          >
            {props.secondaryCta.label}
          </Link>
        </div>
        {resolvedHeroImage && (
          <div
            aria-hidden="true"
            className="min-h-[220px] w-full max-w-[720px] overflow-hidden rounded-[28px] border border-[#d5e8ea] bg-white"
          >
            <Image
              image={resolvedHeroImage}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export const FriendlyFacesHeroSection: ComponentConfig<FriendlyFacesHeroSectionProps> =
  {
    label: "Friendly Faces Hero Section",
    fields: FriendlyFacesHeroSectionFields,
    defaultProps: {
      heading: buildStyledTextDefault(
        "Maple Grove Pediatrics",
        80,
        "#17313d",
        700,
      ),
      location: buildStyledTextDefault("Cary, NC", 20, "#0f7c82", 800),
      description: buildStyledTextDefault(
        "A reassuring neighborhood practice for infants, kids, and teens, with same-day sick visits, preventive care, and parent-friendly communication.",
        16,
        "#5f7380",
        400,
      ),
      primaryCta: {
        label: "Book a well visit",
        link: "#",
        variant: "solid",
      },
      secondaryCta: {
        label: "Meet the care team",
        link: "#",
        variant: "outline",
      },
      heroImage: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1400&q=80",
          width: 1400,
          height: 933,
        },
        constantValueEnabled: true,
      },
    },
    render: FriendlyFacesHeroSectionComponent,
  };
