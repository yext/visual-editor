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
import {
  type DayType,
  type HoursType,
  type IntervalType,
} from "@yext/pages-components";

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

type DayEntry = {
  key: keyof HoursType;
  label: string;
  value: string;
};

export type Hs1AlbanyServicesHoursSectionProps = {
  heading: StyledTextProps;
  subheading: StyledTextProps;
  data: HoursDataProps;
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

const weekdayLabels: Array<{ key: keyof HoursType; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const formatTime = (value?: string) => {
  if (!value) {
    return "";
  }

  const [rawHour = "0", rawMinute = "00"] = value.split(":");
  const hour = Number.parseInt(rawHour, 10);
  const suffix = hour >= 12 ? "pm" : "am";
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour}:${rawMinute} ${suffix}`;
};

const getDayData = (hours: HoursType | undefined, key: keyof HoursType) =>
  hours?.[key] as DayType | undefined;

const getHoursValue = (hours?: HoursType): DayEntry[] =>
  weekdayLabels.map(({ key, label }) => {
    const day = getDayData(hours, key);
    if (!day || day.isClosed || !day.openIntervals?.length) {
      return { key, label, value: "Closed" };
    }

    const intervals = day.openIntervals.map(
      (interval: IntervalType) =>
        `${formatTime(interval.start)} - ${formatTime(interval.end)}`,
    );

    return {
      key,
      label,
      value: intervals.join(", "),
    };
  });

export const Hs1AlbanyServicesHoursSectionFields: Fields<Hs1AlbanyServicesHoursSectionProps> =
  {
    heading: styledTextFields("Heading"),
    subheading: styledTextFields("Subheading"),
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

export const Hs1AlbanyServicesHoursSectionComponent: PuckComponent<
  Hs1AlbanyServicesHoursSectionProps
> = ({ heading, subheading, data }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(heading.text, locale, streamDocument) || "";
  const resolvedSubheading =
    resolveComponentData(subheading.text, locale, streamDocument) || "";
  const resolvedHours = resolveComponentData(
    data.hours,
    locale,
    streamDocument,
  );
  const weekdayRows = getHoursValue(resolvedHours);
  const headingTextTransform =
    heading.textTransform === "normal" ? undefined : heading.textTransform;
  const subheadingTextTransform =
    subheading.textTransform === "normal"
      ? undefined
      : subheading.textTransform;

  return (
    <section className="bg-[#e0e0e0]">
      <div className="mx-auto max-w-[1170px] px-6 py-[54px]">
        <div className="mb-8">
          <h2
            className="m-0"
            style={{
              fontFamily: "'Montserrat', 'Open Sans', sans-serif",
              fontSize: `${heading.fontSize}px`,
              color: heading.fontColor,
              fontWeight: heading.fontWeight,
              textTransform: headingTextTransform,
              lineHeight: 1.2,
              letterSpacing: "1px",
            }}
          >
            {resolvedHeading}
          </h2>
          <p
            className="mb-0 mt-[10px]"
            style={{
              fontFamily: "'Montserrat', 'Open Sans', sans-serif",
              fontSize: `${subheading.fontSize}px`,
              color: subheading.fontColor,
              fontWeight: subheading.fontWeight,
              textTransform: subheadingTextTransform,
              lineHeight: 1.2,
              letterSpacing: "1.5px",
            }}
          >
            {resolvedSubheading}
          </p>
        </div>

        <div className="hidden lg:grid lg:grid-cols-7 lg:gap-0">
          {weekdayRows.map((day, index) => (
            <div
              key={day.key}
              className={`px-[10px] text-center ${
                index < weekdayRows.length - 1
                  ? "border-r-2 border-[#cccccc]"
                  : ""
              }`}
            >
              <p
                className="m-0"
                style={{
                  fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111111",
                  lineHeight: 1.4,
                }}
              >
                {day.label}
              </p>
              <p
                className="mb-0 mt-[10px]"
                style={{
                  fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
                  fontSize: "18px",
                  fontWeight: 400,
                  color: "#111111",
                  lineHeight: 1.4,
                }}
              >
                {day.value}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-2 lg:hidden">
          {weekdayRows.map((day) => (
            <div
              key={day.key}
              className="grid min-h-[58px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 pb-[5px]"
            >
              <div
                className="pr-2"
                style={{
                  fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111111",
                }}
              >
                {day.label}
              </div>
              <div className="h-px border-b border-dashed border-[#111111]" />
              <div
                className="text-right"
                style={{
                  fontFamily: "'Nunito Sans', 'Open Sans', sans-serif",
                  fontSize: "16px",
                  fontWeight: 400,
                  color: "#111111",
                }}
              >
                {day.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyServicesHoursSection: ComponentConfig<Hs1AlbanyServicesHoursSectionProps> =
  {
    label: "HS1 Albany Services Hours Section",
    fields: Hs1AlbanyServicesHoursSectionFields,
    defaultProps: {
      heading: {
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
      subheading: {
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
        },
      },
    },
    render: Hs1AlbanyServicesHoursSectionComponent,
  };
