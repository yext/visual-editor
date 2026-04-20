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

type Paragraph = { body: StyledTextProps };

export type Hs1ChicagoWelcomeSectionProps = {
  heading: StyledTextProps;
  subheading: StyledTextProps;
  paragraphs: Paragraph[];
};

const weightOptions = [
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

const transformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
] as const;

const textField = (label: string) => ({
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
      options: [...weightOptions],
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: [...transformOptions],
    },
  },
});

const makeText = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"],
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: { en: text, hasLocalizedValue: "true" },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const cssTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

const fields: Fields<Hs1ChicagoWelcomeSectionProps> = {
  heading: textField("Heading"),
  subheading: textField("Subheading"),
  paragraphs: {
    label: "Paragraphs",
    type: "array",
    arrayFields: { body: textField("Body") },
    defaultItemProps: {
      body: makeText(
        "Welcome to Northside Dental.",
        16,
        "#5b5554",
        300,
        "normal",
      ),
    },
    getItemSummary: (_item, index = 0) => `Paragraph ${index + 1}`,
  },
};

export const Hs1ChicagoWelcomeSectionComponent: PuckComponent<
  Hs1ChicagoWelcomeSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolveText = (value: StyledTextProps) =>
    resolveComponentData(value.text, locale, streamDocument) || "";

  return (
    <section className="bg-white px-[16.43%] py-[58px] max-lg:px-10 max-md:px-6 max-md:py-12">
      <div className="mx-auto max-w-[980px]">
        <p
          className="m-0 text-center"
          style={{
            fontFamily: "'Oswald', Verdana, sans-serif",
            fontSize: `${props.heading.fontSize}px`,
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: cssTransform(props.heading.textTransform),
            lineHeight: 1.2,
          }}
        >
          {resolveText(props.heading)}
        </p>
        <p
          className="m-0 mt-2 text-center"
          style={{
            fontFamily: "'Hind', Arial, Helvetica, sans-serif",
            fontSize: `${props.subheading.fontSize}px`,
            color: props.subheading.fontColor,
            fontWeight: props.subheading.fontWeight,
            textTransform: cssTransform(props.subheading.textTransform),
            lineHeight: 1.45,
          }}
        >
          {resolveText(props.subheading)}
        </p>
        <div className="mt-6 space-y-4">
          {props.paragraphs.map((item, index) => (
            <p
              key={index}
              className="m-0 text-center md:text-left"
              style={{
                fontFamily: "'Hind', Arial, Helvetica, sans-serif",
                fontSize: `${item.body.fontSize}px`,
                color: item.body.fontColor,
                fontWeight: item.body.fontWeight,
                textTransform: cssTransform(item.body.textTransform),
                lineHeight: 1.72,
              }}
            >
              {resolveText(item.body)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Hs1ChicagoWelcomeSection: ComponentConfig<Hs1ChicagoWelcomeSectionProps> =
  {
    label: "HS1 Chicago Welcome Section",
    fields,
    defaultProps: {
      heading: makeText(
        "Welcome to Our Practice",
        18,
        "#1f1a19",
        500,
        "uppercase",
      ),
      subheading: makeText(
        "Welcome to Northside Dental, Your Dentist in Downers Grove, IL",
        26,
        "#1f1a19",
        300,
        "normal",
      ),
      paragraphs: [
        {
          body: makeText(
            "Welcome! The dental professionals at Northside Dental are pleased to welcome you to our practice. We want all our patients to be informed decision makers and fully understand any health issues you face.",
            15,
            "#5b5554",
            300,
            "normal",
          ),
        },
        {
          body: makeText(
            "Our web site also provides background about our staff, office hours, insurance policies, appointment procedures, maps and directions. We know how hectic life can be and are committed to making our practice convenient and accessible.",
            15,
            "#5b5554",
            300,
            "normal",
          ),
        },
        {
          body: makeText(
            "Please take a few moments to look through this site to get a better feel for Northside Dental's capabilities and services. Thank you.",
            15,
            "#5b5554",
            300,
            "normal",
          ),
        },
      ],
    },
    render: Hs1ChicagoWelcomeSectionComponent,
  };
