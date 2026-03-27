import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";

const SOURCE_SANS_STACK = "'Source Sans 3', 'Open Sans', sans-serif";
const LIBRE_STACK = "'Libre Baskerville', Georgia, serif";

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

export type FormalFinderFaqSectionProps = {
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

function createStyledTextField(label: string) {
  return {
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
        options: fontWeightOptions,
      },
      textTransform: {
        label: "Text Transform",
        type: "select" as const,
        options: textTransformOptions,
      },
    },
  };
}

function createStyledTextDefault(
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
): StyledTextProps {
  return {
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
  };
}

function resolveStyledText(
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) {
  return resolveComponentData(value.text, locale, streamDocument) || "";
}

function toCssTextTransform(value: StyledTextProps["textTransform"]) {
  return value === "normal" ? undefined : value;
}

const FormalFinderFaqSectionFields: Fields<FormalFinderFaqSectionProps> = {
  heading: createStyledTextField("Heading"),
  items: {
    label: "Items",
    type: "array",
    getItemSummary: () => "FAQ Item",
    defaultItemProps: {
      question: createStyledTextDefault("Question", 16, "#1a2230", 700),
      answer: createStyledTextDefault("Answer", 16, "#6a7381", 400),
    },
    arrayFields: {
      question: createStyledTextField("Question"),
      answer: createStyledTextField("Answer"),
    },
  },
};

export const FormalFinderFaqSectionComponent: PuckComponent<
  FormalFinderFaqSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveStyledText(props.heading, locale, streamDocument);

  return (
    <section
      className="mx-auto mt-3 mb-3 w-full max-w-[1024px] px-6"
      style={{ fontFamily: SOURCE_SANS_STACK }}
    >
      <div className="mb-6">
        <h2
          className="m-0"
          style={{
            fontFamily: LIBRE_STACK,
            fontSize: `${props.heading.fontSize}px`,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: toCssTextTransform(props.heading.textTransform),
          }}
        >
          {heading}
        </h2>
      </div>
      <div className="border-b border-[#dde1e7]">
        {props.items.map((item, index) => {
          const question = resolveStyledText(
            item.question,
            locale,
            streamDocument,
          );
          const answer = resolveStyledText(item.answer, locale, streamDocument);
          return (
            <details
              key={`${question}-${index}`}
              className="group border-t border-[#dde1e7] py-5"
            >
              <summary
                className="flex cursor-pointer list-none items-start justify-between gap-4"
                style={{
                  fontFamily: SOURCE_SANS_STACK,
                  fontSize: `${item.question.fontSize}px`,
                  lineHeight: 1.55,
                  color: item.question.fontColor,
                  fontWeight: item.question.fontWeight,
                  textTransform: toCssTextTransform(
                    item.question.textTransform,
                  ),
                }}
              >
                <span>{question}</span>
                <span className="text-xl leading-none text-[#1a2230] group-open:hidden">
                  +
                </span>
                <span className="hidden text-xl leading-none text-[#1a2230] group-open:inline">
                  −
                </span>
              </summary>
              <p
                className="mt-3 mb-0 pr-8"
                style={{
                  fontFamily: SOURCE_SANS_STACK,
                  fontSize: `${item.answer.fontSize}px`,
                  lineHeight: 1.55,
                  color: item.answer.fontColor,
                  fontWeight: item.answer.fontWeight,
                  textTransform: toCssTextTransform(item.answer.textTransform),
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

export const FormalFinderFaqSection: ComponentConfig<FormalFinderFaqSectionProps> =
  {
    label: "Formal Finder FAQ Section",
    fields: FormalFinderFaqSectionFields,
    defaultProps: {
      heading: createStyledTextDefault("Common questions", 32, "#1a2230", 700),
      items: [
        {
          question: createStyledTextDefault(
            "Do you work with both individuals and small businesses?",
            16,
            "#1a2230",
            700,
          ),
          answer: createStyledTextDefault(
            "Yes. The office supports both households and owner-operated businesses.",
            16,
            "#6a7381",
            400,
          ),
        },
        {
          question: createStyledTextDefault(
            "Can I schedule a planning conversation before tax season?",
            16,
            "#1a2230",
            700,
          ),
          answer: createStyledTextDefault(
            "Yes. Clients can book planning meetings throughout the year rather than waiting for filing season.",
            16,
            "#6a7381",
            400,
          ),
        },
        {
          question: createStyledTextDefault(
            "Do you offer recurring accounting support?",
            16,
            "#1a2230",
            700,
          ),
          answer: createStyledTextDefault(
            "Yes. Ongoing reporting and review options are available for clients who need year-round support.",
            16,
            "#6a7381",
            400,
          ),
        },
      ],
    },
    render: FormalFinderFaqSectionComponent,
  };
