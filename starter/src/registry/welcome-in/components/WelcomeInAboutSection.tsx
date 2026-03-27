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

type AboutItem = {
  title: StyledTextProps;
  description: StyledTextProps;
};

export type WelcomeInAboutSectionProps = {
  heading: StyledTextProps;
  items: AboutItem[];
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

const createStyledTextField = (label: string): any => ({
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
      options: fontWeightOptions,
    },
    textTransform: {
      label: "Text Transform",
      type: "select",
      options: textTransformOptions,
    },
  },
});

const defaultStyledText = (
  value: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
) => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: value,
      hasLocalizedValue: "true" as const,
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, any>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const WelcomeInAboutSectionFields: Fields<WelcomeInAboutSectionProps> = {
  heading: createStyledTextField("Heading"),
  items: {
    label: "Items",
    type: "array",
    arrayFields: {
      title: createStyledTextField("Title"),
      description: createStyledTextField("Description"),
    },
    defaultItemProps: {
      title: defaultStyledText("About item title", 17, "#24324d", 800),
      description: defaultStyledText(
        "About item description",
        16,
        "#24324d",
        400,
      ),
    },
    getItemSummary: (item: AboutItem) =>
      (item as any)?.title?.text?.constantValue?.defaultValue || "Item",
  },
};

export const WelcomeInAboutSectionComponent: PuckComponent<
  WelcomeInAboutSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveStyledText(props.heading, locale, streamDocument);

  return (
    <section className="w-full bg-[#fffdfb] py-3">
      <div className="mx-auto w-full max-w-[1024px] px-6">
        <div className="mb-6 text-center">
          <h2
            className="m-0"
            style={{
              fontFamily: '"Baloo 2", "Trebuchet MS", sans-serif',
              fontSize: `${props.heading.fontSize}px`,
              color: props.heading.fontColor,
              fontWeight: props.heading.fontWeight,
              textTransform: toCssTextTransform(props.heading.textTransform),
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            {heading}
          </h2>
        </div>
        <div className="grid gap-6 rounded-[34px] border border-[#d8ebfb] bg-[#f1f8ff] p-8 md:grid-cols-3">
          {props.items.map((item, index) => {
            const title = resolveStyledText(item.title, locale, streamDocument);
            const description = resolveStyledText(
              item.description,
              locale,
              streamDocument,
            );

            return (
              <div key={`${title}-${index}`} className="grid gap-3">
                <h3
                  className="m-0"
                  style={{
                    fontFamily:
                      '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
                    fontSize: `${item.title.fontSize}px`,
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
                    fontFamily:
                      '"Atkinson Hyperlegible Next", "Trebuchet MS", sans-serif',
                    fontSize: `${item.description.fontSize}px`,
                    color: item.description.fontColor,
                    fontWeight: item.description.fontWeight,
                    textTransform: toCssTextTransform(
                      item.description.textTransform,
                    ),
                    lineHeight: 1.55,
                  }}
                >
                  {description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const WelcomeInAboutSection: ComponentConfig<WelcomeInAboutSectionProps> =
  {
    label: "Welcome In About Section",
    fields: WelcomeInAboutSectionFields,
    defaultProps: {
      heading: defaultStyledText(
        "A shop built around browsing together",
        35,
        "#24324d",
        800,
      ),
      items: [
        {
          title: defaultStyledText("By age and interest", 17, "#24324d", 800),
          description: defaultStyledText(
            "Sections are grouped so families can find picture books, first chapter books, and read-aloud picks quickly.",
            16,
            "#24324d",
            400,
          ),
        },
        {
          title: defaultStyledText("Staff favorites", 17, "#24324d", 800),
          description: defaultStyledText(
            "Handwritten notes and seasonal tables help turn a gift search into something more personal.",
            16,
            "#24324d",
            400,
          ),
        },
        {
          title: defaultStyledText(
            "Events that feel welcoming",
            17,
            "#24324d",
            800,
          ),
          description: defaultStyledText(
            "Storytimes, author visits, and quiet after-school browsing hours are part of the regular rhythm.",
            16,
            "#24324d",
            400,
          ),
        },
      ],
    },
    render: WelcomeInAboutSectionComponent,
  };
