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

export type WellnessRetreatPromoSectionProps = {
  backgroundImage: YextEntityField<
    ImageType | ComplexImageType | TranslatableAssetImage
  >;
  heading: StyledTextProps;
  description: StyledTextProps;
  cta: LinkItem;
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

const WellnessRetreatPromoSectionFields: Fields<WellnessRetreatPromoSectionProps> =
  {
    backgroundImage: YextEntityFieldSelector<
      any,
      ImageType | ComplexImageType | TranslatableAssetImage
    >({
      label: "Background Image",
      filter: {
        types: ["type.image"],
      },
    }),
    heading: createStyledTextField("Heading"),
    description: createStyledTextField("Description"),
    cta: {
      label: "Call To Action",
      type: "object",
      objectFields: {
        label: { label: "Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
    },
  };

export const WellnessRetreatPromoSectionComponent: PuckComponent<
  WellnessRetreatPromoSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedBackgroundImage = resolveComponentData(
    props.backgroundImage,
    locale,
    streamDocument,
  );
  const resolvedHeading = resolveTextValue(
    props.heading.text,
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
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="relative min-h-[360px] overflow-hidden rounded-[4px] bg-[#101418]">
          {resolvedBackgroundImage ? (
            <Image
              image={resolvedBackgroundImage}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <div className="relative z-[1] m-6 grid max-w-[500px] gap-6 rounded-[4px] bg-white px-8 py-9 md:m-8 md:px-10 md:py-10">
            <h2
              className="m-0 leading-[0.94] tracking-[-0.03em]"
              style={{
                ...getTextStyle(props.heading),
                fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
              }}
            >
              {resolvedHeading}
            </h2>
            <p
              className="m-0 font-['Inter',sans-serif] leading-[1.55]"
              style={getTextStyle(props.description)}
            >
              {resolvedDescription}
            </p>
            <Link
              cta={{ link: props.cta.link, linkType: "URL" }}
              className="inline-flex min-h-[46px] w-full items-center justify-center border border-[#101418] bg-white px-[18px] font-['Inter',sans-serif] text-base font-semibold text-[#101418] no-underline"
            >
              {props.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export const WellnessRetreatPromoSection: ComponentConfig<WellnessRetreatPromoSectionProps> =
  {
    label: "Wellness Retreat Promo Section",
    fields: WellnessRetreatPromoSectionFields,
    defaultProps: {
      backgroundImage: {
        field: "",
        constantValue: {
          url: "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=1600&q=80",
          width: 1600,
          height: 900,
        },
        constantValueEnabled: true,
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "Evening reset classes with slower pacing and longer holds",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 38,
        fontColor: "#101418",
        fontWeight: 600,
        textTransform: "normal",
      },
      description: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "Weeknight sessions are designed for people coming straight from work who want to unwind without stepping into a fast, high-energy room.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#101418",
        fontWeight: 400,
        textTransform: "normal",
      },
      cta: {
        label: "See evening classes",
        link: "#",
      },
    },
    render: WellnessRetreatPromoSectionComponent,
  };
