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

type AboutItem = {
  title: StyledTextProps;
  description: StyledTextProps;
};

export type WarmEditorialAboutSectionProps = {
  heading: StyledTextProps;
  items: AboutItem[];
};

const createStyledTextFields = (label: string) =>
  ({
    label,
    type: "object",
    objectFields: {
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
        type: "select",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Uppercase", value: "uppercase" },
          { label: "Lowercase", value: "lowercase" },
          { label: "Capitalize", value: "capitalize" },
        ],
      },
    },
  }) as const;

const createStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
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
  textTransform: "normal",
});

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const WarmEditorialAboutSectionFields: Fields<WarmEditorialAboutSectionProps> =
  {
    heading: createStyledTextFields("Heading"),
    items: {
      label: "Items",
      type: "array",
      getItemSummary: () => "Item",
      defaultItemProps: {
        title: createStyledTextDefault("About item", 16, "#2b211d", 700),
        description: createStyledTextDefault(
          "Add supporting editorial copy.",
          16,
          "#2b211d",
          500,
        ),
      },
      arrayFields: {
        title: createStyledTextFields("Title"),
        description: createStyledTextFields("Description"),
      },
    },
  };

export const WarmEditorialAboutSectionComponent: PuckComponent<
  WarmEditorialAboutSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  return (
    <section className="w-full bg-[#fffaf3] px-6 py-6">
      <div className="mx-auto max-w-[1024px]">
        <div className="mb-6">
          <h2
            className="m-0"
            style={{
              fontFamily: '"Newsreader", Georgia, serif',
              fontSize: `${props.heading.fontSize}px`,
              lineHeight: 0.98,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
            }}
          >
            {resolveStyledText(props.heading, locale, streamDocument)}
          </h2>
        </div>
        <div className="grid gap-6 border-y border-[#eadbcb] py-6 max-[900px]:grid-cols-1 min-[901px]:grid-cols-3">
          {props.items.map((item, index) => (
            <div key={`${index}-${item.title.fontSize}`}>
              <h3
                className="mb-2 mt-0"
                style={{
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                  fontSize: `${item.title.fontSize}px`,
                  color: item.title.fontColor,
                  fontWeight: item.title.fontWeight,
                  textTransform: toCssTextTransform(item.title.textTransform),
                  lineHeight: 1.5,
                }}
              >
                {resolveStyledText(item.title, locale, streamDocument)}
              </h3>
              <p
                className="m-0"
                style={{
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                  fontSize: `${item.description.fontSize}px`,
                  color: item.description.fontColor,
                  fontWeight: item.description.fontWeight,
                  textTransform: toCssTextTransform(
                    item.description.textTransform,
                  ),
                  lineHeight: 1.5,
                }}
              >
                {resolveStyledText(item.description, locale, streamDocument)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const WarmEditorialAboutSection: ComponentConfig<WarmEditorialAboutSectionProps> =
  {
    label: "Warm Editorial About Section",
    fields: WarmEditorialAboutSectionFields,
    defaultProps: {
      heading: createStyledTextDefault(
        "Made for regulars, quick pickups, and weekend treats",
        34,
        "#2b211d",
        700,
      ),
      items: [
        {
          title: createStyledTextDefault("Fresh all day", 16, "#2b211d", 700),
          description: createStyledTextDefault(
            "Small-batch production keeps the menu feeling lively instead of overbuilt.",
            16,
            "#2b211d",
            500,
          ),
        },
        {
          title: createStyledTextDefault(
            "Fast to navigate",
            16,
            "#2b211d",
            700,
          ),
          description: createStyledTextDefault(
            "Clear menu groupings and pickup information make the page useful when people are already on the way.",
            16,
            "#2b211d",
            500,
          ),
        },
        {
          title: createStyledTextDefault(
            "Good for repeats",
            16,
            "#2b211d",
            700,
          ),
          description: createStyledTextDefault(
            "Seasonal specials rotate, but the everyday favorites stay easy to find and reorder.",
            16,
            "#2b211d",
            500,
          ),
        },
      ],
    },
    render: WarmEditorialAboutSectionComponent,
  };
