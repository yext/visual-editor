import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { DayType, HoursType } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

type HoursDataProps = {
  hours: YextEntityField<HoursType>;
};

export type Hs1AlbanyNewPatientsHoursSectionProps = {
  title: StyledTextProps;
  subtitle: StyledTextProps;
  data: HoursDataProps;
};

const orderedDays = [
  ["monday", "Monday"],
  ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"],
  ["thursday", "Thursday"],
  ["friday", "Friday"],
  ["saturday", "Saturday"],
  ["sunday", "Sunday"],
] as const;

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

const createStyledTextField = (label: string) => ({
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
      options: [...fontWeightOptions],
    },
    textTransform: {
      label: "Text Transform",
      type: "select" as const,
      options: [...textTransformOptions],
    },
  },
});

const formatTime = (value: string) => {
  const [hoursValue, minutes] = value.split(":").map((part) => Number(part));
  const suffix = hoursValue >= 12 ? "pm" : "am";
  const twelveHour = hoursValue % 12 === 0 ? 12 : hoursValue % 12;

  return `${twelveHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const formatHours = (day?: DayType) => {
  if (
    !day ||
    day.isClosed ||
    !day.openIntervals ||
    day.openIntervals.length === 0
  ) {
    return "Closed";
  }

  return day.openIntervals
    .map(
      (interval) =>
        `${formatTime(interval.start)} - ${formatTime(interval.end)}`,
    )
    .join(", ");
};

export const Hs1AlbanyNewPatientsHoursSectionFields: Fields<Hs1AlbanyNewPatientsHoursSectionProps> =
  {
    title: createStyledTextField("Title"),
    subtitle: createStyledTextField("Subtitle"),
    data: {
      label: "Data",
      type: "object",
      objectFields: {
        hours: YextEntityFieldSelector<any, HoursType>({
          label: "Hours",
          filter: {
            types: ["type.hours"],
          },
        }),
      },
    },
  };

export const Hs1AlbanyNewPatientsHoursSectionComponent: PuckComponent<
  Hs1AlbanyNewPatientsHoursSectionProps
> = ({ title, subtitle, data }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle =
    resolveComponentData(title.text, locale, streamDocument) || "";
  const resolvedSubtitle =
    resolveComponentData(subtitle.text, locale, streamDocument) || "";
  const resolvedHours = resolveComponentData(
    data.hours,
    locale,
    streamDocument,
  );

  return (
    <section className="bg-[#f3f3f3] text-[#4a4a4a]">
      <div className="mx-auto max-w-[1170px] px-[15px] py-[50px]">
        <div className="text-center">
          <h2
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
          </h2>
          <p
            className="mb-[30px] mt-[5px]"
            style={{
              fontSize: `${subtitle.fontSize}px`,
              color: subtitle.fontColor,
              fontWeight: subtitle.fontWeight,
              textTransform: getTextTransformStyle(subtitle.textTransform),
              fontFamily: "Montserrat, 'Open Sans', sans-serif",
              lineHeight: 1.273,
              letterSpacing: "1.5px",
            }}
          >
            {resolvedSubtitle}
          </p>
        </div>

        <div className="mt-[30px] hidden grid-cols-7 overflow-hidden lg:grid">
          {orderedDays.map(([key, label], index) => (
            <div
              key={key}
              className={`px-4 py-3 text-center ${
                index < orderedDays.length - 1
                  ? "border-r-2 border-r-[#cccccc]"
                  : ""
              }`}
            >
              <strong className="block font-['Montserrat','Open_Sans',sans-serif] text-base font-bold">
                {label}
              </strong>
              <p className="mt-2 text-sm leading-6">
                {formatHours(resolvedHours?.[key])}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-3 lg:hidden">
          {orderedDays.map(([key, label]) => (
            <div
              key={key}
              className="grid grid-cols-[auto_1fr] items-center gap-x-6"
            >
              <div className="font-['Montserrat','Open_Sans',sans-serif] text-base font-bold">
                {label}
              </div>
              <div className="text-right text-sm leading-6">
                {formatHours(resolvedHours?.[key])}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyNewPatientsHoursSection: ComponentConfig<Hs1AlbanyNewPatientsHoursSectionProps> =
  {
    label: "Hs1 Albany New Patients Hours Section",
    fields: Hs1AlbanyNewPatientsHoursSectionFields,
    defaultProps: {
      title: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Hours of Operation",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 28,
        fontColor: "#4a4a4a",
        fontWeight: 400,
        textTransform: "uppercase",
      },
      subtitle: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Summer Hours",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontSize: 22,
        fontColor: "#d3a335",
        fontWeight: 300,
        textTransform: "normal",
      },
      data: {
        hours: {
          field: "hours",
          constantValue: {},
          constantValueEnabled: false,
        },
      },
    },
    render: Hs1AlbanyNewPatientsHoursSectionComponent,
  };
