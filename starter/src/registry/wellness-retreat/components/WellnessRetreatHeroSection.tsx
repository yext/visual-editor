import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import type { CSSProperties } from "react";
import { ComplexImageType, ImageType, Link } from "@yext/pages-components";
import {
  Image,
  resolveComponentData,
  TranslatableAssetImage,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";

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

export type WellnessRetreatHeroSectionProps = {
  heroImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  heading: StyledTextProps;
  location: StyledTextProps;
  description: StyledTextProps;
  primaryCta: LinkItem;
  secondaryCta: LinkItem;
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

const createStyledTextField = (label: string) => ({
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

const resolveTextValue = (
  field: YextEntityField<TranslatableString>,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(field, locale, streamDocument) || "";

const getTextStyle = (text: StyledTextProps): CSSProperties => ({
  fontSize: `${text.fontSize}px`,
  color: text.fontColor,
  fontWeight: text.fontWeight,
  textTransform: text.textTransform === "normal" ? "none" : text.textTransform,
});

const WellnessRetreatHeroSectionFields: Fields<WellnessRetreatHeroSectionProps> =
  {
    heroImage: YextEntityFieldSelector<
      any,
      ImageType | ComplexImageType | TranslatableAssetImage
    >({
      label: "Hero Image",
      filter: {
        types: ["type.image"],
      },
    }),
    heading: createStyledTextField("Heading"),
    location: createStyledTextField("Location"),
    description: createStyledTextField("Description"),
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
  };

export const WellnessRetreatHeroSectionComponent: PuckComponent<
  WellnessRetreatHeroSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeroImage = resolveComponentData(
    props.heroImage,
    locale,
    streamDocument,
  );
  const resolvedHeading = resolveTextValue(
    props.heading.text,
    locale,
    streamDocument,
  );
  const resolvedLocation = resolveTextValue(
    props.location.text,
    locale,
    streamDocument,
  );
  const resolvedDescription = resolveTextValue(
    props.description.text,
    locale,
    streamDocument,
  );

  return (
    <section className="w-full bg-white py-6">
      <div className="mx-auto grid max-w-[1024px] gap-8 px-6 pt-4 md:grid-cols-[0.92fr_1.08fr] md:items-stretch">
        <div className="min-h-[430px] overflow-hidden rounded-[4px]">
          {resolvedHeroImage ? (
            <Image
              image={resolvedHeroImage}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="grid content-center gap-4 border border-[#d9dde1] bg-[#f4f5f6] p-8">
          <h1
            className="m-0 leading-[0.94] tracking-[-0.03em]"
            style={{
              ...getTextStyle(props.heading),
              fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
            }}
          >
            {resolvedHeading}
          </h1>
          <p
            className="m-0 font-['Inter',sans-serif] leading-[1.55]"
            style={getTextStyle(props.location)}
          >
            {resolvedLocation}
          </p>
          <p
            className="m-0 max-w-[40ch] font-['Inter',sans-serif] leading-[1.55]"
            style={getTextStyle(props.description)}
          >
            {resolvedDescription}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              cta={{ link: props.primaryCta.link, linkType: "URL" }}
              className="inline-flex min-h-[46px] items-center justify-center border border-[#101418] bg-[#101418] px-[18px] font-['Inter',sans-serif] text-base font-semibold text-white no-underline"
            >
              {props.primaryCta.label}
            </Link>
            <Link
              cta={{ link: props.secondaryCta.link, linkType: "URL" }}
              className="inline-flex min-h-[46px] items-center justify-center border border-[#101418] px-[18px] font-['Inter',sans-serif] text-base font-semibold text-[#101418] no-underline"
            >
              {props.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export const WellnessRetreatHeroSection: ComponentConfig<WellnessRetreatHeroSectionProps> =
  {
    label: "Wellness Retreat Hero Section",
    fields: WellnessRetreatHeroSectionFields,
    defaultProps: {
      heroImage: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80",
          width: 1400,
          height: 933,
        },
        constantValueEnabled: true,
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Stillpoint Wellness Studio",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 80,
        fontColor: "#101418",
        fontWeight: 600,
        textTransform: "normal",
      },
      location: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Seattle, WA",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 18,
        fontColor: "#7f96ac",
        fontWeight: 700,
        textTransform: "normal",
      },
      description: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "A quiet urban studio for yoga, breathwork, and recovery sessions, with a pace that feels calm from the first step in.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#5f666d",
        fontWeight: 400,
        textTransform: "normal",
      },
      primaryCta: {
        label: "Book a class",
        link: "#",
      },
      secondaryCta: {
        label: "See today's schedule",
        link: "#",
      },
    },
    render: WellnessRetreatHeroSectionComponent,
  };
