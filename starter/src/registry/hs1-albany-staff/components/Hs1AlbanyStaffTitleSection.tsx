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

export type Hs1AlbanyStaffTitleSectionProps = {
  title: StyledTextProps;
};

export const Hs1AlbanyStaffTitleSectionFields: Fields<Hs1AlbanyStaffTitleSectionProps> =
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

export const Hs1AlbanyStaffTitleSectionComponent: PuckComponent<
  Hs1AlbanyStaffTitleSectionProps
> = ({ title }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle =
    resolveComponentData(title.text, locale, streamDocument) || "";
  const textTransform =
    title.textTransform === "normal" ? "none" : title.textTransform;

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="absolute inset-0 bg-[#e5c989]" />
      <div className="relative mx-auto max-w-[1140px] px-[15px]">
        <h1
          className="m-0 pb-[20px] pt-0"
          style={{
            fontFamily: '"Montserrat", "Open Sans", sans-serif',
            fontSize: `${title.fontSize}px`,
            color: title.fontColor,
            fontWeight: title.fontWeight,
            lineHeight: "38px",
            letterSpacing: "1px",
            textTransform,
          }}
        >
          {resolvedTitle}
        </h1>
      </div>
    </section>
  );
};

export const Hs1AlbanyStaffTitleSection: ComponentConfig<Hs1AlbanyStaffTitleSectionProps> =
  {
    label: "HS1 Albany Staff Title Section",
    fields: Hs1AlbanyStaffTitleSectionFields,
    defaultProps: {
      title: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Dental Staff",
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
    render: Hs1AlbanyStaffTitleSectionComponent,
  };
