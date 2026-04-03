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

type FormField = {
  placeholder: string;
  inputType: "text" | "email" | "tel";
};

export type Hs1ChicagoOfferSectionProps = {
  heading: StyledTextProps;
  caption: StyledTextProps;
  fields: FormField[];
  disclaimer: StyledTextProps;
  submitLabel: string;
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

const fields: Fields<Hs1ChicagoOfferSectionProps> = {
  heading: textField("Heading"),
  caption: textField("Caption"),
  fields: {
    label: "Fields",
    type: "array",
    arrayFields: {
      placeholder: { label: "Placeholder", type: "text" },
      inputType: {
        label: "Input Type",
        type: "select",
        options: [
          { label: "Text", value: "text" },
          { label: "Email", value: "email" },
          { label: "Telephone", value: "tel" },
        ],
      },
    },
    defaultItemProps: {
      placeholder: "Enter your name (Required)",
      inputType: "text",
    },
    getItemSummary: (item) => item.placeholder || "Field",
  },
  disclaimer: textField("Disclaimer"),
  submitLabel: { label: "Submit Label", type: "text" },
};

export const Hs1ChicagoOfferSectionComponent: PuckComponent<
  Hs1ChicagoOfferSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolveText = (value: StyledTextProps) =>
    resolveComponentData(value.text, locale, streamDocument) || "";

  return (
    <section className="bg-[#d0c0bd] px-6 py-14 max-md:px-4 max-md:py-12">
      <div className="mx-auto max-w-[640px] text-center">
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
        <form className="mt-7 space-y-3">
          {props.fields.map((field, index) => (
            <input
              key={`${field.placeholder}-${index}`}
              type={field.inputType}
              placeholder={field.placeholder}
              className="block w-full border border-white/80 bg-white/85 px-4 py-3 text-sm text-[#5b5554] placeholder:text-[#8f8786]"
            />
          ))}
          <p
            className="m-0 pt-1 text-center"
            style={{
              fontFamily: "'Hind', Arial, Helvetica, sans-serif",
              fontSize: `${props.disclaimer.fontSize}px`,
              color: props.disclaimer.fontColor,
              fontWeight: props.disclaimer.fontWeight,
              textTransform: cssTransform(props.disclaimer.textTransform),
              lineHeight: 1.15,
            }}
          >
            {resolveText(props.disclaimer)}
          </p>
          <button
            type="button"
            className="inline-flex min-w-[138px] items-center justify-center border border-[#815955] bg-[#acaba9] px-[10px] pb-[5px] pt-[9px] text-[16px] uppercase text-white transition-colors duration-150 hover:bg-[#815955]"
            style={{
              fontFamily: "'Oswald', Verdana, sans-serif",
              lineHeight: 1.188,
            }}
          >
            {props.submitLabel}
          </button>
        </form>
      </div>
    </section>
  );
};

export const Hs1ChicagoOfferSection: ComponentConfig<Hs1ChicagoOfferSectionProps> =
  {
    label: "HS1 Chicago Offer Section",
    fields,
    defaultProps: {
      heading: makeText("Exclusive Offer", 28, "#ffffff", 500, "uppercase"),
      caption: makeText(
        "Sign up to receive special offers and discounts",
        18,
        "#ffffff",
        300,
        "normal",
      ),
      fields: [
        { placeholder: "Enter your name (Required)", inputType: "text" },
        { placeholder: "Enter email (Required)", inputType: "email" },
        { placeholder: "(XXX)XXX-XXXX (Required)", inputType: "tel" },
      ],
      disclaimer: makeText(
        "Please do not submit any Protected Health Information (PHI).",
        14,
        "#ffffff",
        400,
        "normal",
      ),
      submitLabel: "Submit",
    },
    render: Hs1ChicagoOfferSectionComponent,
  };
