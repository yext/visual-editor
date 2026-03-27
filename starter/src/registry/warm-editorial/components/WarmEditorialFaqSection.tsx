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

export type WarmEditorialFaqSectionProps = {
  heading: StyledTextProps;
  faqs: FaqItem[];
};

const createStyledTextFields = (label: string) =>
  ({
    label,
    type: "object",
    objectFields: {
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
    },
  }) as const;

const createStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
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
  textTransform: "normal",
});

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const WarmEditorialFaqSectionFields: Fields<WarmEditorialFaqSectionProps> = {
  heading: createStyledTextFields("Heading"),
  faqs: {
    label: "FAQs",
    type: "array",
    getItemSummary: () => "FAQ",
    defaultItemProps: {
      question: createStyledTextDefault("Question", 16, "#2b211d", 700),
      answer: createStyledTextDefault("Answer", 16, "#726156", 500),
    },
    arrayFields: {
      question: createStyledTextFields("Question"),
      answer: createStyledTextFields("Answer"),
    },
  },
};

export const WarmEditorialFaqSectionComponent: PuckComponent<
  WarmEditorialFaqSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  return (
    <section className="w-full bg-[#fffaf3] px-6 py-6">
      <div className="mx-auto max-w-[1024px]">
        <div className="mb-6">
          <h2
            className="m-0"
            style={{
              fontFamily: '"Newsreader", Georgia, serif',
              fontSize: `${props.heading.fontSize}px`,
              lineHeight: 0.98,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
            }}
          >
            {resolveStyledText(props.heading, locale, streamDocument)}
          </h2>
        </div>
        <div className="border-b border-[#eadbcb]">
          {props.faqs.map((item, index) => (
            <details
              key={`${index}-${item.question.fontSize}`}
              className="group border-t border-[#eadbcb] py-5"
            >
              <summary
                className="flex cursor-pointer list-none justify-between gap-4"
                style={{
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                  fontSize: `${item.question.fontSize}px`,
                  color: item.question.fontColor,
                  fontWeight: item.question.fontWeight,
                  textTransform: toCssTextTransform(
                    item.question.textTransform,
                  ),
                  lineHeight: 1.5,
                }}
              >
                <span>
                  {resolveStyledText(item.question, locale, streamDocument)}
                </span>
                <span className="inline group-open:hidden">+</span>
                <span className="hidden group-open:inline">−</span>
              </summary>
              <p
                className="mt-3 mb-0"
                style={{
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                  fontSize: `${item.answer.fontSize}px`,
                  color: item.answer.fontColor,
                  fontWeight: item.answer.fontWeight,
                  textTransform: toCssTextTransform(item.answer.textTransform),
                  lineHeight: 1.5,
                }}
              >
                {resolveStyledText(item.answer, locale, streamDocument)}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export const WarmEditorialFaqSection: ComponentConfig<WarmEditorialFaqSectionProps> =
  {
    label: "Warm Editorial FAQ Section",
    fields: WarmEditorialFaqSectionFields,
    defaultProps: {
      heading: createStyledTextDefault("FAQs", 34, "#2b211d", 700),
      faqs: [
        {
          question: createStyledTextDefault(
            "Do you accept same-day preorders?",
            16,
            "#2b211d",
            700,
          ),
          answer: createStyledTextDefault(
            "Yes for select pastry boxes and whole-item pickups, depending on availability and the current day’s production window.",
            16,
            "#726156",
            500,
          ),
        },
        {
          question: createStyledTextDefault(
            "Do you have seating?",
            16,
            "#2b211d",
            700,
          ),
          answer: createStyledTextDefault(
            "The bakery is designed for quick neighborhood visits, with a small amount of seating and a stronger grab-and-go rhythm.",
            16,
            "#726156",
            500,
          ),
        },
        {
          question: createStyledTextDefault(
            "Are seasonal items posted online?",
            16,
            "#2b211d",
            700,
          ),
          answer: createStyledTextDefault(
            "Yes. Rotating items appear with the current menu, pickup timing, and any preorder notes that apply.",
            16,
            "#726156",
            500,
          ),
        },
      ],
    },
    render: WarmEditorialFaqSectionComponent,
  };
