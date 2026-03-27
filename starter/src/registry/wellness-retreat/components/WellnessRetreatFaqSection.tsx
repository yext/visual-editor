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

type FaqItem = {
  question: StyledTextProps;
  answer: StyledTextProps;
};

export type WellnessRetreatFaqSectionProps = {
  heading: StyledTextProps;
  items: FaqItem[];
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

const WellnessRetreatFaqSectionFields: Fields<WellnessRetreatFaqSectionProps> =
  {
    heading: createStyledTextField("Heading"),
    items: {
      label: "Items",
      type: "array",
      arrayFields: {
        question: createStyledTextField("Question"),
        answer: createStyledTextField("Answer"),
      },
      defaultItemProps: {
        question: createStyledTextDefault("Question", 16, "#101418", 700),
        answer: createStyledTextDefault("Answer", 16, "#5f666d", 400),
      },
      getItemSummary: () => "FAQ Item",
    },
  };

export const WellnessRetreatFaqSectionComponent: PuckComponent<
  WellnessRetreatFaqSectionProps
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
        <div className="w-full border-b border-[#d9dde1]">
          {props.items.map((item, index) => {
            const resolvedQuestion = resolveTextValue(
              item.question.text,
              locale,
              streamDocument,
            );
            const resolvedAnswer = resolveTextValue(
              item.answer.text,
              locale,
              streamDocument,
            );

            return (
              <details
                key={`${resolvedQuestion}-${index}`}
                className="w-full border-t border-[#d9dde1] py-5"
              >
                <summary className="flex w-full cursor-pointer list-none justify-between gap-4 font-['Inter',sans-serif] leading-[1.55] marker:hidden">
                  <span style={getTextStyle(item.question)}>
                    {resolvedQuestion}
                  </span>
                  <span className="text-[#101418]">+</span>
                </summary>
                <p
                  className="m-0 mt-3 w-full font-['Inter',sans-serif] leading-[1.55]"
                  style={getTextStyle(item.answer)}
                >
                  {resolvedAnswer}
                </p>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const WellnessRetreatFaqSection: ComponentConfig<WellnessRetreatFaqSectionProps> =
  {
    label: "Wellness Retreat Faq Section",
    fields: WellnessRetreatFaqSectionFields,
    defaultProps: {
      heading: createStyledTextDefault("Studio FAQs", 38, "#101418", 600),
      items: [
        {
          question: createStyledTextDefault(
            "Is the studio beginner friendly?",
            16,
            "#101418",
            700,
          ),
          answer: createStyledTextDefault(
            "Yes. Classes are clearly labeled by pace and intensity, and front desk staff can help you choose a calm starting point.",
            16,
            "#5f666d",
            400,
          ),
        },
        {
          question: createStyledTextDefault(
            "Do I need to bring my own mat?",
            16,
            "#101418",
            700,
          ),
          answer: createStyledTextDefault(
            "No. Mats and basic props are available at the studio, though members are welcome to bring their own setup.",
            16,
            "#5f666d",
            400,
          ),
        },
        {
          question: createStyledTextDefault(
            "Can I book a first class online?",
            16,
            "#101418",
            700,
          ),
          answer: createStyledTextDefault(
            "Yes. The schedule supports online booking, and confirmation emails include arrival notes and studio etiquette details.",
            16,
            "#5f666d",
            400,
          ),
        },
      ],
    },
    render: WellnessRetreatFaqSectionComponent,
  };
