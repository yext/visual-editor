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

export type Hs1AlbanyServicesTitleSectionProps = {
  title: StyledTextProps;
};

export const Hs1AlbanyServicesTitleSectionFields: Fields<Hs1AlbanyServicesTitleSectionProps> =
  {
    title: {
      label: "Title",
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
    },
  };

export const Hs1AlbanyServicesTitleSectionComponent: PuckComponent<
  Hs1AlbanyServicesTitleSectionProps
> = ({ title }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle =
    resolveComponentData(title.text, locale, streamDocument) || "";
  const titleTextTransform =
    title.textTransform === "normal" ? undefined : title.textTransform;

  return (
    <section className="bg-[#e5c989]">
      <div className="mx-auto max-w-[1170px] px-6 pb-[18px] pt-[6px]">
        <h1
          className="m-0"
          style={{
            fontFamily: "'Montserrat', 'Open Sans', sans-serif",
            fontSize: `${title.fontSize}px`,
            color: title.fontColor,
            fontWeight: title.fontWeight,
            textTransform: titleTextTransform,
            letterSpacing: "1px",
            lineHeight: 1.2,
          }}
        >
          {resolvedTitle}
        </h1>
      </div>
    </section>
  );
};

export const Hs1AlbanyServicesTitleSection: ComponentConfig<Hs1AlbanyServicesTitleSectionProps> =
  {
    label: "HS1 Albany Services Title Section",
    fields: Hs1AlbanyServicesTitleSectionFields,
    defaultProps: {
      title: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Dental Services",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 28,
        fontColor: "#ffffff",
        fontWeight: 400,
        textTransform: "uppercase",
      },
    },
    render: Hs1AlbanyServicesTitleSectionComponent,
  };
