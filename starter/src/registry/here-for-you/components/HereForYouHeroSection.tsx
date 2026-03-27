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

const toCssTextTransform = (
  value: StyledTextProps["textTransform"],
): "none" | "uppercase" | "lowercase" | "capitalize" =>
  value === "normal" ? "none" : value;

type CtaProps = {
  label: string;
  link: string;
  isPrimary: boolean;
};

export type HereForYouHeroSectionProps = {
  heading: StyledTextProps;
  location: StyledTextProps;
  status: StyledTextProps;
  heroImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  ctas: CtaProps[];
};

const createStyledTextFields = (): Fields<StyledTextProps> => ({
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
});

const createStyledTextDefault = (
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

const HereForYouHeroSectionFields: Fields<HereForYouHeroSectionProps> = {
  heading: {
    label: "Heading",
    type: "object",
    objectFields: createStyledTextFields(),
  },
  location: {
    label: "Location",
    type: "object",
    objectFields: createStyledTextFields(),
  },
  status: {
    label: "Status",
    type: "object",
    objectFields: createStyledTextFields(),
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
  ctas: {
    label: "Call To Action Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      isPrimary: {
        label: "Is Primary",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
    defaultItemProps: {
      label: "Learn More",
      link: "#",
      isPrimary: false,
    },
    getItemSummary: (item) => item.label,
  },
};

export const HereForYouHeroSectionComponent: PuckComponent<
  HereForYouHeroSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, any>;
  const locale = streamDocument.locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const location =
    resolveComponentData(props.location.text, locale, streamDocument) || "";
  const status =
    resolveComponentData(props.status.text, locale, streamDocument) || "";
  const heroImage = resolveComponentData(
    props.heroImage,
    locale,
    streamDocument,
  ) as unknown as
    | ImageType
    | ComplexImageType
    | TranslatableAssetImage
    | undefined;

  return (
    <section
      aria-labelledby="here-for-you-hero-title"
      className="mx-auto my-3 w-full max-w-[1024px] px-6"
    >
      <div className="grid grid-cols-[1fr_1fr] items-center gap-8 pt-9 pb-6 max-[900px]:grid-cols-1">
        <div className="grid gap-4">
          <h1
            id="here-for-you-hero-title"
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
            className="m-0"
          >
            {heading}
          </h1>
          <p
            style={{
              fontFamily: '"Manrope", "Open Sans", sans-serif',
              fontSize: `${props.location.fontSize}px`,
              color: props.location.fontColor,
              fontWeight: props.location.fontWeight,
              textTransform: toCssTextTransform(props.location.textTransform),
              lineHeight: 1.55,
            }}
            className="m-0"
          >
            {location}
          </p>
          <p
            style={{
              fontFamily: '"Manrope", "Open Sans", sans-serif',
              fontSize: `${props.status.fontSize}px`,
              color: props.status.fontColor,
              fontWeight: props.status.fontWeight,
              textTransform: toCssTextTransform(props.status.textTransform),
              lineHeight: 1.55,
              maxWidth: "42ch",
            }}
            className="m-0"
          >
            {status}
          </p>
          <div className="flex flex-wrap gap-3">
            {props.ctas.map((cta) => (
              <Link
                key={`${cta.label}-${cta.link}`}
                cta={{ link: cta.link, linkType: "URL" }}
                className={
                  cta.isPrimary
                    ? "inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#2d8a87] bg-[#2d8a87] px-[18px] text-sm font-bold text-white no-underline"
                    : "inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#2d8a87] bg-transparent px-[18px] text-sm font-bold text-[#2d8a87] no-underline"
                }
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="min-h-[420px] overflow-hidden rounded-[28px] border border-[#d7e7e6] [aspect-ratio:4/5]">
          {heroImage ? (
            <div className="h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
              <Image className="h-full" image={heroImage as any} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export const HereForYouHeroSection: ComponentConfig<HereForYouHeroSectionProps> =
  {
    label: "Here For You Hero Section",
    fields: HereForYouHeroSectionFields,
    defaultProps: {
      heading: createStyledTextDefault(
        "Harbor Physical Therapy",
        80,
        "#203446",
        700,
      ),
      location: createStyledTextDefault("Providence, RI", 18, "#2d8a87", 800),
      status: createStyledTextDefault(
        "A supportive neighborhood clinic for recovery, strength rebuilding, and return-to-daily-life treatment plans that feel clear from day one.",
        16,
        "#667685",
        400,
      ),
      heroImage: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80",
        } as any,
        constantValueEnabled: true,
      },
      ctas: [
        {
          label: "Request evaluation",
          link: "#",
          isPrimary: true,
        },
        {
          label: "Get directions",
          link: "#",
          isPrimary: false,
        },
      ],
    },
    render: HereForYouHeroSectionComponent,
  };
