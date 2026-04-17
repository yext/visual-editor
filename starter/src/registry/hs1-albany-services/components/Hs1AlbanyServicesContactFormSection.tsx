import {
  type ComponentConfig,
  type Fields,
  type PuckComponent,
} from "@puckeditor/core";
import {
  type TranslatableString,
  resolveComponentData,
  useDocument,
  type YextEntityField,
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
  type: "text" | "email" | "tel";
};

export type Hs1AlbanyServicesContactFormSectionProps = {
  title: StyledTextProps;
  formFields: FormField[];
  messagePlaceholder: string;
  disclaimer: StyledTextProps;
  submitLabel: string;
};

const styledTextFields = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    text: YextEntityFieldSelector<any, TranslatableString>({
      label: "Text",
      filter: {
        types: ["type.string"],
      },
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

export const Hs1AlbanyServicesContactFormSectionFields: Fields<Hs1AlbanyServicesContactFormSectionProps> =
  {
    title: styledTextFields("Title"),
    formFields: {
      label: "Form Fields",
      type: "array",
      arrayFields: {
        placeholder: { label: "Placeholder", type: "text" },
        type: {
          label: "Type",
          type: "select",
          options: [
            { label: "Text", value: "text" },
            { label: "Email", value: "email" },
            { label: "Tel", value: "tel" },
          ],
        },
      },
      defaultItemProps: {
        placeholder: "Enter your name (Required)",
        type: "text",
      },
    },
    messagePlaceholder: { label: "Message Placeholder", type: "text" },
    disclaimer: styledTextFields("Disclaimer"),
    submitLabel: { label: "Submit Label", type: "text" },
  };

export const Hs1AlbanyServicesContactFormSectionComponent: PuckComponent<
  Hs1AlbanyServicesContactFormSectionProps
> = ({ title, formFields, messagePlaceholder, disclaimer, submitLabel }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle =
    resolveComponentData(title.text, locale, streamDocument) || "";
  const resolvedDisclaimer =
    resolveComponentData(disclaimer.text, locale, streamDocument) || "";
  const titleTextTransform =
    title.textTransform === "normal" ? undefined : title.textTransform;
  const disclaimerTextTransform =
    disclaimer.textTransform === "normal"
      ? undefined
      : disclaimer.textTransform;

  return (
    <section className="bg-[#e5c989]">
      <div className="mx-auto max-w-[1170px] px-6 py-[72px]">
        <h2
          className="mb-[36px] mt-0 text-center"
          style={{
            fontFamily: "'Montserrat', 'Open Sans', sans-serif",
            fontSize: `${title.fontSize}px`,
            color: title.fontColor,
            fontWeight: title.fontWeight,
            textTransform: titleTextTransform,
            lineHeight: 1.2,
            letterSpacing: "1px",
          }}
        >
          {resolvedTitle}
        </h2>

        <form
          className="space-y-8"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="grid gap-11 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-14">
              {formFields.map((field, index) => (
                <input
                  key={`${field.placeholder}-${index}`}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="block h-[43px] w-full border-0 bg-white px-4 text-[17px] text-[#9a9a9a] shadow-none outline-none placeholder:text-[#9a9a9a]"
                  style={{
                    fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
                    fontWeight: 700,
                  }}
                />
              ))}
            </div>

            <textarea
              rows={7}
              placeholder={messagePlaceholder}
              className="min-h-[185px] w-full border-0 bg-white px-4 py-3 text-[17px] text-[#9a9a9a] outline-none placeholder:text-[#9a9a9a]"
              style={{
                fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
                fontWeight: 700,
              }}
            />
          </div>

          <p
            className="m-0 text-center"
            style={{
              fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
              fontSize: `${disclaimer.fontSize}px`,
              color: disclaimer.fontColor,
              fontWeight: disclaimer.fontWeight,
              textTransform: disclaimerTextTransform,
              lineHeight: 1.4,
            }}
          >
            {resolvedDisclaimer}
          </p>

          <button
            type="submit"
            className="block h-[51px] w-full border border-white bg-transparent text-center text-white transition-colors duration-150 hover:bg-white hover:text-[#d3a335]"
            style={{
              fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "1px",
            }}
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </section>
  );
};

export const Hs1AlbanyServicesContactFormSection: ComponentConfig<Hs1AlbanyServicesContactFormSectionProps> =
  {
    label: "HS1 Albany Services Contact Form Section",
    fields: Hs1AlbanyServicesContactFormSectionFields,
    defaultProps: {
      title: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Contact Us Today",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 28,
        fontColor: "#ffffff",
        fontWeight: 400,
        textTransform: "uppercase",
      },
      formFields: [
        { placeholder: "Enter your name (Required)", type: "text" },
        { placeholder: "Enter email (Required)", type: "email" },
        { placeholder: "(XXX)XXX-XXXX (Required)", type: "tel" },
      ],
      messagePlaceholder: "Notes to the Doctor",
      disclaimer: {
        text: {
          field: "",
          constantValue: {
            defaultValue:
              "Please do not submit any Protected Health Information (PHI).",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 14,
        fontColor: "#ffffff",
        fontWeight: 400,
        textTransform: "normal",
      },
      submitLabel: "SUBMIT",
    },
    render: Hs1AlbanyServicesContactFormSectionComponent,
  };
