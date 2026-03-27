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

type ReviewItemProps = {
  quote: StyledTextProps;
  author: StyledTextProps;
  context: StyledTextProps;
};

export type CoastalCareReviewsSectionProps = {
  sectionHeading: StyledTextProps;
  score: StyledTextProps;
  summary: StyledTextProps;
  reviews: ReviewItemProps[];
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

const CoastalCareReviewsSectionFields: Fields<CoastalCareReviewsSectionProps> =
  {
    sectionHeading: styledTextFields("Section Heading"),
    score: styledTextFields("Score"),
    summary: styledTextFields("Summary"),
    reviews: {
      label: "Reviews",
      type: "array",
      arrayFields: {
        quote: styledTextFields("Quote"),
        author: styledTextFields("Author"),
        context: styledTextFields("Context"),
      },
      defaultItemProps: {
        quote: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Review quote.",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 16,
          fontColor: "#183347",
          fontWeight: 400,
          textTransform: "normal",
        },
        author: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Reviewer",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 16,
          fontColor: "#183347",
          fontWeight: 700,
          textTransform: "normal",
        },
        context: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Visit context",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 16,
          fontColor: "#183347",
          fontWeight: 400,
          textTransform: "normal",
        },
      },
      getItemSummary: (item: any) =>
        item?.author?.text?.constantValue?.defaultValue || "Review",
    },
  };

export const CoastalCareReviewsSectionComponent: PuckComponent<
  CoastalCareReviewsSectionProps
> = ({ sectionHeading, score, summary, reviews }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedSectionHeading =
    resolveComponentData(sectionHeading.text, locale, streamDocument) || "";
  const resolvedScore =
    resolveComponentData(score.text, locale, streamDocument) || "";
  const resolvedSummary =
    resolveComponentData(summary.text, locale, streamDocument) || "";

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
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.05fr_1.05fr]">
        <div className="grid gap-4 rounded-[24px] border border-[#d7e3e7] bg-white p-6">
          <p
            className="m-0 font-['Public_Sans','Open_Sans',sans-serif] leading-none"
            style={{
              fontSize: `${score.fontSize}px`,
              color: score.fontColor,
              fontWeight: score.fontWeight,
              textTransform: toCssTextTransform(score.textTransform),
            }}
          >
            {resolvedScore}
          </p>
          <p
            className="m-0 font-['Public_Sans','Open_Sans',sans-serif] leading-[1.55]"
            style={{
              fontSize: `${summary.fontSize}px`,
              color: summary.fontColor,
              fontWeight: summary.fontWeight,
              textTransform: toCssTextTransform(summary.textTransform),
            }}
          >
            {resolvedSummary}
          </p>
        </div>
        {reviews.map((review, index) => {
          const resolvedQuote =
            resolveComponentData(review.quote.text, locale, streamDocument) ||
            "";
          const resolvedAuthor =
            resolveComponentData(review.author.text, locale, streamDocument) ||
            "";
          const resolvedContext =
            resolveComponentData(review.context.text, locale, streamDocument) ||
            "";

          return (
            <article
              key={`${resolvedAuthor}-${index}`}
              className="grid gap-4 rounded-[24px] border border-[#d7e3e7] bg-white p-6"
            >
              <p
                className="m-0 font-['Public_Sans','Open_Sans',sans-serif] leading-[1.55]"
                style={{
                  fontSize: `${review.quote.fontSize}px`,
                  color: review.quote.fontColor,
                  fontWeight: review.quote.fontWeight,
                  textTransform: toCssTextTransform(review.quote.textTransform),
                }}
              >
                {resolvedQuote}
              </p>
              <p className="m-0 font-['Public_Sans','Open_Sans',sans-serif] leading-[1.55] text-[#183347]">
                <span
                  style={{
                    fontSize: `${review.author.fontSize}px`,
                    color: review.author.fontColor,
                    fontWeight: review.author.fontWeight,
                    textTransform: toCssTextTransform(
                      review.author.textTransform,
                    ),
                  }}
                >
                  {resolvedAuthor}
                </span>
                <br />
                <span
                  style={{
                    fontSize: `${review.context.fontSize}px`,
                    color: review.context.fontColor,
                    fontWeight: review.context.fontWeight,
                    textTransform: toCssTextTransform(
                      review.context.textTransform,
                    ),
                  }}
                >
                  {resolvedContext}
                </span>
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const CoastalCareReviewsSection: ComponentConfig<CoastalCareReviewsSectionProps> =
  {
    label: "Coastal Care Reviews Section",
    fields: CoastalCareReviewsSectionFields,
    defaultProps: {
      sectionHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Client reviews",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 35,
        fontColor: "#183347",
        fontWeight: 400,
        textTransform: "normal",
      },
      score: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "4.9",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 45,
        fontColor: "#2d6f83",
        fontWeight: 800,
        textTransform: "normal",
      },
      summary: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "Average local review rating from pet owners who value calmer visits, clear instructions, and consistent follow-up.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#5f7684",
        fontWeight: 400,
        textTransform: "normal",
      },
      reviews: [
        {
          quote: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "“The office feels organized without being stiff, and we always leave knowing what the next step is.”",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 400,
            textTransform: "normal",
          },
          author: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Pet owner",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 700,
            textTransform: "normal",
          },
          context: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Wellness care",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          quote: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "“They made a nervous first visit much easier and explained the care plan in a way that felt practical.”",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 400,
            textTransform: "normal",
          },
          author: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Pet owner",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 700,
            textTransform: "normal",
          },
          context: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "New client visit",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
      ],
    },
    render: CoastalCareReviewsSectionComponent,
  };
