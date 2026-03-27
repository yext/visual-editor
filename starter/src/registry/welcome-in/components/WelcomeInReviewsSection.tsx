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

type ReviewItem = {
  quote: StyledTextProps;
};

export type WelcomeInReviewsSectionProps = {
  heading: StyledTextProps;
  score: StyledTextProps;
  summary: StyledTextProps;
  reviews: ReviewItem[];
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

const createStyledTextField = (label: string): any => ({
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
      options: fontWeightOptions,
    },
    textTransform: {
      label: "Text Transform",
      type: "select",
      options: textTransformOptions,
    },
  },
});

const defaultStyledText = (
  value: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
) => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: value,
      hasLocalizedValue: "true" as const,
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, any>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const WelcomeInReviewsSectionFields: Fields<WelcomeInReviewsSectionProps> = {
  heading: createStyledTextField("Heading"),
  score: createStyledTextField("Score"),
  summary: createStyledTextField("Summary"),
  reviews: {
    label: "Reviews",
    type: "array",
    arrayFields: {
      quote: createStyledTextField("Quote"),
    },
    defaultItemProps: {
      quote: defaultStyledText('"Helpful review quote."', 16, "#24324d", 400),
    },
    getItemSummary: (item: ReviewItem) =>
      (item as any)?.quote?.text?.constantValue?.defaultValue || "Review",
  },
};

export const WelcomeInReviewsSectionComponent: PuckComponent<
  WelcomeInReviewsSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveStyledText(props.heading, locale, streamDocument);
  const score = resolveStyledText(props.score, locale, streamDocument);
  const summary = resolveStyledText(props.summary, locale, streamDocument);

  return (
    <section className="w-full bg-[#fffdfb] py-3">
      <div className="mx-auto w-full max-w-[1024px] px-6">
        <div className="mb-6 text-center">
          <h2
            className="m-0"
            style={{
              fontFamily: '"Baloo 2", "Trebuchet MS", sans-serif',
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            {heading}
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr_1.1fr]">
          <article className="grid gap-4 rounded-[34px] border border-[#d9dced] bg-[#fff6ea] p-6 text-center">
            <p
              className="m-0"
              style={{
                fontFamily:
                  '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
                fontSize: `${props.score.fontSize}px`,
                color: props.score.fontColor,
                fontWeight: props.score.fontWeight,
                textTransform: toCssTextTransform(props.score.textTransform),
                lineHeight: 1,
              }}
            >
              {score}
            </p>
            <p
              className="m-0"
              style={{
                fontFamily:
                  '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
                fontSize: `${props.summary.fontSize}px`,
                color: props.summary.fontColor,
                fontWeight: props.summary.fontWeight,
                textTransform: toCssTextTransform(props.summary.textTransform),
                lineHeight: 1.55,
              }}
            >
              {summary}
            </p>
          </article>
          {props.reviews.map((review, index) => {
            const quote = resolveStyledText(
              review.quote,
              locale,
              streamDocument,
            );

            return (
              <article
                key={`${quote}-${index}`}
                className="grid gap-4 rounded-[34px] border border-[#d9dced] bg-[#fffdfb] p-6"
              >
                <p
                  className="m-0"
                  style={{
                    fontFamily:
                      '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
                    fontSize: `${review.quote.fontSize}px`,
                    color: review.quote.fontColor,
                    fontWeight: review.quote.fontWeight,
                    textTransform: toCssTextTransform(
                      review.quote.textTransform,
                    ),
                    lineHeight: 1.55,
                  }}
                >
                  {quote}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const WelcomeInReviewsSection: ComponentConfig<WelcomeInReviewsSectionProps> =
  {
    label: "Welcome In Reviews Section",
    fields: WelcomeInReviewsSectionFields,
    defaultProps: {
      heading: defaultStyledText("Reader reviews", 35, "#24324d", 800),
      score: defaultStyledText("4.9", 48, "#db5d7d", 800),
      summary: defaultStyledText(
        "Average rating from local families and gift shoppers.",
        16,
        "#24324d",
        400,
      ),
      reviews: [
        {
          quote: defaultStyledText(
            '"The staff recommendations are so useful when you need something thoughtful without already knowing the catalog."',
            16,
            "#24324d",
            400,
          ),
        },
        {
          quote: defaultStyledText(
            '"It feels playful without being chaotic, and the events calendar actually makes you want to come back."',
            16,
            "#24324d",
            400,
          ),
        },
      ],
    },
    render: WelcomeInReviewsSectionComponent,
  };
