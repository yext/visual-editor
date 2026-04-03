import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import type { CSSProperties } from "react";
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

type CallToAction = {
  label: string;
  link: string;
};

export type Hs1AlbanyHeroSectionProps = {
  heading: StyledTextProps;
  subtitle: StyledTextProps;
  cta: CallToAction;
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
];

const textTransformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
];

const styledTextField = (label: string) => ({
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

const styledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"],
) => ({
  text: {
    field: "",
    constantValue: {
      en: text,
      hasLocalizedValue: "true" as const,
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const toCssTextTransform = (
  value: StyledTextProps["textTransform"],
): CSSProperties["textTransform"] => (value === "normal" ? undefined : value);

const getImageUrl = (
  image: ImageType | ComplexImageType | TranslatableAssetImage | undefined,
): string | undefined => {
  if (!image) {
    return undefined;
  }

  if ("url" in image && typeof image.url === "string") {
    return image.url;
  }

  if ("image" in image && image.image && typeof image.image.url === "string") {
    return image.image.url;
  }

  return undefined;
};

const Hs1AlbanyHeroSectionFields: Fields<Hs1AlbanyHeroSectionProps> = {
  heading: styledTextField("Heading"),
  subtitle: styledTextField("Subtitle"),
  cta: {
    label: "Call To Action",
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

export const Hs1AlbanyHeroSectionComponent: PuckComponent<
  Hs1AlbanyHeroSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedSubtitle =
    resolveComponentData(props.subtitle.text, locale, streamDocument) || "";
  const resolvedHeroImage = resolveComponentData(
    props.heroImage,
    locale,
    streamDocument,
  );
  const heroImageUrl =
    getImageUrl(resolvedHeroImage) ??
    "https://cdcssl.ibsrv.net/ibimg/smb/3000x1997_80/webmgr/1o/u/o/Slideshow-XLRG/51046904351_77fdc7bb33_5k.jpg.webp?b464ff6ce4ad3b56caa90d82fcf610d8";

  return (
    <section className="bg-white">
      <div className="flex flex-col md:min-h-[508px] md:flex-row">
        <div className="flex w-full items-center justify-center bg-[#f2efe8] px-8 py-16 md:w-[55%]">
          <div className="flex max-w-[470px] flex-col items-center text-center">
            <h2
              className="m-0"
              style={{
                fontFamily: "Montserrat, Open Sans, sans-serif",
                fontSize: `${props.heading.fontSize}px`,
                color: props.heading.fontColor,
                fontWeight: props.heading.fontWeight,
                textTransform: toCssTextTransform(props.heading.textTransform),
                letterSpacing: "1px",
                lineHeight: "1.15",
              }}
            >
              {resolvedHeading}
            </h2>
            <div className="my-5 h-px w-24 bg-[#d3a335]" />
            <p
              className="m-0"
              style={{
                fontFamily: "Lato, Open Sans, sans-serif",
                fontSize: `${props.subtitle.fontSize}px`,
                color: props.subtitle.fontColor,
                fontWeight: props.subtitle.fontWeight,
                textTransform: toCssTextTransform(props.subtitle.textTransform),
                lineHeight: "1.55",
              }}
            >
              {resolvedSubtitle}
            </p>
            <Link
              cta={{
                link: props.cta.link,
                linkType: "URL",
              }}
            >
              <span
                className="mt-8 inline-flex min-w-[135px] items-center justify-center bg-[#d3a335] px-6 py-3 text-[15px] font-bold uppercase tracking-[0.08em] text-white"
                style={{ fontFamily: "Nunito Sans, Open Sans, sans-serif" }}
              >
                {props.cta.label}
              </span>
            </Link>
          </div>
        </div>
        <div className="relative w-full bg-[#ddb54d] md:w-[45%]">
          <div className="h-full min-h-[300px]">
            <img
              src={heroImageUrl}
              alt=""
              className="h-full min-h-[300px] w-full object-cover"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 bg-white py-4">
        {[0, 1, 2].map((item) => (
          <span
            key={item}
            className={`h-2.5 w-2.5 rounded-full ${
              item === 0 ? "bg-[#4f4e4e]" : "bg-[#bfb8ae]"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export const Hs1AlbanyHeroSection: ComponentConfig<Hs1AlbanyHeroSectionProps> =
  {
    label: "HS1 Albany Hero Section",
    fields: Hs1AlbanyHeroSectionFields,
    defaultProps: {
      heading: styledTextDefault(
        "BUILD A BRIGHTER SMILE",
        30,
        "#7b7b7b",
        400,
        "uppercase",
      ),
      subtitle: styledTextDefault(
        "Love your smile",
        18,
        "#d3a335",
        400,
        "normal",
      ),
      cta: {
        label: "Learn More",
        link: "#",
      },
      heroImage: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/3000x1997_80/webmgr/1o/u/o/Slideshow-XLRG/51046904351_77fdc7bb33_5k.jpg.webp?b464ff6ce4ad3b56caa90d82fcf610d8",
          width: 3000,
          height: 1997,
        },
        constantValueEnabled: true,
      },
    },
    render: Hs1AlbanyHeroSectionComponent,
  };
