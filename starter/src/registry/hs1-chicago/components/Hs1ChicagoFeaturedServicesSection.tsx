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

type ServiceCard = {
  title: StyledTextProps;
  description: StyledTextProps;
  cta: { label: string; link: string };
};

export type Hs1ChicagoFeaturedServicesSectionProps = {
  heading: StyledTextProps;
  caption: StyledTextProps;
  cards: ServiceCard[];
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

const fields: Fields<Hs1ChicagoFeaturedServicesSectionProps> = {
  heading: textField("Heading"),
  caption: textField("Caption"),
  cards: {
    label: "Cards",
    type: "array",
    arrayFields: {
      title: textField("Title"),
      description: textField("Description"),
      cta: {
        label: "Call To Action",
        type: "object",
        objectFields: {
          label: { label: "Label", type: "text" },
          link: { label: "Link", type: "text" },
        },
      },
    },
    defaultItemProps: {
      title: makeText("General Dentistry", 22, "#000000", 500, "uppercase"),
      description: makeText(
        "Service description.",
        15,
        "#4b4644",
        300,
        "normal",
      ),
      cta: { label: "Learn More", link: "#" },
    },
    getItemSummary: (item) => item.cta?.label || "Card",
  },
};

export const Hs1ChicagoFeaturedServicesSectionComponent: PuckComponent<
  Hs1ChicagoFeaturedServicesSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolveText = (value: StyledTextProps) =>
    resolveComponentData(value.text, locale, streamDocument) || "";

  return (
    <section className="bg-white px-6 py-14 max-md:px-4 max-md:py-12">
      <div className="mx-auto max-w-[1140px]">
        <div className="text-center">
          <p
            className="m-0"
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
            className="m-0 mt-1"
            style={{
              fontFamily: "'Hind', Arial, Helvetica, sans-serif",
              fontSize: `${props.caption.fontSize}px`,
              color: props.caption.fontColor,
              fontWeight: props.caption.fontWeight,
              textTransform: cssTransform(props.caption.textTransform),
              lineHeight: 1.25,
            }}
          >
            {resolveText(props.caption)}
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {props.cards.map((card, index) => (
            <div key={index} className="relative bg-white p-8 text-center">
              <div className="pointer-events-none absolute inset-[10px] border border-[#815955]/20" />
              <div className="absolute left-1/2 top-0 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-[#815955] bg-[#c7a7a1] text-white [clip-path:polygon(50%_0%,100%_50%,50%_100%,0%_50%)]">
                <span className="rotate-45 text-sm">{index + 1}</span>
              </div>
              <div className="relative z-10">
                <p
                  className="m-0"
                  style={{
                    fontFamily: "'Oswald', Verdana, sans-serif",
                    fontSize: `${card.title.fontSize}px`,
                    color: card.title.fontColor,
                    fontWeight: card.title.fontWeight,
                    textTransform: cssTransform(card.title.textTransform),
                    lineHeight: 1.2,
                  }}
                >
                  {resolveText(card.title)}
                </p>
                <div className="mx-auto mt-3 h-px w-9 bg-[#815955]/20" />
                <p
                  className="m-0 mt-4"
                  style={{
                    fontFamily: "'Hind', Arial, Helvetica, sans-serif",
                    fontSize: `${card.description.fontSize}px`,
                    color: card.description.fontColor,
                    fontWeight: card.description.fontWeight,
                    textTransform: cssTransform(card.description.textTransform),
                    lineHeight: 1.6,
                  }}
                >
                  {resolveText(card.description)}
                </p>
                <div className="mt-6">
                  <Link cta={{ link: card.cta.link, linkType: "URL" }}>
                    <span
                      className="inline-flex min-w-[138px] items-center justify-center border border-[#815955] bg-[#acaba9] px-[10px] pb-[5px] pt-[9px] text-[16px] uppercase text-white transition-colors duration-150 hover:bg-[#815955]"
                      style={{
                        fontFamily: "'Oswald', Verdana, sans-serif",
                        lineHeight: 1.188,
                      }}
                    >
                      {card.cta.label}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Hs1ChicagoFeaturedServicesSection: ComponentConfig<Hs1ChicagoFeaturedServicesSectionProps> =
  {
    label: "HS1 Chicago Featured Services Section",
    fields,
    defaultProps: {
      heading: makeText("Featured Services", 28, "#1f1a19", 500, "uppercase"),
      caption: makeText("Click to find out more", 18, "#3f3a39", 300, "normal"),
      cards: [
        {
          title: makeText("General Dentistry", 22, "#000000", 500, "uppercase"),
          description: makeText(
            "Dentistry encompasses array of services and procedures with a common goal: to help you preserve your natural teeth, ensure your oral health, and keep you looking and feeling great.",
            15,
            "#4b4644",
            300,
            "normal",
          ),
          cta: {
            label: "Learn More",
            link: "https://www.ofc-chicago.com/articles/dear_doctor/category/47362",
          },
        },
        {
          title: makeText("Teeth Whitening", 22, "#000000", 500, "uppercase"),
          description: makeText(
            "Whitening procedures have effectively restored the smile of people with stained, dull, or discolored teeth.",
            15,
            "#4b4644",
            300,
            "normal",
          ),
          cta: {
            label: "Learn More",
            link: "https://www.ofc-chicago.com/articles/dear_doctor/509349-teeth-whitening",
          },
        },
        {
          title: makeText("Fillings", 22, "#000000", 500, "uppercase"),
          description: makeText(
            "Frequently asked questions: are dental amalgams safe? Is it possible to have an allergic reaction to amalgam?",
            15,
            "#4b4644",
            300,
            "normal",
          ),
          cta: {
            label: "Learn More",
            link: "https://www.ofc-chicago.com/articles/dear_doctor/509277-fillings",
          },
        },
        {
          title: makeText("Dental Implants", 22, "#000000", 500, "uppercase"),
          description: makeText(
            "Before development of dental implants, dentures were the only alternative to replacing a missing tooth or teeth.",
            15,
            "#4b4644",
            300,
            "normal",
          ),
          cta: {
            label: "Learn More",
            link: "https://www.ofc-chicago.com/articles/dear_doctor/category/47365",
          },
        },
      ],
    },
    render: Hs1ChicagoFeaturedServicesSectionComponent,
  };
