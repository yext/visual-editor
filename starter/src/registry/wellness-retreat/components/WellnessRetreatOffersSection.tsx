import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import type { CSSProperties } from "react";
import {
  resolveComponentData,
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

type OfferItem = {
  title: StyledTextProps;
  description: StyledTextProps;
};

export type WellnessRetreatOffersSectionProps = {
  heading: StyledTextProps;
  offers: OfferItem[];
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

const createStyledTextDefault = (
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

const WellnessRetreatOffersSectionFields: Fields<WellnessRetreatOffersSectionProps> =
  {
    heading: createStyledTextField("Heading"),
    offers: {
      label: "Offers",
      type: "array",
      arrayFields: {
        title: createStyledTextField("Title"),
        description: createStyledTextField("Description"),
      },
      defaultItemProps: {
        title: createStyledTextDefault("Offer title", 17, "#101418", 700),
        description: createStyledTextDefault(
          "Offer description",
          16,
          "#101418",
          400,
        ),
      },
      getItemSummary: () => "Offer",
    },
  };

export const WellnessRetreatOffersSectionComponent: PuckComponent<
  WellnessRetreatOffersSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading = resolveTextValue(
    props.heading.text,
    locale,
    streamDocument,
  );

  return (
    <section className="w-full bg-white py-6">
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="mb-6">
          <h2
            className="m-0 leading-[0.94] tracking-[-0.03em]"
            style={{
              ...getTextStyle(props.heading),
              fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
            }}
          >
            {resolvedHeading}
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {props.offers.map((item, index) => {
            const resolvedTitle = resolveTextValue(
              item.title.text,
              locale,
              streamDocument,
            );
            const resolvedDescription = resolveTextValue(
              item.description.text,
              locale,
              streamDocument,
            );

            return (
              <article
                key={`${resolvedTitle}-${index}`}
                className="grid gap-3 border-t border-[#101418] pt-4"
              >
                <h3
                  className="m-0 font-['Inter',sans-serif] leading-[1.55]"
                  style={getTextStyle(item.title)}
                >
                  {resolvedTitle}
                </h3>
                <p
                  className="m-0 font-['Inter',sans-serif] leading-[1.55]"
                  style={getTextStyle(item.description)}
                >
                  {resolvedDescription}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const WellnessRetreatOffersSection: ComponentConfig<WellnessRetreatOffersSectionProps> =
  {
    label: "Wellness Retreat Offers Section",
    fields: WellnessRetreatOffersSectionFields,
    defaultProps: {
      heading: createStyledTextDefault("Ways to begin", 38, "#101418", 600),
      offers: [
        {
          title: createStyledTextDefault("Intro month", 17, "#101418", 700),
          description: createStyledTextDefault(
            "Start with a flexible month of classes so you can try morning, lunch, and evening times before committing.",
            16,
            "#101418",
            400,
          ),
        },
        {
          title: createStyledTextDefault(
            "Small group recovery",
            17,
            "#101418",
            700,
          ),
          description: createStyledTextDefault(
            "Gentler sessions for mobility, breathwork, and decompression after high-stress weeks or travel.",
            16,
            "#101418",
            400,
          ),
        },
        {
          title: createStyledTextDefault(
            "Private guidance",
            17,
            "#101418",
            700,
          ),
          description: createStyledTextDefault(
            "One-on-one sessions for people who want a quieter beginning before joining group classes.",
            16,
            "#101418",
            400,
          ),
        },
      ],
    },
    render: WellnessRetreatOffersSectionComponent,
  };
