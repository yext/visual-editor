import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  Image,
  resolveComponentData,
  TranslatableAssetImage,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type LogoItem = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
};

export type Hs1ChicagoInsuranceSectionProps = {
  heading: StyledTextProps;
  logos: LogoItem[];
};

const weightOptions = [
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

const transformOptions = [
  { label: "Normal", value: "normal" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
] as const;

const textField = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    text: YextEntityFieldSelector<any, TranslatableString>({
      label: "Text",
      filter: { types: ["type.string"] },
    }),
    fontSize: { label: "Font Size", type: "number" as const },
    fontColor: { label: "Font Color", type: "text" as const },
    fontWeight: {
      label: "Font Weight",
      type: "select" as const,
      options: [...weightOptions],
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: [...transformOptions],
    },
  },
});

const makeText = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"],
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: { en: text, hasLocalizedValue: "true" },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const cssTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? undefined : value;

const fields: Fields<Hs1ChicagoInsuranceSectionProps> = {
  heading: textField("Heading"),
  logos: {
    label: "Logos",
    type: "array",
    arrayFields: {
      image: YextEntityFieldSelector<
        any,
        ImageType | ComplexImageType | TranslatableAssetImage
      >({
        label: "Image",
        filter: { types: ["type.image"] },
      }),
    },
    defaultItemProps: {
      image: {
        field: "",
        constantValue: {
          url: "https://cdcssl.ibsrv.net/ibimg/smb/135x135_80/webmgr/1o/q/x/_SHARED/Health_Logo1.png.webp?9d9b3c2d92fd1d9a59b4cc84811d8218",
          width: 135,
          height: 135,
        },
        constantValueEnabled: true,
      },
    },
    getItemSummary: (_item, index = 0) => `Logo ${index + 1}`,
  },
};

export const Hs1ChicagoInsuranceSectionComponent: PuckComponent<
  Hs1ChicagoInsuranceSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  return (
    <section className="bg-white px-6 py-[60px] max-md:px-4 max-md:py-12">
      <div className="mx-auto max-w-[975px]">
        <p
          className="m-0 text-center"
          style={{
            fontFamily: "'Oswald', Verdana, sans-serif",
            fontSize: `${props.heading.fontSize}px`,
            color: props.heading.fontColor,
            fontWeight: props.heading.fontWeight,
            textTransform: cssTransform(props.heading.textTransform),
            lineHeight: 1.2,
          }}
        >
          {resolveComponentData(props.heading.text, locale, streamDocument) ||
            ""}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {props.logos.map((logo, index) => {
            const resolvedImage = resolveComponentData(
              logo.image,
              locale,
              streamDocument,
            );

            return (
              <div
                key={index}
                className="flex items-center justify-center bg-white p-4"
              >
                {resolvedImage && (
                  <div className="[&_img]:max-h-[100px] [&_img]:w-auto">
                    <Image image={resolvedImage} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const Hs1ChicagoInsuranceSection: ComponentConfig<Hs1ChicagoInsuranceSectionProps> =
  {
    label: "HS1 Chicago Insurance Section",
    fields,
    defaultProps: {
      heading: makeText(
        "Accepted Dental Plans & Insurance",
        28,
        "#1f1a19",
        500,
        "uppercase",
      ),
      logos: [
        {
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/135x135_80/webmgr/1o/q/x/_SHARED/Health_Logo1.png.webp?9d9b3c2d92fd1d9a59b4cc84811d8218",
              width: 135,
              height: 135,
            },
            constantValueEnabled: true,
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/135x135_80/webmgr/1o/q/x/_SHARED/Health_Logo2.png.webp?0f63072bad5cca0403dba10a0ac2ae24",
              width: 135,
              height: 135,
            },
            constantValueEnabled: true,
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/135x135_80/webmgr/1o/q/x/_SHARED/Health_Logo3.png.webp?381eccc06e1014fe1377637d625aa995",
              width: 135,
              height: 135,
            },
            constantValueEnabled: true,
          },
        },
        {
          image: {
            field: "",
            constantValue: {
              url: "https://cdcssl.ibsrv.net/ibimg/smb/135x135_80/webmgr/1o/q/x/_SHARED/Health_Logo4.png.webp?4a8df823b854aef6ba213978fe03e36a",
              width: 135,
              height: 135,
            },
            constantValueEnabled: true,
          },
        },
      ],
    },
    render: Hs1ChicagoInsuranceSectionComponent,
  };
