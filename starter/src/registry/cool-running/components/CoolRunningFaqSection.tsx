import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
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
  isOpen: boolean;
};

export type CoolRunningFaqSectionProps = {
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
];

const textTransformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
];

const createStyledTextObjectFields = () => ({
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
});

const createStyledTextField = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: createStyledTextObjectFields(),
});

const CoolRunningFaqSectionFields: Fields<CoolRunningFaqSectionProps> = {
  heading: createStyledTextField("Heading"),
  faqs: {
    label: "Frequently Asked Questions",
    type: "array",
    arrayFields: {
      question: {
        label: "Question",
        type: "object",
        objectFields: createStyledTextObjectFields(),
      },
      answer: {
        label: "Answer",
        type: "object",
        objectFields: createStyledTextObjectFields(),
      },
      isOpen: {
        label: "Is Open",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
    defaultItemProps: {
      question: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Frequently asked question",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#ffffff",
        fontWeight: 700,
        textTransform: "normal",
      },
      answer: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Frequently asked answer",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#ffffff",
        fontWeight: 400,
        textTransform: "normal",
      },
      isOpen: false,
    },
    getItemSummary: () => "FAQ",
  },
};

const resolveText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

const copyStyle = (value: StyledTextProps) => ({
  fontFamily: '"IBM Plex Sans", "Open Sans", sans-serif',
  fontSize: `${value.fontSize}px`,
  color: value.fontColor,
  fontWeight: value.fontWeight,
  textTransform: toCssTextTransform(value.textTransform),
  lineHeight: 1.5,
});

export const CoolRunningFaqSectionComponent: PuckComponent<
  CoolRunningFaqSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveText(props.heading, locale, streamDocument);

  return (
    <section className="w-full border border-[#0a3657] bg-[#0e446d] py-6 text-white">
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="mb-6">
          <h2
            className="m-0"
            style={{
              fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
            }}
          >
            {heading}
          </h2>
        </div>
        <div className="grid gap-4">
          {props.faqs.map((item, index) => {
            const question = resolveText(item.question, locale, streamDocument);
            const answer = resolveText(item.answer, locale, streamDocument);

            return (
              <details
                key={`${question}-${index}`}
                className="rounded-[6px] border border-white/20 bg-white/10 p-5"
                open={item.isOpen}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span style={copyStyle(item.question)}>{question}</span>
                  <span
                    className="text-[16px] font-bold leading-none text-white"
                    aria-hidden="true"
                  >
                    {item.isOpen ? "−" : "+"}
                  </span>
                </summary>
                <p
                  className="mb-0 mt-3"
                  style={{
                    ...copyStyle(item.answer),
                    color: "rgba(255,255,255,0.88)",
                  }}
                >
                  {answer}
                </p>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const CoolRunningFaqSection: ComponentConfig<CoolRunningFaqSectionProps> =
  {
    label: "Cool Running Faq Section",
    fields: CoolRunningFaqSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "ATM FAQs",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 32,
        fontColor: "#ffffff",
        fontWeight: 700,
        textTransform: "normal",
      },
      faqs: [
        {
          question: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Is this ATM open at all hours?",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 700,
            textTransform: "normal",
          },
          answer: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Yes. The machine is available 24 hours a day, including overnight access.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 400,
            textTransform: "normal",
          },
          isOpen: false,
        },
        {
          question: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Can I make a deposit here?",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 700,
            textTransform: "normal",
          },
          answer: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Yes, deposit support is available for eligible cards and account types.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 400,
            textTransform: "normal",
          },
          isOpen: false,
        },
        {
          question: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "What if the machine cannot complete my transaction?",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 700,
            textTransform: "normal",
          },
          answer: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Use the listed support number or visit a nearby branch for immediate assistance.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 400,
            textTransform: "normal",
          },
          isOpen: false,
        },
      ],
    },
    render: CoolRunningFaqSectionComponent,
  };
