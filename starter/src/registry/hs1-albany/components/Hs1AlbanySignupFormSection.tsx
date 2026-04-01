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

export type Hs1AlbanySignupFormSectionProps = {
  heading: StyledTextProps;
};

const Hs1AlbanySignupFormSectionFields: Fields<Hs1AlbanySignupFormSectionProps> =
  {
    heading: {
      label: "Heading",
      type: "object",
      objectFields: {
        text: YextEntityFieldSelector<any, TranslatableString>({
          label: "Text",
          filter: { types: ["type.string"] },
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
    },
  };

export const Hs1AlbanySignupFormSectionComponent: PuckComponent<
  Hs1AlbanySignupFormSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";

  return (
    <section className="bg-[#e5c989] px-6 py-10">
      <div className="mx-auto max-w-[1170px]">
        <h2
          className="mb-8 mt-0 text-center"
          style={{
            fontFamily: "Montserrat, Open Sans, sans-serif",
            fontSize: `${props.heading.fontSize}px`,
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform:
              props.heading.textTransform === "normal"
                ? undefined
                : props.heading.textTransform,
            letterSpacing: "1px",
            lineHeight: "1.2",
          }}
        >
          {heading}
        </h2>
        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <input
            className="h-[44px] border border-white/80 bg-transparent px-3 text-[13px] text-white placeholder:text-white/80"
            placeholder="Enter your name (Required)"
          />
          <input
            className="h-[44px] border border-white/80 bg-transparent px-3 text-[13px] text-white placeholder:text-white/80"
            placeholder="Enter email (Required)"
          />
          <button
            type="button"
            className="h-[44px] border border-white/80 px-8 text-[13px] font-bold uppercase tracking-[0.08em] text-white"
            style={{ fontFamily: "Nunito Sans, Open Sans, sans-serif" }}
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
};

export const Hs1AlbanySignupFormSection: ComponentConfig<Hs1AlbanySignupFormSectionProps> =
  {
    label: "HS1 Albany Signup Form Section",
    fields: Hs1AlbanySignupFormSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            en: "SIGN UP TODAY FOR SPECIAL DISCOUNTS",
            hasLocalizedValue: "true" as const,
          },
          constantValueEnabled: true,
        },
        fontSize: 28,
        fontColor: "#ffffff",
        fontWeight: 400,
        textTransform: "uppercase",
      },
    },
    render: Hs1AlbanySignupFormSectionComponent,
  };
