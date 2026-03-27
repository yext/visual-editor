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

type HeroCta = {
  label: string;
  link: string;
};

export type NaturallyGroundedHeroSectionProps = {
  backgroundImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  heading: StyledTextProps;
  location: StyledTextProps;
  description: StyledTextProps;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
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
} satisfies Fields<StyledTextProps>;

const ctaObjectFields = {
  label: { label: "Label", type: "text" },
  link: { label: "Link", type: "text" },
} satisfies Fields<HeroCta>;

const createTextDefault = (
  value: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: value,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform: "normal",
});

const getTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

export const NaturallyGroundedHeroSectionComponent: PuckComponent<
  NaturallyGroundedHeroSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedBackgroundImage = resolveComponentData(
    props.backgroundImage,
    locale,
    streamDocument,
  );
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedLocation =
    resolveComponentData(props.location.text, locale, streamDocument) || "";
  const resolvedDescription =
    resolveComponentData(props.description.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto w-full max-w-[1120px] px-6 pb-8 pt-12">
      <div className="relative flex min-h-[420px] items-center overflow-hidden rounded-[30px] p-5">
        {resolvedBackgroundImage && (
          <>
            <div className="absolute inset-0">
              <Image
                image={resolvedBackgroundImage}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-[rgba(18,36,24,0.24)]" />
          </>
        )}
        <div className="relative grid max-w-[520px] gap-4 rounded-[26px] bg-[rgba(255,255,255,0.92)] p-6 shadow-[0_18px_40px_rgba(17,24,39,0.12)]">
          <h1
            className="m-0 font-['Libre_Baskerville','Times_New_Roman',serif] leading-[1.02] tracking-[-0.03em] text-[#1d4b33]"
            style={{
              color: props.heading.fontColor,
              fontSize: `clamp(3rem, 5.6vw, ${props.heading.fontSize}px)`,
              fontWeight: props.heading.fontWeight,
              textTransform: getTextTransform(props.heading.textTransform),
            }}
          >
            {resolvedHeading}
          </h1>
          <p
            className="m-0 font-['Work_Sans','Open_Sans',sans-serif] leading-[1.55]"
            style={{
              color: props.location.fontColor,
              fontSize: `${props.location.fontSize}px`,
              fontWeight: props.location.fontWeight,
              textTransform: getTextTransform(props.location.textTransform),
            }}
          >
            {resolvedLocation}
          </p>
          <p
            className="m-0 font-['Work_Sans','Open_Sans',sans-serif] text-base leading-[1.55]"
            style={{
              color: props.description.fontColor,
              fontSize: `${props.description.fontSize}px`,
              fontWeight: props.description.fontWeight,
              textTransform: getTextTransform(props.description.textTransform),
            }}
          >
            {resolvedDescription}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              cta={{
                link: props.primaryCta.link,
                linkType: "URL",
              }}
            >
              <span className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#1d4b33] px-[18px] font-['Work_Sans','Open_Sans',sans-serif] text-sm font-bold text-white no-underline">
                {props.primaryCta.label}
              </span>
            </Link>
            <Link
              cta={{
                link: props.secondaryCta.link,
                linkType: "URL",
              }}
            >
              <span className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#1d4b33] px-[18px] font-['Work_Sans','Open_Sans',sans-serif] text-sm font-bold text-[#1d4b33] no-underline">
                {props.secondaryCta.label}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export const NaturallyGroundedHeroSection: ComponentConfig<NaturallyGroundedHeroSectionProps> =
  {
    label: "Naturally Grounded Hero Section",
    fields: {
      backgroundImage: YextEntityFieldSelector<
        any,
        ImageType | ComplexImageType | TranslatableAssetImage
      >({
        label: "Background Image",
        filter: {
          types: ["type.image"],
        },
      }),
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
        label: "Primary Call To Action",
        type: "object",
        objectFields: ctaObjectFields,
      },
      secondaryCta: {
        label: "Secondary Call To Action",
        type: "object",
        objectFields: ctaObjectFields,
      },
    },
    defaultProps: {
      backgroundImage: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
          width: 1600,
          height: 1067,
        },
        constantValueEnabled: true,
      },
      heading: createTextDefault("Field & Root Market", 80, "#1d4b33", 700),
      location: createTextDefault("Burlington, VT", 20, "#5a8d4e", 800),
      description: createTextDefault(
        "A neighborhood health foods grocery with practical everyday staples, local produce, refill-friendly household goods, and lower-waste shopping options.",
        16,
        "#607164",
        400,
      ),
      primaryCta: {
        label: "Shop this store",
        link: "#",
      },
      secondaryCta: {
        label: "Get directions",
        link: "#",
      },
    },
    render: NaturallyGroundedHeroSectionComponent,
  };
