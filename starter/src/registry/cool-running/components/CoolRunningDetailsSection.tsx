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

type CardItem = {
  heading: StyledTextProps;
  body: StyledTextProps;
};

export type CoolRunningDetailsSectionProps = {
  heading: StyledTextProps;
  cards: CardItem[];
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

const createStyledTextObjectFields = () => ({
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
});

const createStyledTextField = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: createStyledTextObjectFields(),
});

const CoolRunningDetailsSectionFields: Fields<CoolRunningDetailsSectionProps> =
  {
    heading: createStyledTextField("Heading"),
    cards: {
      label: "Cards",
      type: "array",
      arrayFields: {
        heading: {
          label: "Heading",
          type: "object",
          objectFields: createStyledTextObjectFields(),
        },
        body: {
          label: "Body",
          type: "object",
          objectFields: createStyledTextObjectFields(),
        },
      },
      defaultItemProps: {
        heading: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Card heading",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 16,
          fontColor: "#ffffff",
          fontWeight: 700,
          textTransform: "normal",
        },
        body: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Card body copy",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 16,
          fontColor: "#ffffff",
          fontWeight: 400,
          textTransform: "normal",
        },
      },
      getItemSummary: () => "Card",
    },
  };

const resolveText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

const copyStyle = (value: StyledTextProps) => ({
  fontFamily: '"IBM Plex Sans", "Open Sans", sans-serif',
  fontSize: `${value.fontSize}px`,
  color: value.fontColor,
  fontWeight: value.fontWeight,
  textTransform: toCssTextTransform(value.textTransform),
  lineHeight: 1.5,
});

export const CoolRunningDetailsSectionComponent: PuckComponent<
  CoolRunningDetailsSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveText(props.heading, locale, streamDocument);

  return (
    <section className="w-full border border-[#0a3657] bg-[#0e446d] py-6 text-white">
      <div className="mx-auto max-w-[1024px] px-6">
        <div className="mb-6">
          <h2
            className="m-0"
            style={{
              fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
            }}
          >
            {heading}
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {props.cards.map((item, index) => {
            const itemHeading = resolveText(
              item.heading,
              locale,
              streamDocument,
            );
            const itemBody = resolveText(item.body, locale, streamDocument);

            return (
              <article
                key={`${itemHeading}-${index}`}
                className="grid gap-4 rounded-[14px] border border-white/20 bg-white/10 p-5"
              >
                <h3 className="m-0" style={copyStyle(item.heading)}>
                  {itemHeading}
                </h3>
                <p className="m-0" style={copyStyle(item.body)}>
                  {itemBody}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const CoolRunningDetailsSection: ComponentConfig<CoolRunningDetailsSectionProps> =
  {
    label: "Cool Running Details Section",
    fields: CoolRunningDetailsSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "ATM details",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 32,
        fontColor: "#ffffff",
        fontWeight: 700,
        textTransform: "normal",
      },
      cards: [
        {
          heading: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Drive-up access",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 700,
            textTransform: "normal",
          },
          body: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Designed for quick stop access with clear lane markings and after-hours visibility.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          heading: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Card and mobile wallet support",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 700,
            textTransform: "normal",
          },
          body: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Tap-enabled entry and card-based withdrawals for faster access at the machine.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          heading: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Nearby assistance",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 700,
            textTransform: "normal",
          },
          body: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Branch support is available nearby if you need additional help with account questions.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
      ],
    },
    render: CoolRunningDetailsSectionComponent,
  };
