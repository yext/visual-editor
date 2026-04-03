import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { Address, HoursTable } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

export type Hs1ChicagoLocationHoursSectionProps = {
  mapHeading: StyledTextProps;
  mapCaption: StyledTextProps;
  hoursHeading: StyledTextProps;
  hoursCaption: StyledTextProps;
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

const fields: Fields<Hs1ChicagoLocationHoursSectionProps> = {
  mapHeading: textField("Map Heading"),
  mapCaption: textField("Map Caption"),
  hoursHeading: textField("Hours Heading"),
  hoursCaption: textField("Hours Caption"),
};

export const Hs1ChicagoLocationHoursSectionComponent: PuckComponent<
  Hs1ChicagoLocationHoursSectionProps
> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolveText = (value: StyledTextProps) =>
    resolveComponentData(value.text, locale, streamDocument) || "";

  return (
    <section className="bg-white px-6 py-[60px] max-md:px-4 max-md:py-12">
      <div className="mx-auto grid max-w-[1140px] gap-8 lg:grid-cols-[51.3%_48.6%]">
        <div>
          <p
            className="m-0"
            style={{
              fontFamily: "'Oswald', Verdana, sans-serif",
              fontSize: `${props.mapHeading.fontSize}px`,
              color: props.mapHeading.fontColor,
              fontWeight: props.mapHeading.fontWeight,
              textTransform: cssTransform(props.mapHeading.textTransform),
              lineHeight: 1.2,
            }}
          >
            {resolveText(props.mapHeading)}
          </p>
          <p
            className="m-0 mt-1"
            style={{
              fontFamily: "'Hind', Arial, Helvetica, sans-serif",
              fontSize: `${props.mapCaption.fontSize}px`,
              color: props.mapCaption.fontColor,
              fontWeight: props.mapCaption.fontWeight,
              textTransform: cssTransform(props.mapCaption.textTransform),
              lineHeight: 1.25,
            }}
          >
            {resolveText(props.mapCaption)}
          </p>
          <div className="relative mt-6 border border-[#815955] bg-white p-[10px]">
            <div className="relative min-h-[355px] overflow-hidden bg-[linear-gradient(90deg,rgba(218,213,208,0.7)_1px,transparent_1px),linear-gradient(rgba(218,213,208,0.7)_1px,transparent_1px)] bg-[size:34px_34px] bg-[#efe6d5]">
              <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#815955]" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 p-4 text-sm text-[#4b4644] shadow-sm">
                {streamDocument.address ? (
                  <Address address={streamDocument.address} />
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div>
          <p
            className="m-0"
            style={{
              fontFamily: "'Oswald', Verdana, sans-serif",
              fontSize: `${props.hoursHeading.fontSize}px`,
              color: props.hoursHeading.fontColor,
              fontWeight: props.hoursHeading.fontWeight,
              textTransform: cssTransform(props.hoursHeading.textTransform),
              lineHeight: 1.2,
            }}
          >
            {resolveText(props.hoursHeading)}
          </p>
          <p
            className="m-0 mt-1"
            style={{
              fontFamily: "'Hind', Arial, Helvetica, sans-serif",
              fontSize: `${props.hoursCaption.fontSize}px`,
              color: props.hoursCaption.fontColor,
              fontWeight: props.hoursCaption.fontWeight,
              textTransform: cssTransform(props.hoursCaption.textTransform),
              lineHeight: 1.25,
            }}
          >
            {resolveText(props.hoursCaption)}
          </p>
          <div className="mt-6 bg-[#d6d0ce] p-6">
            {streamDocument.hours ? (
              <div className="bg-white/70 p-4 text-[#4b4644]">
                <HoursTable
                  hours={streamDocument.hours}
                  startOfWeek="sunday"
                  collapseDays={false}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Hs1ChicagoLocationHoursSection: ComponentConfig<Hs1ChicagoLocationHoursSectionProps> =
  {
    label: "HS1 Chicago Location Hours Section",
    fields,
    defaultProps: {
      mapHeading: makeText("Our Location", 28, "#1f1a19", 500, "uppercase"),
      mapCaption: makeText("Find us on the map", 18, "#3f3a39", 300, "normal"),
      hoursHeading: makeText(
        "Hours of Operation",
        28,
        "#1f1a19",
        500,
        "uppercase",
      ),
      hoursCaption: makeText(
        "Our Regular Schedule",
        18,
        "#3f3a39",
        300,
        "normal",
      ),
    },
    render: Hs1ChicagoLocationHoursSectionComponent,
  };
