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

type ReviewQuoteItem = {
  quote: StyledTextProps;
};

export type FormalFinderReviewsSectionProps = {
  heading: StyledTextProps;
  summaryScore: StyledTextProps;
  summaryBody: StyledTextProps;
  quotes: ReviewQuoteItem[];
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

const FormalFinderReviewsSectionFields: Fields<FormalFinderReviewsSectionProps> =
  {
    heading: createStyledTextField("Heading"),
    summaryScore: createStyledTextField("Summary Score"),
    summaryBody: createStyledTextField("Summary Body"),
    quotes: {
      label: "Quotes",
      type: "array",
      getItemSummary: () => "Review Quote",
      defaultItemProps: {
        quote: createStyledTextDefault("Quote", 16, "#1a2230", 400),
      },
      arrayFields: {
        quote: createStyledTextField("Quote"),
      },
    },
  };

export const FormalFinderReviewsSectionComponent: PuckComponent<
  FormalFinderReviewsSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveStyledText(props.heading, locale, streamDocument);
  const summaryScore = resolveStyledText(
    props.summaryScore,
    locale,
    streamDocument,
  );
  const summaryBody = resolveStyledText(
    props.summaryBody,
    locale,
    streamDocument,
  );

  return (
    <section
      className="mx-auto mt-3 mb-[60px] w-full max-w-[1024px] px-6"
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
      <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr_1.1fr]">
        <article className="grid gap-4 rounded-[10px] border border-[#dde1e7] p-6">
          <p
            className="m-0"
            style={{
              fontFamily: SOURCE_SANS_STACK,
              fontSize: `${props.summaryScore.fontSize}px`,
              lineHeight: 1,
              color: props.summaryScore.fontColor,
              fontWeight: props.summaryScore.fontWeight,
              textTransform: toCssTextTransform(
                props.summaryScore.textTransform,
              ),
            }}
          >
            {summaryScore}
          </p>
          <p
            className="m-0"
            style={{
              fontFamily: SOURCE_SANS_STACK,
              fontSize: `${props.summaryBody.fontSize}px`,
              lineHeight: 1.55,
              color: props.summaryBody.fontColor,
              fontWeight: props.summaryBody.fontWeight,
              textTransform: toCssTextTransform(
                props.summaryBody.textTransform,
              ),
            }}
          >
            {summaryBody}
          </p>
        </article>
        {props.quotes.map((item, index) => {
          const quote = resolveStyledText(item.quote, locale, streamDocument);
          return (
            <article
              key={`${quote}-${index}`}
              className="grid gap-4 rounded-[10px] border border-[#dde1e7] p-6"
            >
              <p
                className="m-0"
                style={{
                  fontFamily: SOURCE_SANS_STACK,
                  fontSize: `${item.quote.fontSize}px`,
                  lineHeight: 1.55,
                  color: item.quote.fontColor,
                  fontWeight: item.quote.fontWeight,
                  textTransform: toCssTextTransform(item.quote.textTransform),
                }}
              >
                {quote}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const FormalFinderReviewsSection: ComponentConfig<FormalFinderReviewsSectionProps> =
  {
    label: "Formal Finder Reviews Section",
    fields: FormalFinderReviewsSectionFields,
    defaultProps: {
      heading: createStyledTextDefault("Client reviews", 32, "#1a2230", 700),
      summaryScore: createStyledTextDefault("4.8", 45, "#27354a", 700),
      summaryBody: createStyledTextDefault(
        "Average client rating for clarity, responsiveness, and planning support.",
        16,
        "#1a2230",
        400,
      ),
      quotes: [
        {
          quote: createStyledTextDefault(
            '"The office is organized, direct, and much easier to work with than the larger firms we had tried before."',
            16,
            "#1a2230",
            400,
          ),
        },
        {
          quote: createStyledTextDefault(
            '"What stood out most was how practical the advice felt. We left every meeting with a clear list of next steps."',
            16,
            "#1a2230",
            400,
          ),
        },
      ],
    },
    render: FormalFinderReviewsSectionComponent,
  };
