import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Link } from "@yext/pages-components";

const capturedMapImageUrl = new URL("../assets/map-crop.png", import.meta.url)
  .href;

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

export type Hs1AlbanyLocationSectionProps = {
  heading: StyledTextProps;
  subtitle: StyledTextProps;
};

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

const textDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"],
) => ({
  text: {
    field: "",
    constantValue: { en: text, hasLocalizedValue: "true" as const },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const Hs1AlbanyLocationSectionFields: Fields<Hs1AlbanyLocationSectionProps> = {
  heading: textField("Heading"),
  subtitle: textField("Subtitle"),
};

export const Hs1AlbanyLocationSectionComponent: PuckComponent<
  Hs1AlbanyLocationSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = (streamDocument as { locale?: string }).locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const subtitle =
    resolveComponentData(props.subtitle.text, locale, streamDocument) || "";
  const phone = "(877) 393-3348";
  const addressLines = ["3010 Highland Parkway", "Downers Grove, IL 60515, US"];

  return (
    <section className="bg-white">
      <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="bg-white px-8 py-12">
          <div className="mx-auto max-w-[420px]">
            <h2
              className="m-0 text-[#6f6f6f]"
              style={{
                fontFamily: "Montserrat, Open Sans, sans-serif",
                fontSize: `${props.heading.fontSize}px`,
                fontWeight: props.heading.fontWeight,
                textTransform:
                  props.heading.textTransform === "normal"
                    ? undefined
                    : props.heading.textTransform,
              }}
            >
              {heading}
            </h2>
            <p
              className="mb-0 mt-4 text-[#d3a335]"
              style={{
                fontFamily: "Montserrat, Open Sans, sans-serif",
                fontSize: `${props.subtitle.fontSize}px`,
              }}
            >
              {subtitle}
            </p>
            <div
              className="mt-8 space-y-6 text-[#4f4e4e]"
              style={{ fontFamily: "Montserrat, Open Sans, sans-serif" }}
            >
              <div>
                <div className="mb-1 flex items-end gap-1">
                  <span className="text-[26px] leading-none text-[#7b7b7b]">
                    --
                  </span>
                  <span className="text-[15px] font-bold uppercase tracking-[0.08em]">
                    mi
                  </span>
                </div>
                <div className="font-bold uppercase tracking-[0.08em]">
                  Primary Location
                </div>
              </div>
              <div>
                <div className="mb-2 font-bold uppercase tracking-[0.08em]">
                  Address
                </div>
                <p className="m-0">
                  {addressLines[0]}
                  <br />
                  {addressLines[1]}
                </p>
              </div>
              <div>
                <div className="mb-2 font-bold uppercase tracking-[0.08em]">
                  Contact Information
                </div>
                <Link
                  cta={{ link: `tel:${phone}`, linkType: "URL" }}
                  className="text-[#4f4e4e] no-underline"
                >
                  {phone}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="min-h-[420px] bg-[#ece9e3]">
          <img
            src={capturedMapImageUrl}
            alt=""
            className="h-full min-h-[420px] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyLocationSection: ComponentConfig<Hs1AlbanyLocationSectionProps> =
  {
    label: "HS1 Albany Location Section",
    fields: Hs1AlbanyLocationSectionFields,
    defaultProps: {
      heading: textDefault("OUR LOCATION", 28, "#6f6f6f", 400, "uppercase"),
      subtitle: textDefault("Find us on the map", 22, "#d3a335", 400, "normal"),
    },
    render: Hs1AlbanyLocationSectionComponent,
  };
