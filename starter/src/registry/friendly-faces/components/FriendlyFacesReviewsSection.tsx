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

type ReviewCardProps = {
  title: StyledTextProps;
  quote: StyledTextProps;
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

export type FriendlyFacesReviewsSectionProps = {
  heading: StyledTextProps;
  score: StyledTextProps;
  scoreBody: StyledTextProps;
  reviewCards: ReviewCardProps[];
};

const FriendlyFacesReviewsSectionFields: Fields<FriendlyFacesReviewsSectionProps> =
  {
    heading: buildStyledTextFields("Heading"),
    score: buildStyledTextFields("Score"),
    scoreBody: buildStyledTextFields("Score Body"),
    reviewCards: {
      label: "Review Cards",
      type: "array",
      arrayFields: {
        title: buildStyledTextFields("Title"),
        quote: buildStyledTextFields("Quote"),
      },
      defaultItemProps: {
        title: buildStyledTextDefault("Review title", 17, "#17313d", 800),
        quote: buildStyledTextDefault("Review quote", 16, "#5f7380", 400),
      },
      getItemSummary: () => "Review Card",
    },
  };

export const FriendlyFacesReviewsSectionComponent: PuckComponent<
  FriendlyFacesReviewsSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedScore =
    resolveComponentData(props.score.text, locale, streamDocument) || "";
  const resolvedScoreBody =
    resolveComponentData(props.scoreBody.text, locale, streamDocument) || "";

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
      <div className="grid gap-5 min-[920px]:grid-cols-3">
        <article className="grid gap-4 rounded-[24px] border border-[#d5e8ea] bg-white p-6">
          <p
            className="m-0 font-['Nunito','Open_Sans',sans-serif]"
            style={{
              fontSize: `${props.score.fontSize}px`,
              color: props.score.fontColor,
              fontWeight: props.score.fontWeight,
              textTransform: getTextTransformStyle(props.score.textTransform),
            }}
          >
            {resolvedScore}
          </p>
          <p
            className="m-0 font-['Nunito','Open_Sans',sans-serif] leading-[1.6]"
            style={{
              fontSize: `${props.scoreBody.fontSize}px`,
              color: props.scoreBody.fontColor,
              fontWeight: props.scoreBody.fontWeight,
              textTransform: getTextTransformStyle(
                props.scoreBody.textTransform,
              ),
            }}
          >
            {resolvedScoreBody}
          </p>
        </article>
        {props.reviewCards.map((item, index) => {
          const resolvedTitle =
            resolveComponentData(item.title.text, locale, streamDocument) || "";
          const resolvedQuote =
            resolveComponentData(item.quote.text, locale, streamDocument) || "";

          return (
            <article
              key={`${resolvedTitle}-${index}`}
              className="grid gap-4 rounded-[24px] border border-[#d5e8ea] bg-white p-6"
            >
              <h3
                className="m-0 font-['Nunito','Open_Sans',sans-serif]"
                style={{
                  fontSize: `${item.title.fontSize}px`,
                  color: item.title.fontColor,
                  fontWeight: item.title.fontWeight,
                  textTransform: getTextTransformStyle(
                    item.title.textTransform,
                  ),
                }}
              >
                {resolvedTitle}
              </h3>
              <p
                className="m-0 font-['Nunito','Open_Sans',sans-serif] leading-[1.6]"
                style={{
                  fontSize: `${item.quote.fontSize}px`,
                  color: item.quote.fontColor,
                  fontWeight: item.quote.fontWeight,
                  textTransform: getTextTransformStyle(
                    item.quote.textTransform,
                  ),
                }}
              >
                {resolvedQuote}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const FriendlyFacesReviewsSection: ComponentConfig<FriendlyFacesReviewsSectionProps> =
  {
    label: "Friendly Faces Reviews Section",
    fields: FriendlyFacesReviewsSectionFields,
    defaultProps: {
      heading: buildStyledTextDefault("Parent reviews", 38, "#17313d", 700),
      score: buildStyledTextDefault("4.9", 40, "#0f7c82", 800),
      scoreBody: buildStyledTextDefault(
        "Average family rating for clarity, warmth, and follow-up.",
        16,
        "#17313d",
        400,
      ),
      reviewCards: [
        {
          title: buildStyledTextDefault(
            "Gentle and practical",
            17,
            "#17313d",
            800,
          ),
          quote: buildStyledTextDefault(
            '"The visit felt calm from the waiting room through checkout, and I left knowing exactly what to watch for at home."',
            16,
            "#5f7380",
            400,
          ),
        },
        {
          title: buildStyledTextDefault(
            "Easy for new parents",
            17,
            "#17313d",
            800,
          ),
          quote: buildStyledTextDefault(
            '"They answer questions without making you feel rushed or embarrassed for asking."',
            16,
            "#5f7380",
            400,
          ),
        },
      ],
    },
    render: FriendlyFacesReviewsSectionComponent,
  };
