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

type ReviewCard = {
  score: StyledTextProps;
  title: StyledTextProps;
  description: StyledTextProps;
};

export type ModernEraClientReviewsSectionProps = {
  heading: StyledTextProps;
  cards: ReviewCard[];
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

const ModernEraClientReviewsSectionFields: Fields<ModernEraClientReviewsSectionProps> =
  {
    heading: styledTextFields("Heading"),
    cards: {
      label: "Cards",
      type: "array",
      getItemSummary: (_item, index) => `Review Card ${(index ?? 0) + 1}`,
      defaultItemProps: {
        score: styledTextDefault("", 42, "#19324d", 400),
        title: styledTextDefault("Review title", 18, "#1b2430", 800),
        description: styledTextDefault(
          "Review description",
          16,
          "#1b2430",
          400,
        ),
      },
      arrayFields: {
        score: styledTextFields("Score"),
        title: styledTextFields("Title"),
        description: styledTextFields("Description"),
      },
    },
  };

export const ModernEraClientReviewsSectionComponent: PuckComponent<
  ModernEraClientReviewsSectionProps
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
      <div className="grid grid-cols-3 gap-5 max-[920px]:grid-cols-1">
        {props.cards.map((card, index) => {
          const score = resolveText(card.score, locale, streamDocument);
          const title = resolveText(card.title, locale, streamDocument);
          const description = resolveText(
            card.description,
            locale,
            streamDocument,
          );

          return (
            <article
              key={index}
              className="grid gap-4 rounded-[22px] border border-[#d7e2ec] bg-white p-6"
              style={{ fontFamily: '"Manrope", "Open Sans", sans-serif' }}
            >
              {score ? (
                <p
                  className="m-0 text-[#19324d]"
                  style={{
                    fontSize: `${card.score.fontSize}px`,
                    color: card.score.fontColor,
                    fontWeight: card.score.fontWeight,
                    textTransform: cssTextTransform(card.score.textTransform),
                    lineHeight: 1,
                  }}
                >
                  {score}
                </p>
              ) : null}
              {title ? (
                <h3
                  className="m-0"
                  style={{
                    fontSize: `${card.title.fontSize}px`,
                    color: card.title.fontColor,
                    fontWeight: card.title.fontWeight,
                    textTransform: cssTextTransform(card.title.textTransform),
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </h3>
              ) : null}
              <p
                className="m-0"
                style={{
                  fontSize: `${card.description.fontSize}px`,
                  color: card.description.fontColor,
                  fontWeight: card.description.fontWeight,
                  textTransform: cssTextTransform(
                    card.description.textTransform,
                  ),
                  lineHeight: 1.55,
                }}
              >
                {description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const ModernEraClientReviewsSection: ComponentConfig<ModernEraClientReviewsSectionProps> =
  {
    label: "Modern Era Client Reviews Section",
    fields: ModernEraClientReviewsSectionFields,
    defaultProps: {
      heading: styledTextDefault("Client reviews", 42, "#19324d", 400),
      cards: [
        {
          score: styledTextDefault("4.9", 42, "#19324d", 400),
          title: styledTextDefault("", 18, "#1b2430", 800),
          description: styledTextDefault(
            "Average branch rating from local retirement-planning clients.",
            16,
            "#1b2430",
            400,
          ),
        },
        {
          score: styledTextDefault("", 42, "#19324d", 400),
          title: styledTextDefault("Clear and patient", 18, "#1b2430", 800),
          description: styledTextDefault(
            '"They translated a confusing retirement picture into a plan I could actually follow."',
            16,
            "#1b2430",
            400,
          ),
        },
        {
          score: styledTextDefault("", 42, "#19324d", 400),
          title: styledTextDefault(
            "Modern without feeling remote",
            18,
            "#1b2430",
            800,
          ),
          description: styledTextDefault(
            '"I still wanted a local advisor, but I liked being able to keep momentum between meetings."',
            16,
            "#1b2430",
            400,
          ),
        },
      ],
    },
    render: ModernEraClientReviewsSectionComponent,
  };
