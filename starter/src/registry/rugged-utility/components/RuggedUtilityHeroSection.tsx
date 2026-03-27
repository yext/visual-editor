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

export type RuggedUtilityHeroSectionProps = {
  heading: StyledTextProps;
  location: StyledTextProps;
  description: StyledTextProps;
  primaryCta: LinkProps;
  secondaryCta: LinkProps;
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

const RuggedUtilityHeroSectionFields: Fields<RuggedUtilityHeroSectionProps> = {
  heading: {
    label: "Heading",
    type: "object",
    objectFields: styledTextObjectFields,
  },
  location: {
    label: "Location",
    type: "object",
    objectFields: styledTextObjectFields,
  },
  description: {
    label: "Description",
    type: "object",
    objectFields: styledTextObjectFields,
  },
  primaryCta: {
    label: "Primary Cta",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  secondaryCta: {
    label: "Secondary Cta",
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
    filter: {
      types: ["type.image"],
    },
  }),
};

export const RuggedUtilityHeroSectionComponent: PuckComponent<
  RuggedUtilityHeroSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const location =
    resolveComponentData(props.location.text, locale, streamDocument) || "";
  const description =
    resolveComponentData(props.description.text, locale, streamDocument) || "";
  const heroImage = resolveComponentData(
    props.heroImage,
    locale,
    streamDocument,
  );

  return (
    <section className="mx-auto my-3 w-full max-w-[1024px] px-6 pb-6 pt-10">
      <div className="grid items-center gap-8 md:grid-cols-[1.05fr_.95fr]">
        <div className="grid gap-4">
          <h1
            className="m-0 max-w-[8ch]"
            style={{
              fontFamily: '"Archivo Black", "Arial Black", sans-serif',
              fontSize: `clamp(${props.heading.fontSize * 0.58}px, 6vw, ${props.heading.fontSize}px)`,
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
          </h1>
          <p
            className="m-0"
            style={{
              fontFamily: '"Public Sans", "Open Sans", sans-serif',
              fontSize: `${props.location.fontSize}px`,
              lineHeight: 1.5,
              color: props.location.fontColor,
              fontWeight: props.location.fontWeight,
              textTransform:
                props.location.textTransform === "normal"
                  ? "none"
                  : props.location.textTransform,
            }}
          >
            {location}
          </p>
          <p
            className="m-0 max-w-[38ch]"
            style={{
              fontFamily: '"Public Sans", "Open Sans", sans-serif',
              fontSize: `${props.description.fontSize}px`,
              lineHeight: 1.5,
              color: props.description.fontColor,
              fontWeight: props.description.fontWeight,
              textTransform:
                props.description.textTransform === "normal"
                  ? "none"
                  : props.description.textTransform,
            }}
          >
            {description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              cta={{ link: props.primaryCta.link, linkType: "URL" }}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#ad5f2d] bg-[#ad5f2d] px-[18px] text-center text-sm font-extrabold text-[#fffdf8] no-underline"
            >
              {props.primaryCta.label}
            </Link>
            <Link
              cta={{ link: props.secondaryCta.link, linkType: "URL" }}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#ad5f2d] bg-transparent px-[18px] text-center text-sm font-extrabold text-[#ad5f2d] no-underline"
            >
              {props.secondaryCta.label}
            </Link>
          </div>
        </div>
        <div className="min-h-[430px] w-full overflow-hidden rounded-[8px] border border-[#d3c8b6] [aspect-ratio:4/5]">
          {heroImage ? (
            <div className="h-full w-full overflow-hidden [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
              <Image image={heroImage} className="h-full" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export const RuggedUtilityHeroSection: ComponentConfig<RuggedUtilityHeroSectionProps> =
  {
    label: "Rugged Utility Hero Section",
    fields: RuggedUtilityHeroSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Northline Outfitters",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 88,
        fontColor: "#181715",
        fontWeight: 400,
        textTransform: "normal",
      },
      location: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Bend, OR",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 19,
        fontColor: "#37513b",
        fontWeight: 800,
        textTransform: "normal",
      },
      description: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "A local gear shop for mountain weather, trail weekends, and durable equipment you can actually use hard.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#6d665b",
        fontWeight: 400,
        textTransform: "normal",
      },
      primaryCta: {
        label: "Get directions",
        link: "#",
      },
      secondaryCta: {
        label: "See store events",
        link: "#",
      },
      heroImage: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
          width: 1400,
          height: 1750,
        },
        constantValueEnabled: true,
      },
    },
    render: RuggedUtilityHeroSectionComponent,
  };
