import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextEntityField,
  YextEntityFieldSelector,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type BulletItemProps = {
  text: StyledTextProps;
};

export type CoastalCareAboutSectionProps = {
  heading: StyledTextProps;
  bulletItems: BulletItemProps[];
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

const toCssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const CoastalCareAboutSectionFields: Fields<CoastalCareAboutSectionProps> = {
  heading: styledTextFields("Heading"),
  bulletItems: {
    label: "Bullet Items",
    type: "array",
    arrayFields: {
      text: styledTextFields("Text"),
    },
    defaultItemProps: {
      text: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Bullet Item",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 16,
        fontColor: "#183347",
        fontWeight: 400,
        textTransform: "normal",
      },
    },
    getItemSummary: (item: any) =>
      item?.text?.text?.constantValue?.defaultValue || "Bullet Item",
  },
};

export const CoastalCareAboutSectionComponent: PuckComponent<
  CoastalCareAboutSectionProps
> = ({ heading, bulletItems }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  const resolvedHeading =
    resolveComponentData(heading.text, locale, streamDocument) || "";

  return (
    <section className="mx-auto w-full max-w-[1024px] px-6 py-6">
      <div className="grid items-start gap-8 rounded-[24px] bg-[#eef6f7] p-8 md:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h2
            className="m-0 font-['DM_Serif_Display','Times_New_Roman',serif] leading-none"
            style={{
              fontSize: `${heading.fontSize}px`,
              color: heading.fontColor,
              fontWeight: heading.fontWeight,
              textTransform: toCssTextTransform(heading.textTransform),
            }}
          >
            {resolvedHeading}
          </h2>
        </div>
        <ul className="m-0 grid list-disc gap-4 pl-[18px] marker:text-[#183347]">
          {bulletItems.map((item, index) => {
            const resolvedItemText =
              resolveComponentData(item.text.text, locale, streamDocument) ||
              "";

            return (
              <li
                key={`${resolvedItemText}-${index}`}
                className="list-item font-['Public_Sans','Open_Sans',sans-serif] leading-[1.55]"
                style={{
                  fontSize: `${item.text.fontSize}px`,
                  color: item.text.fontColor,
                  fontWeight: item.text.fontWeight,
                  textTransform: toCssTextTransform(item.text.textTransform),
                }}
              >
                {resolvedItemText}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export const CoastalCareAboutSection: ComponentConfig<CoastalCareAboutSectionProps> =
  {
    label: "Coastal Care About Section",
    fields: CoastalCareAboutSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Care that keeps the visit clear and low-stress",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 35,
        fontColor: "#183347",
        fontWeight: 400,
        textTransform: "normal",
      },
      bulletItems: [
        {
          text: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Appointments are paced so clients have time to ask questions before they leave.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          text: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "Preventive care, diagnostics, and follow-up planning stay coordinated in one local office.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
        {
          text: {
            text: {
              field: "",
              constantValue: {
                defaultValue:
                  "New client visits include practical care guidance rather than a rushed handoff.",
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
            fontSize: 16,
            fontColor: "#183347",
            fontWeight: 400,
            textTransform: "normal",
          },
        },
      ],
    },
    render: CoastalCareAboutSectionComponent,
  };
