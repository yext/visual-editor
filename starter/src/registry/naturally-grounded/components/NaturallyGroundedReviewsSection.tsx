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
  score: StyledTextProps;
  title: StyledTextProps;
  body: StyledTextProps;
};

export type NaturallyGroundedReviewsSectionProps = {
  title: StyledTextProps;
  items: ReviewItem[];
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
} satisfies Fields<StyledTextProps>;

const createTextDefault = (
  value: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: value,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform: "normal",
});

const getTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

export const NaturallyGroundedReviewsSectionComponent: PuckComponent<
  NaturallyGroundedReviewsSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle =
    resolveComponentData(props.title.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto w-full max-w-[1120px] px-6 pb-6 pt-14">
      <div className="mb-6">
        <h2
          className="m-0 font-['Libre_Baskerville','Times_New_Roman',serif] leading-[1.02] tracking-[-0.03em]"
          style={{
            color: props.title.fontColor,
            fontSize: `${props.title.fontSize}px`,
            fontWeight: props.title.fontWeight,
            textTransform: getTextTransform(props.title.textTransform),
          }}
        >
          {resolvedTitle}
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {props.items.map((item, index) => {
          const resolvedScore =
            resolveComponentData(item.score.text, locale, streamDocument) || "";
          const resolvedItemTitle =
            resolveComponentData(item.title.text, locale, streamDocument) || "";
          const resolvedItemBody =
            resolveComponentData(item.body.text, locale, streamDocument) || "";

          return (
            <article
              key={`${resolvedItemTitle || resolvedScore}-${index}`}
              className="grid gap-4 rounded-[24px] border border-[#d8e2d8] bg-white p-6"
            >
              {resolvedScore ? (
                <p
                  className="m-0 font-['Work_Sans','Open_Sans',sans-serif] leading-none"
                  style={{
                    color: item.score.fontColor,
                    fontSize: `${item.score.fontSize}px`,
                    fontWeight: item.score.fontWeight,
                    textTransform: getTextTransform(item.score.textTransform),
                  }}
                >
                  {resolvedScore}
                </p>
              ) : null}
              {resolvedItemTitle ? (
                <h3
                  className="m-0 font-['Work_Sans','Open_Sans',sans-serif] leading-[1.55]"
                  style={{
                    color: item.title.fontColor,
                    fontSize: `${item.title.fontSize}px`,
                    fontWeight: item.title.fontWeight,
                    textTransform: getTextTransform(item.title.textTransform),
                  }}
                >
                  {resolvedItemTitle}
                </h3>
              ) : null}
              <p
                className="m-0 font-['Work_Sans','Open_Sans',sans-serif] leading-[1.55]"
                style={{
                  color: item.body.fontColor,
                  fontSize: `${item.body.fontSize}px`,
                  fontWeight: item.body.fontWeight,
                  textTransform: getTextTransform(item.body.textTransform),
                }}
              >
                {resolvedItemBody}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const NaturallyGroundedReviewsSection: ComponentConfig<NaturallyGroundedReviewsSectionProps> =
  {
    label: "Naturally Grounded Reviews Section",
    fields: {
      title: {
        label: "Title",
        type: "object",
        objectFields: styledTextObjectFields,
      },
      items: {
        label: "Items",
        type: "array",
        arrayFields: {
          score: {
            label: "Score",
            type: "object",
            objectFields: styledTextObjectFields,
          },
          title: {
            label: "Title",
            type: "object",
            objectFields: styledTextObjectFields,
          },
          body: {
            label: "Body",
            type: "object",
            objectFields: styledTextObjectFields,
          },
        },
        defaultItemProps: {
          score: createTextDefault("", 38, "#1d4b33", 800),
          title: createTextDefault("Review Title", 17, "#1f2a24", 800),
          body: createTextDefault("Review body copy.", 16, "#1f2a24", 400),
        },
        getItemSummary: (item) =>
          ((item.title?.text as any)?.constantValue?.defaultValue as string) ||
          ((item.score?.text as any)?.constantValue?.defaultValue as string) ||
          "Review Item",
      },
    },
    defaultProps: {
      title: createTextDefault("Store reviews", 40, "#1d4b33", 700),
      items: [
        {
          score: createTextDefault("4.8", 38, "#1d4b33", 800),
          title: createTextDefault("", 17, "#1f2a24", 800),
          body: createTextDefault(
            "Average local rating for selection, produce freshness, and helpful staff.",
            16,
            "#1f2a24",
            400,
          ),
        },
        {
          score: createTextDefault("", 38, "#1d4b33", 800),
          title: createTextDefault(
            "Easy to shop every week",
            17,
            "#1f2a24",
            800,
          ),
          body: createTextDefault(
            '"It feels values-driven without making everyday grocery shopping harder or more expensive than it needs to be."',
            16,
            "#1f2a24",
            400,
          ),
        },
        {
          score: createTextDefault("", 38, "#1d4b33", 800),
          title: createTextDefault(
            "Practical sustainability",
            17,
            "#1f2a24",
            800,
          ),
          body: createTextDefault(
            '"The refill area and local staples make it easier to build small habits that actually stick."',
            16,
            "#1f2a24",
            400,
          ),
        },
      ],
    },
    render: NaturallyGroundedReviewsSectionComponent,
  };
