import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";

const SOURCE_SANS_STACK = "'Source Sans 3', 'Open Sans', sans-serif";
const LIBRE_STACK = "'Libre Baskerville', Georgia, serif";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type ServiceItem = {
  title: StyledTextProps;
  body: StyledTextProps;
};

export type FormalFinderServicesSectionProps = {
  heading: StyledTextProps;
  items: ServiceItem[];
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
        filter: { types: ["type.string"] },
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

const itemTextFields = {
  title: createStyledTextField("Title"),
  body: createStyledTextField("Body"),
};

const FormalFinderServicesSectionFields: Fields<FormalFinderServicesSectionProps> =
  {
    heading: createStyledTextField("Heading"),
    items: {
      label: "Items",
      type: "array",
      getItemSummary: () => "Service Item",
      defaultItemProps: {
        title: createStyledTextDefault("Title", 17, "#1a2230", 700),
        body: createStyledTextDefault("Body copy", 16, "#1a2230", 400),
      },
      arrayFields: itemTextFields,
    },
  };

export const FormalFinderServicesSectionComponent: PuckComponent<
  FormalFinderServicesSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveStyledText(props.heading, locale, streamDocument);

  return (
    <section
      className="mx-auto mt-3 mb-[60px] w-full max-w-[1024px] px-6"
      style={{ fontFamily: SOURCE_SANS_STACK }}
    >
      <div className="mb-6">
        <h2
          className="m-0"
          style={{
            fontFamily: LIBRE_STACK,
            fontSize: `${props.heading.fontSize}px`,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: toCssTextTransform(props.heading.textTransform),
          }}
        >
          {heading}
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {props.items.map((item, index) => {
          const title = resolveStyledText(item.title, locale, streamDocument);
          const body = resolveStyledText(item.body, locale, streamDocument);
          return (
            <article
              key={`${title}-${index}`}
              className="grid gap-4 rounded-[10px] border border-[#dde1e7] bg-white p-5"
            >
              <h3
                className="m-0"
                style={{
                  fontFamily: SOURCE_SANS_STACK,
                  fontSize: `${item.title.fontSize}px`,
                  lineHeight: 1.55,
                  color: item.title.fontColor,
                  fontWeight: item.title.fontWeight,
                  textTransform: toCssTextTransform(item.title.textTransform),
                }}
              >
                {title}
              </h3>
              <p
                className="m-0"
                style={{
                  fontFamily: SOURCE_SANS_STACK,
                  fontSize: `${item.body.fontSize}px`,
                  lineHeight: 1.55,
                  color: item.body.fontColor,
                  fontWeight: item.body.fontWeight,
                  textTransform: toCssTextTransform(item.body.textTransform),
                }}
              >
                {body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const FormalFinderServicesSection: ComponentConfig<FormalFinderServicesSectionProps> =
  {
    label: "Formal Finder Services Section",
    fields: FormalFinderServicesSectionFields,
    defaultProps: {
      heading: createStyledTextDefault("Services", 32, "#1a2230", 700),
      items: [
        {
          title: createStyledTextDefault(
            "Individual tax support",
            17,
            "#1a2230",
            700,
          ),
          body: createStyledTextDefault(
            "Planning and filing support for households that want more than a one-time transaction.",
            16,
            "#1a2230",
            400,
          ),
        },
        {
          title: createStyledTextDefault(
            "Small business accounting",
            17,
            "#1a2230",
            700,
          ),
          body: createStyledTextDefault(
            "Ongoing reporting and review for business owners who need cleaner systems and steadier oversight.",
            16,
            "#1a2230",
            400,
          ),
        },
        {
          title: createStyledTextDefault(
            "Advisory conversations",
            17,
            "#1a2230",
            700,
          ),
          body: createStyledTextDefault(
            "Direct meetings for tax questions, entity decisions, and financial organization ahead of key deadlines.",
            16,
            "#1a2230",
            400,
          ),
        },
      ],
    },
    render: FormalFinderServicesSectionComponent,
  };
