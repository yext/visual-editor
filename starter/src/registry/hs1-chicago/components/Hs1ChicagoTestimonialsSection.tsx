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

type Testimonial = {
  quote: StyledTextProps;
  source: StyledTextProps;
};

export type Hs1ChicagoTestimonialsSectionProps = {
  heading: StyledTextProps;
  caption: StyledTextProps;
  activeItemIndex: number;
  items: Testimonial[];
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

const fields: Fields<Hs1ChicagoTestimonialsSectionProps> = {
  heading: textField("Heading"),
  caption: textField("Caption"),
  activeItemIndex: { label: "Active Item Index", type: "number" },
  items: {
    label: "Items",
    type: "array",
    arrayFields: {
      quote: textField("Quote"),
      source: textField("Source"),
    },
    defaultItemProps: {
      quote: makeText(
        "Visiting Northside Dental gives my family more reasons to smile.",
        18,
        "#3f3a39",
        300,
        "normal",
      ),
      source: makeText("The Johnson Family", 15, "#3f3a39", 500, "uppercase"),
    },
    getItemSummary: (_item, index = 0) => `Item ${index + 1}`,
  },
};

export const Hs1ChicagoTestimonialsSectionComponent: PuckComponent<
  Hs1ChicagoTestimonialsSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const index = Math.max(
    0,
    Math.min(
      Math.round(props.activeItemIndex),
      Math.max(props.items.length - 1, 0),
    ),
  );
  const item = props.items[index];
  const resolveText = (value: StyledTextProps) =>
    resolveComponentData(value.text, locale, streamDocument) || "";

  return (
    <section className="bg-[#beb8b6] px-6 py-[60px] max-md:px-4 max-md:py-12">
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
        {item && (
          <div className="relative mx-auto mt-10 max-w-[820px] bg-white px-8 py-14 text-center max-md:px-6">
            <div className="pointer-events-none absolute inset-[10px] border border-[#c5bdbb]" />
            <p
              className="relative z-10 m-0"
              style={{
                fontFamily: "'Hind', Arial, Helvetica, sans-serif",
                fontSize: `${item.quote.fontSize}px`,
                color: item.quote.fontColor,
                fontWeight: item.quote.fontWeight,
                textTransform: cssTransform(item.quote.textTransform),
                lineHeight: 1.6,
              }}
            >
              &quot;{resolveText(item.quote)}&quot;
            </p>
            <p
              className="relative z-10 m-0 mt-4"
              style={{
                fontFamily: "'Oswald', Verdana, sans-serif",
                fontSize: `${item.source.fontSize}px`,
                color: item.source.fontColor,
                fontWeight: item.source.fontWeight,
                textTransform: cssTransform(item.source.textTransform),
                lineHeight: 1.2,
              }}
            >
              {resolveText(item.source)}
            </p>
          </div>
        )}
        <div className="mt-5 flex items-center justify-center gap-2">
          {props.items.map((_item, dotIndex) => (
            <span
              key={dotIndex}
              className={`block h-2.5 w-2.5 rounded-full ${
                dotIndex === index ? "bg-[#815955]" : "bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const Hs1ChicagoTestimonialsSection: ComponentConfig<Hs1ChicagoTestimonialsSectionProps> =
  {
    label: "HS1 Chicago Testimonials Section",
    fields,
    defaultProps: {
      heading: makeText("Testimonials", 28, "#ffffff", 500, "uppercase"),
      caption: makeText(
        "What Our Patients Say About Us",
        18,
        "#ffffff",
        300,
        "normal",
      ),
      activeItemIndex: 0,
      items: [
        {
          quote: makeText(
            "Visiting Northside Dental gives my family and me more reasons to smile.",
            18,
            "#3f3a39",
            300,
            "normal",
          ),
          source: makeText(
            "The Johnson Family",
            15,
            "#3f3a39",
            500,
            "uppercase",
          ),
        },
        {
          quote: makeText(
            "Dr. Smith provided me with excellent care when I needed it the most.",
            18,
            "#3f3a39",
            300,
            "normal",
          ),
          source: makeText("Jennifer R.", 15, "#3f3a39", 500, "uppercase"),
        },
      ],
    },
    render: Hs1ChicagoTestimonialsSectionComponent,
  };
