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

export type Hs1AlbanyContactFormSectionProps = {
  heading: StyledTextProps;
};

const Hs1AlbanyContactFormSectionFields: Fields<Hs1AlbanyContactFormSectionProps> =
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

export const Hs1AlbanyContactFormSectionComponent: PuckComponent<
  Hs1AlbanyContactFormSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";

  return (
    <section className="bg-[#e5c989] px-6 py-12">
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
          }}
        >
          {heading}
        </h2>
        <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <input
              className="h-[44px] w-full border border-white/80 bg-transparent px-3 text-[13px] text-white placeholder:text-white/80"
              placeholder="Enter your name (Required)"
            />
            <input
              className="h-[44px] w-full border border-white/80 bg-transparent px-3 text-[13px] text-white placeholder:text-white/80"
              placeholder="Enter email (Required)"
            />
            <input
              className="h-[44px] w-full border border-white/80 bg-transparent px-3 text-[13px] text-white placeholder:text-white/80"
              placeholder="(XXX)XXX-XXXX (Required)"
            />
          </div>
          <textarea
            className="min-h-[164px] w-full border border-white/80 bg-transparent px-3 py-3 text-[13px] text-white placeholder:text-white/80"
            placeholder="Notes to the Doctor"
          />
        </form>
        <p
          className="mb-0 mt-5 text-center text-[12px] text-white"
          style={{ fontFamily: "Montserrat, Open Sans, sans-serif" }}
        >
          Please do not submit any Protected Health Information (PHI).
        </p>
        <div className="mt-5 text-center">
          <button
            type="button"
            className="inline-flex h-[44px] min-w-[220px] items-center justify-center border border-white/80 px-8 text-[13px] font-bold uppercase tracking-[0.08em] text-white"
            style={{ fontFamily: "Nunito Sans, Open Sans, sans-serif" }}
          >
            Submit
          </button>
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyContactFormSection: ComponentConfig<Hs1AlbanyContactFormSectionProps> =
  {
    label: "HS1 Albany Contact Form Section",
    fields: Hs1AlbanyContactFormSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            en: "CONTACT US TODAY",
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
    render: Hs1AlbanyContactFormSectionComponent,
  };
