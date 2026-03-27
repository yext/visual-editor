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

export type RuggedUtilityFaqSectionProps = {
  heading: StyledTextProps;
  faqs: FaqItem[];
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
};

const RuggedUtilityFaqSectionFields: Fields<RuggedUtilityFaqSectionProps> = {
  heading: {
    label: "Heading",
    type: "object",
    objectFields: styledTextObjectFields,
  },
  faqs: {
    label: "Faqs",
    type: "array",
    getItemSummary: (item: FaqItem) =>
      ((item.question?.text as any)?.constantValue?.defaultValue as string) ||
      "Faq Item",
    defaultItemProps: {
      question: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Question",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#181715",
        fontWeight: 800,
        textTransform: "normal",
      },
      answer: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Answer",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 15,
        fontColor: "#6d665b",
        fontWeight: 400,
        textTransform: "normal",
      },
    },
    arrayFields: {
      question: {
        label: "Question",
        type: "object",
        objectFields: styledTextObjectFields,
      },
      answer: {
        label: "Answer",
        type: "object",
        objectFields: styledTextObjectFields,
      },
    },
  },
};

export const RuggedUtilityFaqSectionComponent: PuckComponent<
  RuggedUtilityFaqSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto my-3 w-full max-w-[1024px] px-6">
      <div className="mb-6">
        <h2
          className="m-0"
          style={{
            fontFamily: '"Archivo Black", "Arial Black", sans-serif',
            fontSize: `${props.heading.fontSize}px`,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform:
              props.heading.textTransform === "normal"
                ? "none"
                : props.heading.textTransform,
          }}
        >
          {heading}
        </h2>
      </div>
      <div className="grid gap-4">
        {props.faqs.map((item, index) => {
          const question =
            resolveComponentData(item.question.text, locale, streamDocument) ||
            "";
          const answer =
            resolveComponentData(item.answer.text, locale, streamDocument) ||
            "";

          return (
            <details
              key={`${question}-${index}`}
              className="group rounded-[2px] border border-[#d3c8b6] bg-[#fffdf8] p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-[#181715] [&::-webkit-details-marker]:hidden">
                <span
                  style={{
                    fontFamily: '"Public Sans", "Open Sans", sans-serif',
                    fontSize: `${item.question.fontSize}px`,
                    lineHeight: 1.5,
                    color: item.question.fontColor,
                    fontWeight: item.question.fontWeight,
                    textTransform:
                      item.question.textTransform === "normal"
                        ? "none"
                        : item.question.textTransform,
                  }}
                >
                  {question}
                </span>
                <span className="text-lg leading-none group-open:hidden">
                  +
                </span>
                <span className="hidden text-lg leading-none group-open:inline">
                  −
                </span>
              </summary>
              <p
                className="mb-0 mt-3"
                style={{
                  fontFamily: '"Public Sans", "Open Sans", sans-serif',
                  fontSize: `${item.answer.fontSize}px`,
                  lineHeight: 1.5,
                  color: item.answer.fontColor,
                  fontWeight: item.answer.fontWeight,
                  textTransform:
                    item.answer.textTransform === "normal"
                      ? "none"
                      : item.answer.textTransform,
                }}
              >
                {answer}
              </p>
            </details>
          );
        })}
      </div>
    </section>
  );
};

export const RuggedUtilityFaqSection: ComponentConfig<RuggedUtilityFaqSectionProps> =
  {
    label: "Rugged Utility Faq Section",
    fields: RuggedUtilityFaqSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Store FAQs",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 36,
        fontColor: "#181715",
        fontWeight: 400,
        textTransform: "normal",
      },
      faqs: [
        {
          question: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Do you offer pack fittings in store?",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#181715",
            fontWeight: 800,
            textTransform: "normal",
          },
          answer: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Yes. Staff can help fit daypacks and overnight packs during store hours, with longer appointments on weekday evenings.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 15,
            fontColor: "#6d665b",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          question: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Can I bring in gear for basic repair?",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#181715",
            fontWeight: 800,
            textTransform: "normal",
          },
          answer: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Yes. Zipper, buckle, and binding assessments start at the service desk, and the team can explain what can be fixed in house.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 15,
            fontColor: "#6d665b",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          question: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Do you stock seasonal snow gear year-round?",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#181715",
            fontWeight: 800,
            textTransform: "normal",
          },
          answer: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Snow hardware is most complete during the winter season, but essentials and outerwear remain available longer depending on demand.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 15,
            fontColor: "#6d665b",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
      ],
    },
    render: RuggedUtilityFaqSectionComponent,
  };
