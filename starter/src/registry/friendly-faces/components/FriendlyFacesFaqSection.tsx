import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";

type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type TextTransform = "normal" | "uppercase" | "lowercase" | "capitalize";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: FontWeight;
  textTransform: TextTransform;
};

type FaqItemProps = {
  question: StyledTextProps;
  answer: StyledTextProps;
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

export type FriendlyFacesFaqSectionProps = {
  heading: StyledTextProps;
  items: FaqItemProps[];
};

const FriendlyFacesFaqSectionFields: Fields<FriendlyFacesFaqSectionProps> = {
  heading: buildStyledTextFields("Heading"),
  items: {
    label: "Items",
    type: "array",
    arrayFields: {
      question: buildStyledTextFields("Question"),
      answer: buildStyledTextFields("Answer"),
    },
    defaultItemProps: {
      question: buildStyledTextDefault("Question", 16, "#17313d", 800),
      answer: buildStyledTextDefault("Answer", 16, "#5f7380", 400),
    },
    getItemSummary: () => "FAQ Item",
  },
};

export const FriendlyFacesFaqSectionComponent: PuckComponent<
  FriendlyFacesFaqSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto w-full max-w-[1100px] px-6 pb-6 pt-14">
      <div className="mb-6">
        <h2
          className="m-0"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: `${props.heading.fontSize}px`,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: getTextTransformStyle(props.heading.textTransform),
          }}
        >
          {resolvedHeading}
        </h2>
      </div>
      <div className="grid gap-4">
        {props.items.map((item, index) => {
          const resolvedQuestion =
            resolveComponentData(item.question.text, locale, streamDocument) ||
            "";
          const resolvedAnswer =
            resolveComponentData(item.answer.text, locale, streamDocument) ||
            "";

          return (
            <details
              key={`${resolvedQuestion}-${index}`}
              className="group rounded-[18px] border border-[#d5e8ea] bg-white p-5"
            >
              <summary className="flex cursor-pointer list-none justify-between gap-4 font-['Nunito','Open_Sans',sans-serif] text-base font-extrabold text-[#17313d] marker:hidden">
                <span>{resolvedQuestion}</span>
                <span aria-hidden="true" className="group-open:hidden">
                  +
                </span>
                <span aria-hidden="true" className="hidden group-open:inline">
                  -
                </span>
              </summary>
              <p
                className="m-0 mt-3 font-['Nunito','Open_Sans',sans-serif] leading-[1.6]"
                style={{
                  fontSize: `${item.answer.fontSize}px`,
                  color: item.answer.fontColor,
                  fontWeight: item.answer.fontWeight,
                  textTransform: getTextTransformStyle(
                    item.answer.textTransform,
                  ),
                }}
              >
                {resolvedAnswer}
              </p>
            </details>
          );
        })}
      </div>
    </section>
  );
};

export const FriendlyFacesFaqSection: ComponentConfig<FriendlyFacesFaqSectionProps> =
  {
    label: "Friendly Faces FAQ Section",
    fields: FriendlyFacesFaqSectionFields,
    defaultProps: {
      heading: buildStyledTextDefault(
        "Pediatric visit FAQs",
        38,
        "#17313d",
        700,
      ),
      items: [
        {
          question: buildStyledTextDefault(
            "Do you offer same-day appointments for sick children?",
            16,
            "#17313d",
            800,
          ),
          answer: buildStyledTextDefault(
            "Yes. Families can call in the morning for same-day scheduling when clinically appropriate.",
            16,
            "#5f7380",
            400,
          ),
        },
        {
          question: buildStyledTextDefault(
            "Can I complete forms before our first appointment?",
            16,
            "#17313d",
            800,
          ),
          answer: buildStyledTextDefault(
            "Yes. New-patient paperwork and intake details can be completed before your visit to keep check-in simple.",
            16,
            "#5f7380",
            400,
          ),
        },
        {
          question: buildStyledTextDefault(
            "Do teens have private conversation time with clinicians?",
            16,
            "#17313d",
            800,
          ),
          answer: buildStyledTextDefault(
            "Yes. When age-appropriate, part of the visit can be structured to support more independent healthcare conversations.",
            16,
            "#5f7380",
            400,
          ),
        },
      ],
    },
    render: FriendlyFacesFaqSectionComponent,
  };
