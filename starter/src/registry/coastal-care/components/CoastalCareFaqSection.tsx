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

type FaqItemProps = {
  question: StyledTextProps;
  answer: StyledTextProps;
};

export type CoastalCareFaqSectionProps = {
  sectionHeading: StyledTextProps;
  faqs: FaqItemProps[];
};

const styledTextFields = (label: string) => ({
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
      type: "select" as const,
      options: [
        { label: "Normal", value: "normal" },
        { label: "Uppercase", value: "uppercase" },
        { label: "Lowercase", value: "lowercase" },
        { label: "Capitalize", value: "capitalize" },
      ],
    },
  },
});

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const CoastalCareFaqSectionFields: Fields<CoastalCareFaqSectionProps> = {
  sectionHeading: styledTextFields("Section Heading"),
  faqs: {
    label: "Frequently Asked Questions",
    type: "array",
    arrayFields: {
      question: styledTextFields("Question"),
      answer: styledTextFields("Answer"),
    },
    defaultItemProps: {
      question: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "FAQ question?",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#183347",
        fontWeight: 700,
        textTransform: "normal",
      },
      answer: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "FAQ answer.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#5f7684",
        fontWeight: 400,
        textTransform: "normal",
      },
    },
    getItemSummary: (item: any) =>
      item?.question?.text?.constantValue?.defaultValue || "FAQ",
  },
};

export const CoastalCareFaqSectionComponent: PuckComponent<
  CoastalCareFaqSectionProps
> = ({ sectionHeading, faqs }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedSectionHeading =
    resolveComponentData(sectionHeading.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto w-full max-w-[1024px] px-6 py-6">
      <div className="mb-6">
        <h2
          className="m-0 font-['DM_Serif_Display','Times_New_Roman',serif] leading-none"
          style={{
            fontSize: `${sectionHeading.fontSize}px`,
            color: sectionHeading.fontColor,
            fontWeight: sectionHeading.fontWeight,
            textTransform: toCssTextTransform(sectionHeading.textTransform),
          }}
        >
          {resolvedSectionHeading}
        </h2>
      </div>
      <div className="border-b border-[#d7e3e7]">
        {faqs.map((faq, index) => {
          const resolvedQuestion =
            resolveComponentData(faq.question.text, locale, streamDocument) ||
            "";
          const resolvedAnswer =
            resolveComponentData(faq.answer.text, locale, streamDocument) || "";

          return (
            <details
              key={`${resolvedQuestion}-${index}`}
              className="group border-t border-[#d7e3e7] py-5"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-['Public_Sans','Open_Sans',sans-serif]">
                <span
                  style={{
                    fontSize: `${faq.question.fontSize}px`,
                    color: faq.question.fontColor,
                    fontWeight: faq.question.fontWeight,
                    textTransform: toCssTextTransform(
                      faq.question.textTransform,
                    ),
                  }}
                >
                  {resolvedQuestion}
                </span>
                <span
                  aria-hidden="true"
                  className="relative mt-1 block h-4 w-4"
                >
                  <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-[#183347]" />
                  <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-[#183347] group-open:hidden" />
                </span>
              </summary>
              <p
                className="mt-3 font-['Public_Sans','Open_Sans',sans-serif] leading-[1.55]"
                style={{
                  fontSize: `${faq.answer.fontSize}px`,
                  color: faq.answer.fontColor,
                  fontWeight: faq.answer.fontWeight,
                  textTransform: toCssTextTransform(faq.answer.textTransform),
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

export const CoastalCareFaqSection: ComponentConfig<CoastalCareFaqSectionProps> =
  {
    label: "Coastal Care Faq Section",
    fields: CoastalCareFaqSectionFields,
    defaultProps: {
      sectionHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "FAQs",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 35,
        fontColor: "#183347",
        fontWeight: 400,
        textTransform: "normal",
      },
      faqs: [
        {
          question: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Do you accept new clients?",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 700,
            textTransform: "normal",
          },
          answer: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Yes. New client appointments are kept available throughout the month for preventive and ongoing care.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#5f7684",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          question: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Can I book a sick visit quickly?",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 700,
            textTransform: "normal",
          },
          answer: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "The clinic keeps some same-week appointment capacity for pets who need to be seen sooner.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#5f7684",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          question: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "What should I bring to the first visit?",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 700,
            textTransform: "normal",
          },
          answer: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Bring any recent records, medication details, and a short history of symptoms or behavior changes if relevant.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#5f7684",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
      ],
    },
    render: CoastalCareFaqSectionComponent,
  };
