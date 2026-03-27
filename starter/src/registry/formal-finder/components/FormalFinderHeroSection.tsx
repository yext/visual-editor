import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Link } from "@yext/pages-components";

const SOURCE_SANS_STACK = "'Source Sans 3', 'Open Sans', sans-serif";
const LIBRE_STACK = "'Libre Baskerville', Georgia, serif";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type HeroLinkItem = {
  label: string;
  link: string;
  variant: "solid" | "outline";
};

export type FormalFinderHeroSectionProps = {
  heading: StyledTextProps;
  location: StyledTextProps;
  description: StyledTextProps;
  ctas: HeroLinkItem[];
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

const FormalFinderHeroSectionFields: Fields<FormalFinderHeroSectionProps> = {
  heading: createStyledTextField("Heading"),
  location: createStyledTextField("Location"),
  description: createStyledTextField("Description"),
  ctas: {
    label: "Call To Actions",
    type: "array",
    getItemSummary: (item) => item.label || "Call To Action",
    defaultItemProps: {
      label: "Learn More",
      link: "#",
      variant: "solid",
    },
    arrayFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
      variant: {
        label: "Variant",
        type: "select",
        options: [
          { label: "Solid", value: "solid" },
          { label: "Outline", value: "outline" },
        ],
      },
    },
  },
};

export const FormalFinderHeroSectionComponent: PuckComponent<
  FormalFinderHeroSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveStyledText(props.heading, locale, streamDocument);
  const location = resolveStyledText(props.location, locale, streamDocument);
  const description = resolveStyledText(
    props.description,
    locale,
    streamDocument,
  );

  return (
    <section className="mt-3 mb-[60px] w-full bg-[#1a2230] text-white">
      <div className="mx-auto grid max-w-[1024px] justify-items-center gap-5 px-6 pt-[38px] pb-6 text-center">
        <h1
          className="m-0 w-full"
          style={{
            fontFamily: LIBRE_STACK,
            fontSize: `clamp(${props.heading.fontSize}px, 6vw, 76.8px)`,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: toCssTextTransform(props.heading.textTransform),
          }}
        >
          {heading}
        </h1>
        <p
          className="m-0"
          style={{
            fontFamily: SOURCE_SANS_STACK,
            fontSize: `${props.location.fontSize}px`,
            lineHeight: 1.55,
            color: props.location.fontColor,
            fontWeight: props.location.fontWeight,
            textTransform: toCssTextTransform(props.location.textTransform),
          }}
        >
          {location}
        </p>
        <p
          className="m-0 max-w-[48ch]"
          style={{
            fontFamily: SOURCE_SANS_STACK,
            fontSize: `${props.description.fontSize}px`,
            lineHeight: 1.55,
            color: props.description.fontColor,
            fontWeight: props.description.fontWeight,
            textTransform: toCssTextTransform(props.description.textTransform),
          }}
        >
          {description}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {props.ctas.map((item, index) => {
            const isSolid = item.variant === "solid";
            return (
              <Link
                key={`${item.label}-${index}`}
                cta={{ link: item.link, linkType: "URL" }}
                className={
                  isSolid
                    ? "inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#27354a] bg-[#27354a] px-[18px] text-base font-bold text-white no-underline"
                    : "inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#27354a] bg-transparent px-[18px] text-base font-bold text-[#27354a] no-underline"
                }
                style={{ fontFamily: SOURCE_SANS_STACK }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const FormalFinderHeroSection: ComponentConfig<FormalFinderHeroSectionProps> =
  {
    label: "Formal Finder Hero Section",
    fields: FormalFinderHeroSectionFields,
    defaultProps: {
      heading: createStyledTextDefault("Harbor Ledger CPA", 48, "#ffffff", 700),
      location: createStyledTextDefault("Hartford, CT", 18, "#c8d5ea", 700),
      description: createStyledTextDefault(
        "A local accounting office for tax planning, business reporting, and year-round financial organization with a more direct, less noisy client experience.",
        16,
        "#dbe2ec",
        400,
      ),
      ctas: [
        {
          label: "Schedule consultation",
          link: "#",
          variant: "solid",
        },
        {
          label: "Get directions",
          link: "#",
          variant: "outline",
        },
      ],
    },
    render: FormalFinderHeroSectionComponent,
  };
