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

type QuoteItem = {
  quote: StyledTextProps;
};

export type Hs1AlbanyTestimonialsSectionProps = {
  heading: StyledTextProps;
  quotes: QuoteItem[];
};

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
      type: "select" as const,
      options: [
        { label: "Normal", value: "normal" },
        { label: "Uppercase", value: "uppercase" },
        { label: "Lowercase", value: "lowercase" },
        { label: "Capitalize", value: "capitalize" },
      ],
    },
  },
});

const textDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"],
) => ({
  text: {
    field: "",
    constantValue: { en: text, hasLocalizedValue: "true" as const },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const Hs1AlbanyTestimonialsSectionFields: Fields<Hs1AlbanyTestimonialsSectionProps> =
  {
    heading: textField("Heading"),
    quotes: {
      label: "Quotes",
      type: "array",
      arrayFields: { quote: textField("Quote") },
      defaultItemProps: {
        quote: textDefault("Patient quote", 22, "#4a4a4a", 400, "normal"),
      },
      getItemSummary: () => "Quote",
    },
  };

export const Hs1AlbanyTestimonialsSectionComponent: PuckComponent<
  Hs1AlbanyTestimonialsSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const activeQuote = props.quotes[0];
  const quoteText =
    activeQuote &&
    resolveComponentData(activeQuote.quote.text, locale, streamDocument);

  return (
    <section className="bg-[#4f4e4e] px-6 py-12">
      <div className="mx-auto max-w-[1170px]">
        <h2
          className="mb-8 mt-0 text-center text-white"
          style={{
            fontFamily: "Montserrat, Open Sans, sans-serif",
            fontSize: `${props.heading.fontSize}px`,
            fontWeight: props.heading.fontWeight,
            letterSpacing: "1px",
            textTransform:
              props.heading.textTransform === "normal"
                ? undefined
                : props.heading.textTransform,
          }}
        >
          {heading}
        </h2>
        <div className="mx-auto max-w-[840px] bg-white px-8 py-10 text-center">
          <div className="mx-auto mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#d3a335] text-2xl text-white">
            “
          </div>
          <p className="m-0 text-[22px] leading-8 text-[#4a4a4a]">
            {quoteText}
          </p>
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyTestimonialsSection: ComponentConfig<Hs1AlbanyTestimonialsSectionProps> =
  {
    label: "HS1 Albany Testimonials Section",
    fields: Hs1AlbanyTestimonialsSectionFields,
    defaultProps: {
      heading: textDefault(
        "WHAT OUR PATIENTS SAY ABOUT US",
        28,
        "#ffffff",
        400,
        "uppercase",
      ),
      quotes: [
        {
          quote: textDefault(
            "Visiting Sunny Smiles Dental gives my family and me more reasons to smile.",
            22,
            "#4a4a4a",
            400,
            "normal",
          ),
        },
        {
          quote: textDefault(
            "Dr. Anderson provided me with excellent care when I needed it the most.",
            22,
            "#4a4a4a",
            400,
            "normal",
          ),
        },
        {
          quote: textDefault(
            "I'm confident in bringing my entire family to Sunny Smiles Dental!",
            22,
            "#4a4a4a",
            400,
            "normal",
          ),
        },
      ],
    },
    render: Hs1AlbanyTestimonialsSectionComponent,
  };
