import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";
import { Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type PathCard = {
  eyebrow: StyledTextProps;
  title: StyledTextProps;
  description: StyledTextProps;
  cta: {
    label: string;
    link: string;
  };
};

export type ModernEraRetirementPathsSectionProps = {
  heading: StyledTextProps;
  cards: PathCard[];
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

const ModernEraRetirementPathsSectionFields: Fields<ModernEraRetirementPathsSectionProps> =
  {
    heading: styledTextFields("Heading"),
    cards: {
      label: "Cards",
      type: "array",
      getItemSummary: (_item, index) => `Path Card ${(index ?? 0) + 1}`,
      defaultItemProps: {
        eyebrow: styledTextDefault("Eyebrow", 13, "#2a6cb0", 800, "uppercase"),
        title: styledTextDefault("Card Title", 18, "#1b2430", 800),
        description: styledTextDefault("Card description", 16, "#1b2430", 400),
        cta: { label: "Learn more", link: "#" },
      },
      arrayFields: {
        eyebrow: styledTextFields("Eyebrow"),
        title: styledTextFields("Title"),
        description: styledTextFields("Description"),
        cta: {
          label: "Call To Action",
          type: "object",
          objectFields: {
            label: { label: "Label", type: "text" },
            link: { label: "Link", type: "text" },
          },
        },
      },
    },
  };

export const ModernEraRetirementPathsSectionComponent: PuckComponent<
  ModernEraRetirementPathsSectionProps
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
        {props.cards.map((card, index) => (
          <article
            key={index}
            className="grid gap-4 rounded-[22px] border border-[#d7e2ec] bg-white p-6"
            style={{ fontFamily: '"Manrope", "Open Sans", sans-serif' }}
          >
            <p
              className="m-0 uppercase"
              style={{
                fontSize: `${card.eyebrow.fontSize}px`,
                color: card.eyebrow.fontColor,
                fontWeight: card.eyebrow.fontWeight,
                textTransform: cssTextTransform(card.eyebrow.textTransform),
                letterSpacing: "0.08em",
              }}
            >
              {resolveText(card.eyebrow, locale, streamDocument)}
            </p>
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
              {resolveText(card.title, locale, streamDocument)}
            </h3>
            <p
              className="m-0"
              style={{
                fontSize: `${card.description.fontSize}px`,
                color: card.description.fontColor,
                fontWeight: card.description.fontWeight,
                textTransform: cssTextTransform(card.description.textTransform),
                lineHeight: 1.55,
              }}
            >
              {resolveText(card.description, locale, streamDocument)}
            </p>
            <Link
              cta={{ link: card.cta.link, linkType: "URL" }}
              className="text-[#2a6cb0]"
            >
              {card.cta.label}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export const ModernEraRetirementPathsSection: ComponentConfig<ModernEraRetirementPathsSectionProps> =
  {
    label: "Modern Era Retirement Paths Section",
    fields: ModernEraRetirementPathsSectionFields,
    defaultProps: {
      heading: styledTextDefault("Retirement paths", 42, "#19324d", 400),
      cards: [
        {
          eyebrow: styledTextDefault(
            "Starting early",
            13,
            "#2a6cb0",
            800,
            "uppercase",
          ),
          title: styledTextDefault(
            "Build the habit before the math gets complicated",
            18,
            "#1b2430",
            800,
          ),
          description: styledTextDefault(
            "Designed for people in their 20s, 30s, and 40s who want to start contributing consistently and understand what matters first.",
            16,
            "#1b2430",
            400,
          ),
          cta: { label: "Learn more", link: "#" },
        },
        {
          eyebrow: styledTextDefault(
            "Catching up",
            13,
            "#2a6cb0",
            800,
            "uppercase",
          ),
          title: styledTextDefault(
            "Make the next ten years work harder",
            18,
            "#1b2430",
            800,
          ),
          description: styledTextDefault(
            "Useful for households that want a focused catch-up strategy, clearer account coordination, and better visibility into future income.",
            16,
            "#1b2430",
            400,
          ),
          cta: { label: "Learn more", link: "#" },
        },
        {
          eyebrow: styledTextDefault(
            "Already retiring",
            13,
            "#2a6cb0",
            800,
            "uppercase",
          ),
          title: styledTextDefault(
            "Turn savings into a confident monthly plan",
            18,
            "#1b2430",
            800,
          ),
          description: styledTextDefault(
            "Built for clients who are close to retirement and want help sequencing withdrawals, reviewing benefits, and planning for flexibility.",
            16,
            "#1b2430",
            400,
          ),
          cta: { label: "Learn more", link: "#" },
        },
      ],
    },
    render: ModernEraRetirementPathsSectionComponent,
  };
