import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
  useDocument,
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

export type ModernEraFaqSectionProps = {
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
] as const;

const textTransformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
] as const;

const styledTextFields = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    text: YextEntityFieldSelector<any, TranslatableString>({
      label: "Text",
      filter: { types: ["type.string"] },
    }),
    fontSize: { label: "Font Size", type: "number" as const },
    fontColor: { label: "Font Color", type: "text" as const },
    fontWeight: {
      label: "Font Weight",
      type: "select" as const,
      options: [...fontWeightOptions],
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: [...textTransformOptions],
    },
  },
});

const styledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
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

const resolveText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const cssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const ModernEraFaqSectionFields: Fields<ModernEraFaqSectionProps> = {
  heading: styledTextFields("Heading"),
  items: {
    label: "Items",
    type: "array",
    getItemSummary: (_item, index) => `FAQ ${(index ?? 0) + 1}`,
    defaultItemProps: {
      question: styledTextDefault("Question", 16, "#1b2430", 800),
      answer: styledTextDefault("Answer", 16, "#5d6b7b", 400),
    },
    arrayFields: {
      question: styledTextFields("Question"),
      answer: styledTextFields("Answer"),
    },
  },
};

export const ModernEraFaqSectionComponent: PuckComponent<
  ModernEraFaqSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveText(props.heading, locale, streamDocument);

  return (
    <section className="mx-auto w-full max-w-[1120px] px-6 pb-6 pt-14">
      <div className="mb-6">
        <h2
          className="m-0 text-[#19324d]"
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: `${props.heading.fontSize}px`,
            lineHeight: 0.98,
            letterSpacing: "-0.03em",
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: cssTextTransform(props.heading.textTransform),
          }}
        >
          {heading}
        </h2>
      </div>
      <div className="grid gap-4">
        {props.items.map((item, index) => (
          <details
            key={index}
            className="rounded-[18px] border border-[#d7e2ec] bg-white p-5"
            style={{ fontFamily: '"Manrope", "Open Sans", sans-serif' }}
          >
            <summary
              className="flex cursor-pointer list-none justify-between gap-4 font-extrabold"
              style={{
                fontSize: `${item.question.fontSize}px`,
                color: item.question.fontColor,
                fontWeight: item.question.fontWeight,
                textTransform: cssTextTransform(item.question.textTransform),
              }}
            >
              <span>{resolveText(item.question, locale, streamDocument)}</span>
              <span aria-hidden="true">+</span>
            </summary>
            <p
              className="mt-3 max-w-[70ch]"
              style={{
                fontSize: `${item.answer.fontSize}px`,
                color: item.answer.fontColor,
                fontWeight: item.answer.fontWeight,
                textTransform: cssTextTransform(item.answer.textTransform),
                lineHeight: 1.55,
              }}
            >
              {resolveText(item.answer, locale, streamDocument)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
};

export const ModernEraFaqSection: ComponentConfig<ModernEraFaqSectionProps> = {
  label: "Modern Era FAQ Section",
  fields: ModernEraFaqSectionFields,
  defaultProps: {
    heading: styledTextDefault("Retirement planning FAQs", 42, "#19324d", 400),
    items: [
      {
        question: styledTextDefault(
          "Do I need a large portfolio before meeting with an advisor?",
          16,
          "#1b2430",
          800,
        ),
        answer: styledTextDefault(
          "No. This branch works with people who are just getting organized as well as clients who are already close to retirement.",
          16,
          "#5d6b7b",
          400,
        ),
      },
      {
        question: styledTextDefault(
          "Can I bring accounts from other institutions to the first meeting?",
          16,
          "#1b2430",
          800,
        ),
        answer: styledTextDefault(
          "Yes. Bring statements or a simple list of balances and we can use that to frame the first conversation.",
          16,
          "#5d6b7b",
          400,
        ),
      },
      {
        question: styledTextDefault(
          "Are evening retirement appointments available?",
          16,
          "#1b2430",
          800,
        ),
        answer: styledTextDefault(
          "Yes. A limited set of evening appointments and workshop slots are available during the week.",
          16,
          "#5d6b7b",
          400,
        ),
      },
    ],
  },
  render: ModernEraFaqSectionComponent,
};
