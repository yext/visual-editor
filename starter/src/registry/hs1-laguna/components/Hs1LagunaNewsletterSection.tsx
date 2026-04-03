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

export type Hs1LagunaNewsletterSectionProps = {
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

const Hs1LagunaNewsletterSectionFields: Fields<Hs1LagunaNewsletterSectionProps> =
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

export const Hs1LagunaNewsletterSectionComponent: PuckComponent<
  Hs1LagunaNewsletterSectionProps
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
    <section className="bg-white px-[14px] py-0 md:px-0">
      <div className="mx-auto max-w-[1140px] bg-[#6b3a2c] px-0">
        <div className="px-[23px] pb-[20px] pt-[22px] md:px-10 md:pb-[24px] md:pt-[24px]">
          <div className="pb-[11px] text-center">
            <h2 className="m-0 block leading-[1.13]">
              {renderStyledText(props.title, title)}
            </h2>
            <h3 className="m-0 mt-0.5 block leading-[1.222]">
              {renderStyledText(props.caption, caption)}
            </h3>
          </div>

          <form className="bg-[#6b3a2c] px-0 pb-0 pt-0">
            <div className="grid grid-cols-1 gap-[10px] md:grid-cols-3">
              <input
                aria-label="Enter your name (Required)"
                placeholder="Enter your name (Required)"
                className="w-full rounded-none border border-white/20 bg-white px-3 py-2 text-[12px] text-[#4f4f4f] outline-none placeholder:text-[#8a8a8a]"
              />
              <input
                aria-label="Enter email (Required)"
                placeholder="Enter email (Required)"
                className="w-full rounded-none border border-white/20 bg-white px-3 py-2 text-[12px] text-[#4f4f4f] outline-none placeholder:text-[#8a8a8a]"
              />
              <input
                aria-label="(XXX)XXX-XXXX (Required)"
                placeholder="(XXX)XXX-XXXX (Required)"
                className="w-full rounded-none border border-white/20 bg-white px-3 py-2 text-[12px] text-[#4f4f4f] outline-none placeholder:text-[#8a8a8a]"
              />
            </div>

            <div className="mt-3 text-center">
              {renderStyledText(
                props.disclaimer,
                disclaimer,
                "block text-[11px] leading-4 text-white/90",
              )}
            </div>

            <div className="mt-2 text-center">
              <button
                type="submit"
                className="inline-flex min-w-[120px] items-center justify-center border border-white bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b3a2c]"
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

export const Hs1LagunaNewsletterSection: ComponentConfig<Hs1LagunaNewsletterSectionProps> =
  {
    label: "Newsletter Signup",
    fields: Hs1LagunaNewsletterSectionFields,
    defaultProps: {
      title: buildTextDefault("Newsletter Signup", 23, "#ffffff", 700),
      caption: buildTextDefault(
        "Sign up to receive our updates",
        18,
        "#d7c1bb",
        500,
      ),
      disclaimer: buildTextDefault(
        "Please do not submit any Protected Health Information (PHI).",
        13,
        "#ffffff",
        400,
      ),
    },
    render: Hs1LagunaNewsletterSectionComponent,
  };
