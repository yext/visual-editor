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

type FauxFieldItem = {
  label: StyledTextProps;
};

export type Hs1AlbanyStaffContactFormSectionProps = {
  title: StyledTextProps;
  inputFields: FauxFieldItem[];
  notesField: StyledTextProps;
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

const toCssTextTransform = (
  value: StyledTextProps["textTransform"],
): "none" | "uppercase" | "lowercase" | "capitalize" =>
  value === "normal" ? "none" : value;

export const Hs1AlbanyStaffContactFormSectionFields: Fields<Hs1AlbanyStaffContactFormSectionProps> =
  {
    title: styledTextFields("Title"),
    inputFields: {
      label: "Input Fields",
      type: "array",
      defaultItemProps: {
        label: {
          text: {
            field: "",
            constantValue: {
              defaultValue: "Enter your field",
              hasLocalizedValue: "true",
            },
            constantValueEnabled: true,
          },
          fontSize: 18,
          fontColor: "#9b9b9b",
          fontWeight: 400,
          textTransform: "normal",
        },
      },
      arrayFields: {
        label: styledTextFields("Label"),
      },
    },
    notesField: styledTextFields("Notes Field"),
    disclaimer: styledTextFields("Disclaimer"),
    submitLabel: { label: "Submit Label", type: "text" },
  };

const resolveStyledText = (
  textField: StyledTextProps,
  locale: string,
  streamDocument: Record<string, any>,
) => resolveComponentData(textField.text, locale, streamDocument) || "";

export const Hs1AlbanyStaffContactFormSectionComponent: PuckComponent<
  Hs1AlbanyStaffContactFormSectionProps
> = ({ title, inputFields, notesField, disclaimer, submitLabel }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle = resolveStyledText(title, locale, streamDocument);
  const resolvedNotes = resolveStyledText(notesField, locale, streamDocument);
  const resolvedDisclaimer = resolveStyledText(
    disclaimer,
    locale,
    streamDocument,
  );

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="absolute inset-0 bg-[#e5c989]" />
      <div className="relative mx-auto max-w-[1140px] px-[15px] py-[50px]">
        <h2
          className="mb-[14px] mt-0 text-center"
          style={{
            fontFamily: '"Montserrat", "Open Sans", sans-serif',
            fontSize: `${title.fontSize}px`,
            color: title.fontColor,
            fontWeight: title.fontWeight,
            lineHeight: "28px",
            letterSpacing: "1px",
            textTransform: toCssTextTransform(title.textTransform),
          }}
        >
          {resolvedTitle}
        </h2>
        <div className="mt-[30px] grid gap-[30px] lg:grid-cols-[48%_48%] lg:justify-between">
          <div className="flex flex-col gap-[15px]">
            {inputFields.map((field, index) => {
              const resolvedLabel = resolveStyledText(
                field.label,
                locale,
                streamDocument,
              );

              return (
                <div
                  key={`${resolvedLabel}-${index}`}
                  className="flex h-[50px] items-center bg-white px-[15px]"
                  style={{
                    fontFamily:
                      '"Lato", "Open Sans", Arial, Helvetica, sans-serif',
                    fontSize: `${field.label.fontSize}px`,
                    color: field.label.fontColor,
                    fontWeight: field.label.fontWeight,
                    lineHeight: "26px",
                    textTransform: toCssTextTransform(
                      field.label.textTransform,
                    ),
                  }}
                >
                  {resolvedLabel}
                </div>
              );
            })}
          </div>
          <div
            className="min-h-[190px] bg-white px-[15px] py-[10px]"
            style={{
              fontFamily: '"Lato", "Open Sans", Arial, Helvetica, sans-serif',
              fontSize: `${notesField.fontSize}px`,
              color: notesField.fontColor,
              fontWeight: notesField.fontWeight,
              lineHeight: "26px",
              textTransform: toCssTextTransform(notesField.textTransform),
            }}
          >
            {resolvedNotes}
          </div>
        </div>
        <p
          className="mb-[16px] mt-[30px] text-center"
          style={{
            fontFamily:
              '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: `${disclaimer.fontSize}px`,
            color: disclaimer.fontColor,
            fontWeight: disclaimer.fontWeight,
            lineHeight: "21px",
            textTransform: toCssTextTransform(disclaimer.textTransform),
          }}
        >
          {resolvedDisclaimer}
        </p>
        <button
          type="button"
          className="h-[50px] w-full border border-white bg-transparent text-center text-[15px] font-bold uppercase tracking-[1px] text-white [font-family:'Nunito_Sans','Open_Sans',sans-serif]"
        >
          {submitLabel}
        </button>
      </div>
    </section>
  );
};

export const Hs1AlbanyStaffContactFormSection: ComponentConfig<Hs1AlbanyStaffContactFormSectionProps> =
  {
    label: "HS1 Albany Staff Contact Form Section",
    fields: Hs1AlbanyStaffContactFormSectionFields,
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
      inputFields: [
        {
          label: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Enter your name (Required)",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 18,
            fontColor: "#9b9b9b",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          label: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "Enter email (Required)",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 18,
            fontColor: "#9b9b9b",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          label: {
            text: {
              field: "",
              constantValue: {
                defaultValue: "(XXX)XXX-XXXX (Required)",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 18,
            fontColor: "#9b9b9b",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
      ],
      notesField: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Notes to the Doctor",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 18,
        fontColor: "#9b9b9b",
        fontWeight: 400,
        textTransform: "normal",
      },
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
      submitLabel: "Submit",
    },
    render: Hs1AlbanyStaffContactFormSectionComponent,
  };
