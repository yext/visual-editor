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

type BulletItem = {
  copy: StyledTextProps;
};

export type ModernEraAboutSectionProps = {
  heading: StyledTextProps;
  bullets: BulletItem[];
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

const ModernEraAboutSectionFields: Fields<ModernEraAboutSectionProps> = {
  heading: styledTextFields("Heading"),
  bullets: {
    label: "Bullets",
    type: "array",
    getItemSummary: (_item, index) => `Bullet ${(index ?? 0) + 1}`,
    defaultItemProps: {
      copy: styledTextDefault("Bullet copy", 16, "#1b2430", 400),
    },
    arrayFields: {
      copy: styledTextFields("Copy"),
    },
  },
};

export const ModernEraAboutSectionComponent: PuckComponent<
  ModernEraAboutSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveText(props.heading, locale, streamDocument);

  return (
    <section className="mx-auto w-full max-w-[1120px] px-6 pb-6 pt-14">
      <div className="grid grid-cols-[1.2fr_1fr] items-start gap-8 rounded-[18px] bg-[#eef5fb] p-8 max-[920px]:grid-cols-1">
        <div>
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
        <ul
          className="m-0 grid gap-4 pl-[18px]"
          style={{
            fontFamily: '"Manrope", "Open Sans", sans-serif',
            lineHeight: 1.55,
          }}
        >
          {props.bullets.map((item, index) => (
            <li key={index}>
              <span
                style={{
                  fontSize: `${item.copy.fontSize}px`,
                  color: item.copy.fontColor,
                  fontWeight: item.copy.fontWeight,
                  textTransform: cssTextTransform(item.copy.textTransform),
                }}
              >
                {resolveText(item.copy, locale, streamDocument)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export const ModernEraAboutSection: ComponentConfig<ModernEraAboutSectionProps> =
  {
    label: "Modern Era About Section",
    fields: ModernEraAboutSectionFields,
    defaultProps: {
      heading: styledTextDefault(
        "Retirement planning that feels current, not intimidating",
        42,
        "#19324d",
        400,
      ),
      bullets: [
        {
          copy: styledTextDefault(
            "Start with where you are now, not where you think you should already be.",
            16,
            "#1b2430",
            400,
          ),
        },
        {
          copy: styledTextDefault(
            "Build a plan around income, timing, lifestyle goals, and the pace that feels realistic.",
            16,
            "#1b2430",
            400,
          ),
        },
        {
          copy: styledTextDefault(
            "Meet in person with a local advisor, then keep things moving with simple digital follow-up.",
            16,
            "#1b2430",
            400,
          ),
        },
      ],
    },
    render: ModernEraAboutSectionComponent,
  };
