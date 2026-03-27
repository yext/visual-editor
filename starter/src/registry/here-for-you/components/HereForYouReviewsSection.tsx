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

const toCssTextTransform = (
  value: StyledTextProps["textTransform"],
): "none" | "uppercase" | "lowercase" | "capitalize" =>
  value === "normal" ? "none" : value;

type ReviewItemProps = {
  quote: StyledTextProps;
};

export type HereForYouReviewsSectionProps = {
  heading: StyledTextProps;
  score: StyledTextProps;
  summary: StyledTextProps;
  reviewCards: ReviewItemProps[];
};

const createStyledTextFields = (): Fields<StyledTextProps> => ({
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
});

const createStyledTextDefault = (
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

const HereForYouReviewsSectionFields: Fields<HereForYouReviewsSectionProps> = {
  heading: {
    label: "Heading",
    type: "object",
    objectFields: createStyledTextFields(),
  },
  score: {
    label: "Score",
    type: "object",
    objectFields: createStyledTextFields(),
  },
  summary: {
    label: "Summary",
    type: "object",
    objectFields: createStyledTextFields(),
  },
  reviewCards: {
    label: "Review Cards",
    type: "array",
    arrayFields: {
      quote: {
        label: "Quote",
        type: "object",
        objectFields: createStyledTextFields(),
      },
    },
    defaultItemProps: {
      quote: createStyledTextDefault("Review quote", 16, "#203446", 400),
    },
    getItemSummary: (item: any) =>
      item.quote?.text?.constantValue?.defaultValue || "Review",
  },
};

export const HereForYouReviewsSectionComponent: PuckComponent<
  HereForYouReviewsSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, any>;
  const locale = streamDocument.locale ?? "en";
  const resolveText = (value: YextEntityField<TranslatableString>) =>
    resolveComponentData(value, locale, streamDocument) || "";

  return (
    <section
      aria-labelledby="here-for-you-reviews-title"
      className="mx-auto my-3 w-full max-w-[1024px] px-6"
    >
      <div className="mb-6">
        <h2
          id="here-for-you-reviews-title"
          style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: `${props.heading.fontSize}px`,
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: toCssTextTransform(props.heading.textTransform),
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
          }}
          className="m-0"
        >
          {resolveText(props.heading.text)}
        </h2>
      </div>
      <div className="grid grid-cols-[.95fr_1.05fr_1.05fr] gap-5 max-[900px]:grid-cols-1">
        <article className="grid gap-4 rounded-[28px] border border-[#d7e7e6] bg-white p-6">
          <p
            style={{
              fontFamily: '"Manrope", "Open Sans", sans-serif',
              fontSize: `${props.score.fontSize}px`,
              color: props.score.fontColor,
              fontWeight: props.score.fontWeight,
              textTransform: toCssTextTransform(props.score.textTransform),
              lineHeight: 1,
            }}
            className="m-0"
          >
            {resolveText(props.score.text)}
          </p>
          <p
            style={{
              fontFamily: '"Manrope", "Open Sans", sans-serif',
              fontSize: `${props.summary.fontSize}px`,
              color: props.summary.fontColor,
              fontWeight: props.summary.fontWeight,
              textTransform: toCssTextTransform(props.summary.textTransform),
              lineHeight: 1.55,
            }}
            className="m-0"
          >
            {resolveText(props.summary.text)}
          </p>
        </article>
        {props.reviewCards.map((item, index) => (
          <article
            key={index}
            className="grid gap-4 rounded-[28px] border border-[#d7e7e6] bg-white p-6"
          >
            <p
              style={{
                fontFamily: '"Manrope", "Open Sans", sans-serif',
                fontSize: `${item.quote.fontSize}px`,
                color: item.quote.fontColor,
                fontWeight: item.quote.fontWeight,
                textTransform: toCssTextTransform(item.quote.textTransform),
                lineHeight: 1.55,
              }}
              className="m-0"
            >
              {resolveText(item.quote.text)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

export const HereForYouReviewsSection: ComponentConfig<HereForYouReviewsSectionProps> =
  {
    label: "Here For You Reviews Section",
    fields: HereForYouReviewsSectionFields,
    defaultProps: {
      heading: createStyledTextDefault("Patient reviews", 35, "#203446", 600),
      score: createStyledTextDefault("4.9", 45, "#2d8a87", 800),
      summary: createStyledTextDefault(
        "Average local rating for clarity, friendliness, and treatment progress.",
        16,
        "#203446",
        400,
      ),
      reviewCards: [
        {
          quote: createStyledTextDefault(
            '"The pace felt realistic and encouraging. I always understood what we were working on and why."',
            16,
            "#203446",
            400,
          ),
        },
        {
          quote: createStyledTextDefault(
            '"It never felt generic. The plan changed as I got stronger instead of just repeating the same set every visit."',
            16,
            "#203446",
            400,
          ),
        },
      ],
    },
    render: HereForYouReviewsSectionComponent,
  };
