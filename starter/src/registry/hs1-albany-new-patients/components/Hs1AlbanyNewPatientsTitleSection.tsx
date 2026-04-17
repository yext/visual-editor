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

export type Hs1AlbanyNewPatientsTitleSectionProps = {
  title: StyledTextProps;
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

const getTextTransformStyle = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

export const Hs1AlbanyNewPatientsTitleSectionFields: Fields<Hs1AlbanyNewPatientsTitleSectionProps> =
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
          options: [...fontWeightOptions],
        },
        textTransform: {
          label: "Text Transform",
          type: "select",
          options: [...textTransformOptions],
        },
      },
    },
  };

export const Hs1AlbanyNewPatientsTitleSectionComponent: PuckComponent<
  Hs1AlbanyNewPatientsTitleSectionProps
> = ({ title }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle =
    resolveComponentData(title.text, locale, streamDocument) || "";

  return (
    <section className="bg-[#d3a335] text-white">
      <div className="mx-auto max-w-[1170px] px-[15px] py-10 text-center">
        <h1
          className="m-0"
          style={{
            fontSize: `${title.fontSize}px`,
            color: title.fontColor,
            fontWeight: title.fontWeight,
            textTransform: getTextTransformStyle(title.textTransform),
            fontFamily: "Montserrat, 'Open Sans', sans-serif",
            lineHeight: 1.214,
            letterSpacing: "1px",
          }}
        >
          {resolvedTitle}
        </h1>
      </div>
    </section>
  );
};

export const Hs1AlbanyNewPatientsTitleSection: ComponentConfig<Hs1AlbanyNewPatientsTitleSectionProps> =
  {
    label: "Hs1 Albany New Patients Title Section",
    fields: Hs1AlbanyNewPatientsTitleSectionFields,
    defaultProps: {
      title: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "New Patients",
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
    render: Hs1AlbanyNewPatientsTitleSectionComponent,
  };
