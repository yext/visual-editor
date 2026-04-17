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

export type Hs1AlbanyOfficeContactFormSectionProps = {
  title: StyledTextProps;
  namePlaceholder: StyledTextProps;
  emailPlaceholder: StyledTextProps;
  phonePlaceholder: StyledTextProps;
  notesPlaceholder: StyledTextProps;
  privacyNote: StyledTextProps;
  submitText: StyledTextProps;
};

const fontWeightOptions = [
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

const textTransformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
] as const;

const createStyledTextObjectFields = () => ({
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
    options: [...fontWeightOptions],
  },
  textTransform: {
    label: "Text Transform",
    type: "select" as const,
    options: [...textTransformOptions],
  },
});

const createStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: text,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const cssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const Hs1AlbanyOfficeContactFormSectionFields: Fields<Hs1AlbanyOfficeContactFormSectionProps> =
  {
    title: {
      label: "Title",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    namePlaceholder: {
      label: "Name Placeholder",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    emailPlaceholder: {
      label: "Email Placeholder",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    phonePlaceholder: {
      label: "Phone Placeholder",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    notesPlaceholder: {
      label: "Notes Placeholder",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    privacyNote: {
      label: "Privacy Note",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    submitText: {
      label: "Submit Text",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
  };

export const Hs1AlbanyOfficeContactFormSectionComponent: PuckComponent<
  Hs1AlbanyOfficeContactFormSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown>;
  const locale = (streamDocument.locale as string) ?? "en";
  const title = resolveStyledText(props.title, locale, streamDocument);
  const namePlaceholder = resolveStyledText(
    props.namePlaceholder,
    locale,
    streamDocument,
  );
  const emailPlaceholder = resolveStyledText(
    props.emailPlaceholder,
    locale,
    streamDocument,
  );
  const phonePlaceholder = resolveStyledText(
    props.phonePlaceholder,
    locale,
    streamDocument,
  );
  const notesPlaceholder = resolveStyledText(
    props.notesPlaceholder,
    locale,
    streamDocument,
  );
  const privacyNote = resolveStyledText(
    props.privacyNote,
    locale,
    streamDocument,
  );
  const submitText = resolveStyledText(
    props.submitText,
    locale,
    streamDocument,
  );

  return (
    <section className="bg-[#e5c989] font-['Montserrat','Open_Sans',sans-serif]">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <h2
          className="mb-8 text-center leading-none"
          style={{
            fontSize: `${props.title.fontSize}px`,
            color: props.title.fontColor,
            fontWeight: props.title.fontWeight,
            textTransform: cssTextTransform(props.title.textTransform),
            letterSpacing: "1px",
          }}
        >
          {title}
        </h2>
        <form className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-3">
            <input
              aria-label={namePlaceholder}
              placeholder={namePlaceholder}
              className="h-10 w-full border border-white bg-white px-3 font-['Arial','Helvetica',sans-serif] text-[13px] text-[#4a4a4a] outline-none placeholder:text-[#7c7c7c]"
            />
            <input
              aria-label={emailPlaceholder}
              placeholder={emailPlaceholder}
              className="h-10 w-full border border-white bg-white px-3 font-['Arial','Helvetica',sans-serif] text-[13px] text-[#4a4a4a] outline-none placeholder:text-[#7c7c7c]"
            />
            <input
              aria-label={phonePlaceholder}
              placeholder={phonePlaceholder}
              className="h-10 w-full border border-white bg-white px-3 font-['Arial','Helvetica',sans-serif] text-[13px] text-[#4a4a4a] outline-none placeholder:text-[#7c7c7c]"
            />
          </div>
          <textarea
            aria-label={notesPlaceholder}
            placeholder={notesPlaceholder}
            rows={5}
            className="min-h-[136px] w-full border border-white bg-white px-3 py-3 font-['Arial','Helvetica',sans-serif] text-[13px] text-[#4a4a4a] outline-none placeholder:text-[#7c7c7c]"
          />
          <p
            className="col-span-full mb-0 text-center text-[10px]"
            style={{
              fontSize: `${props.privacyNote.fontSize}px`,
              color: props.privacyNote.fontColor,
              fontWeight: props.privacyNote.fontWeight,
              textTransform: cssTextTransform(props.privacyNote.textTransform),
            }}
          >
            {privacyNote}
          </p>
          <button
            type="button"
            className="col-span-full h-10 border border-white bg-transparent text-center transition-colors hover:bg-white/10"
            style={{
              fontSize: `${props.submitText.fontSize}px`,
              color: props.submitText.fontColor,
              fontWeight: props.submitText.fontWeight,
              textTransform: cssTextTransform(props.submitText.textTransform),
            }}
          >
            {submitText}
          </button>
        </form>
      </div>
    </section>
  );
};

export const Hs1AlbanyOfficeContactFormSection: ComponentConfig<Hs1AlbanyOfficeContactFormSectionProps> =
  {
    label: "Hs1 Albany Office Contact Form Section",
    fields: Hs1AlbanyOfficeContactFormSectionFields,
    defaultProps: {
      title: createStyledTextDefault(
        "Contact Us Today",
        28,
        "#ffffff",
        400,
        "uppercase",
      ),
      namePlaceholder: createStyledTextDefault(
        "Enter your name (Required)",
        13,
        "#7c7c7c",
        400,
      ),
      emailPlaceholder: createStyledTextDefault(
        "Enter email (Required)",
        13,
        "#7c7c7c",
        400,
      ),
      phonePlaceholder: createStyledTextDefault(
        "(XXX)XXX-XXXX (Required)",
        13,
        "#7c7c7c",
        400,
      ),
      notesPlaceholder: createStyledTextDefault(
        "Notes to the Doctor",
        13,
        "#7c7c7c",
        400,
      ),
      privacyNote: createStyledTextDefault(
        "Please do not submit any Protected Health Information (PHI).",
        10,
        "#ffffff",
        400,
      ),
      submitText: createStyledTextDefault(
        "Submit",
        12,
        "#ffffff",
        500,
        "uppercase",
      ),
    },
    render: Hs1AlbanyOfficeContactFormSectionComponent,
  };
