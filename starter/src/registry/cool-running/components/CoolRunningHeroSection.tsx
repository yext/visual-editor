import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type LinkItem = {
  label: string;
  link: string;
};

export type CoolRunningHeroSectionProps = {
  heading: StyledTextProps;
  location: StyledTextProps;
  description: StyledTextProps;
  primaryCta: LinkItem;
  secondaryCta: LinkItem;
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

const createStyledTextField = (label: string) => ({
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

const CoolRunningHeroSectionFields: Fields<CoolRunningHeroSectionProps> = {
  heading: createStyledTextField("Heading"),
  location: createStyledTextField("Location"),
  description: createStyledTextField("Description"),
  primaryCta: {
    label: "Primary Call To Action",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
  secondaryCta: {
    label: "Secondary Call To Action",
    type: "object",
    objectFields: {
      label: { label: "Label", type: "text" },
      link: { label: "Link", type: "text" },
    },
  },
};

const resolveText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

const baseTextStyle = (value: StyledTextProps) => ({
  color: value.fontColor,
  fontWeight: value.fontWeight,
  textTransform: toCssTextTransform(value.textTransform),
  lineHeight: 1.5,
});

export const CoolRunningHeroSectionComponent: PuckComponent<
  CoolRunningHeroSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveText(props.heading, locale, streamDocument);
  const location = resolveText(props.location, locale, streamDocument);
  const description = resolveText(props.description, locale, streamDocument);

  return (
    <section
      className="mx-auto grid w-full max-w-[1024px] gap-5 rounded-[14px] border border-[#dbe2ea] bg-[#f4f8fb] px-6 py-6"
      id="main-content"
    >
      <h1
        className="m-0"
        style={{
          ...baseTextStyle(props.heading),
          fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
          fontSize: `clamp(44.8px, 6vw, ${props.heading.fontSize}px)`,
          letterSpacing: "-0.03em",
          lineHeight: 0.98,
        }}
      >
        {heading}
      </h1>
      <p
        className="m-0"
        style={{
          ...baseTextStyle(props.location),
          fontFamily: '"IBM Plex Sans", "Open Sans", sans-serif',
          fontSize: `${props.location.fontSize}px`,
        }}
      >
        {location}
      </p>
      <p
        className="m-0 max-w-[42ch]"
        style={{
          ...baseTextStyle(props.description),
          fontFamily: '"IBM Plex Sans", "Open Sans", sans-serif',
          fontSize: `${props.description.fontSize}px`,
        }}
      >
        {description}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#1677c9] bg-[#1677c9] px-[18px] font-bold text-white no-underline"
          cta={{
            link: props.primaryCta.link,
            linkType: "URL",
          }}
        >
          {props.primaryCta.label}
        </Link>
        <Link
          className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#1677c9] bg-transparent px-[18px] font-bold text-[#1677c9] no-underline"
          cta={{
            link: props.secondaryCta.link,
            linkType: "URL",
          }}
        >
          {props.secondaryCta.label}
        </Link>
      </div>
    </section>
  );
};

export const CoolRunningHeroSection: ComponentConfig<CoolRunningHeroSectionProps> =
  {
    label: "Cool Running Hero Section",
    fields: CoolRunningHeroSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "CityPoint ATM",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 72,
        fontColor: "#14202c",
        fontWeight: 700,
        textTransform: "normal",
      },
      location: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Charlotte, NC",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 18,
        fontColor: "#0e446d",
        fontWeight: 700,
        textTransform: "normal",
      },
      description: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "A straightforward cash-access location with drive-up access, after-hours lighting, and quick links for directions, nearby branch support, and deposit availability.",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#5e6d7b",
        fontWeight: 400,
        textTransform: "normal",
      },
      primaryCta: {
        label: "Get directions",
        link: "#",
      },
      secondaryCta: {
        label: "Nearby branch support",
        link: "#",
      },
    },
    render: CoolRunningHeroSectionComponent,
  };
