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

export type Hs1LagunaOfferFormSectionProps = {
  title: StyledTextProps;
  caption: StyledTextProps;
  disclaimer: StyledTextProps;
};

const styledTextFields = (label: string) =>
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
  }) satisfies Fields<{ value: StyledTextProps }>["value"];

const Hs1LagunaOfferFormSectionFields: Fields<Hs1LagunaOfferFormSectionProps> =
  {
    title: styledTextFields("Title"),
    caption: styledTextFields("Caption"),
    disclaimer: styledTextFields("Disclaimer"),
  };

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const renderStyledText = (
  value: StyledTextProps,
  text: string,
  className?: string,
) => (
  <span
    className={className}
    style={{
      fontSize: `${value.fontSize}px`,
      color: value.fontColor,
      fontWeight: value.fontWeight,
      textTransform:
        value.textTransform === "normal" ? undefined : value.textTransform,
      fontFamily: "Roboto, Arial, Helvetica, sans-serif",
    }}
  >
    {text}
  </span>
);

const buildTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      en: text,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform: "normal",
});

export const Hs1LagunaOfferFormSectionComponent: PuckComponent<
  Hs1LagunaOfferFormSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown>;
  const locale =
    typeof streamDocument.locale === "string" ? streamDocument.locale : "en";

  const title = resolveStyledText(props.title, locale, streamDocument);
  const caption = resolveStyledText(props.caption, locale, streamDocument);
  const disclaimer = resolveStyledText(
    props.disclaimer,
    locale,
    streamDocument,
  );

  return (
    <section className="bg-[#6b3a2c] px-[7px] pb-[22px] text-white md:px-0">
      <div className="mx-auto max-w-[1140px] bg-[#6b3a2c] shadow-[0_5px_11px_2.5px_rgba(0,0,0,0.22)]">
        <div className="px-6 pb-[27px] pt-[27px] md:px-10 md:pt-[30px]">
          <div className="pb-[11px] text-center">
            <h2 className="m-0 block leading-[1.13]">
              {renderStyledText(props.title, title)}
            </h2>
            <h3 className="m-0 mt-[-14px] block leading-[1.222]">
              {renderStyledText(props.caption, caption)}
            </h3>
          </div>

          <form className="bg-[#755b53] px-6 pb-[27px] pt-5 md:px-10 md:pb-[30px] md:pt-10">
            <div className="grid grid-cols-1 gap-[10px] md:grid-cols-2">
              <input
                aria-label="Enter your name (Required)"
                placeholder="Enter your name (Required)"
                className="w-full rounded-none border border-white/20 bg-white px-4 py-3 text-[14px] text-[#4f4f4f] outline-none placeholder:text-[#8a8a8a]"
              />
              <input
                aria-label="Enter email (Required)"
                placeholder="Enter email (Required)"
                className="w-full rounded-none border border-white/20 bg-white px-4 py-3 text-[14px] text-[#4f4f4f] outline-none placeholder:text-[#8a8a8a]"
              />
              <input
                aria-label="(XXX)XXX-XXXX (Required)"
                placeholder="(XXX)XXX-XXXX (Required)"
                className="w-full rounded-none border border-white/20 bg-white px-4 py-3 text-[14px] text-[#4f4f4f] outline-none placeholder:text-[#8a8a8a] md:col-span-2"
              />
            </div>

            <div className="mt-4 text-center">
              {renderStyledText(
                props.disclaimer,
                disclaimer,
                "block text-[13px] leading-4",
              )}
            </div>

            <div className="mt-3 text-center">
              <button
                type="submit"
                className="inline-flex min-w-[184px] items-center justify-center border border-white bg-white px-6 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-[#6b3a2c]"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export const Hs1LagunaOfferFormSection: ComponentConfig<Hs1LagunaOfferFormSectionProps> =
  {
    label: "Exclusive Offer",
    fields: Hs1LagunaOfferFormSectionFields,
    defaultProps: {
      title: buildTextDefault("Exclusive Offer", 23, "#ffffff", 700),
      caption: buildTextDefault(
        "Sign up to receive special offers and discounts",
        18,
        "#adadad",
        500,
      ),
      disclaimer: buildTextDefault(
        "Please do not submit any Protected Health Information (PHI).",
        13,
        "#ffffff",
        400,
      ),
    },
    render: Hs1LagunaOfferFormSectionComponent,
  };
