import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { HoursType } from "@yext/pages-components";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  useEntityFields,
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

type HoursInterval = {
  start: string;
  end: string;
};

type HoursDay = {
  isClosed?: boolean;
  openIntervals?: HoursInterval[];
};

type HoursData = Partial<
  Record<
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday",
    HoursDay
  >
>;

export type Hs1AlbanyHoursSectionProps = {
  heading: StyledTextProps;
  subtitle: StyledTextProps;
  hours: YextEntityField<HoursType>;
};

const dayOrder = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

const formatTime = (time: string): string => {
  const [rawHours = "0", rawMinutes = "00"] = time.split(":");
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const meridiem = hours >= 12 ? "pm" : "am";
  const normalizedHours = hours % 12 || 12;
  return `${normalizedHours}:${String(minutes).padStart(2, "0")} ${meridiem}`;
};

const formatHoursForDay = (day?: HoursDay): string => {
  if (!day || day.isClosed || !day.openIntervals?.length) {
    return "Closed";
  }

  return day.openIntervals
    .map(
      (interval) =>
        `${formatTime(interval.start)} - ${formatTime(interval.end)}`,
    )
    .join(", ");
};

const normalizeHoursFieldName = (
  fieldName: string,
  availableDisplayNames?: Record<string, string>,
): string => {
  const trimmedFieldName = fieldName.trim();

  if (!trimmedFieldName) {
    return "hours";
  }

  const lowercaseFieldName = trimmedFieldName.toLowerCase();
  if (lowercaseFieldName === "hours") {
    return "hours";
  }

  const matchingEntry = Object.entries(availableDisplayNames ?? {}).find(
    ([apiName, displayName]) =>
      apiName.toLowerCase() === lowercaseFieldName ||
      displayName.toLowerCase() === lowercaseFieldName,
  );

  return matchingEntry?.[0] ?? trimmedFieldName;
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

const hoursField = YextEntityFieldSelector<any, HoursType>({
  label: "Hours",
  filter: { types: ["type.hours"] },
});

const Hs1AlbanyHoursSectionFields: Fields<Hs1AlbanyHoursSectionProps> = {
  heading: textField("Heading"),
  subtitle: textField("Subtitle"),
  hours: hoursField,
};

export const Hs1AlbanyHoursSectionComponent: PuckComponent<
  Hs1AlbanyHoursSectionProps
> = (props) => {
  const streamDocument = useDocument() as {
    locale?: string;
    hours?: HoursData;
  };
  const entityFields = useEntityFields();
  const locale = streamDocument.locale ?? "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const subtitle =
    resolveComponentData(props.subtitle.text, locale, streamDocument) || "";
  const normalizedFieldName = normalizeHoursFieldName(
    props.hours.field,
    entityFields?.displayNames,
  );
  const hoursBinding = props.hours.constantValueEnabled
    ? props.hours
    : {
        ...props.hours,
        field: normalizedFieldName,
      };
  const resolvedHours = resolveComponentData(
    hoursBinding,
    locale,
    streamDocument,
  ) as HoursData | undefined;
  const schedule = dayOrder.map(({ key, label }) => ({
    day: label,
    hours: formatHoursForDay(resolvedHours?.[key]),
  }));

  return (
    <section className="bg-[#e0e0e0] px-6 py-16">
      <div className="mx-auto max-w-[1170px]">
        <h2
          className="m-0 text-center text-[#6f6f6f]"
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
          className="mb-0 mt-2 text-center italic text-[#d3a335]"
          style={{
            fontFamily: "Montserrat, Open Sans, sans-serif",
            fontSize: `${props.subtitle.fontSize}px`,
          }}
        >
          {subtitle}
        </p>
        <div className="mt-8 hidden lg:block">
          <div className="grid grid-cols-7 border-t border-[#c9c9c9]">
            {schedule.map((item, index) => (
              <div
                key={item.day}
                className={`px-3 py-4 text-center ${
                  index < schedule.length - 1 ? "border-r border-[#c9c9c9]" : ""
                }`}
              >
                <strong
                  className="block text-[14px] text-[#4f4e4e]"
                  style={{ fontFamily: "Montserrat, Open Sans, sans-serif" }}
                >
                  {item.day}
                </strong>
                <p
                  className="mb-0 mt-3 text-[11px] text-[#4f4e4e]"
                  style={{ fontFamily: "Montserrat, Open Sans, sans-serif" }}
                >
                  {item.hours.includes(" - ") ? (
                    <>
                      {item.hours.split(" - ")[0]}
                      <span> - </span>
                      {item.hours.split(" - ")[1]}
                    </>
                  ) : (
                    item.hours
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 space-y-4 lg:hidden">
          {schedule.map((item) => (
            <div
              key={item.day}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3"
            >
              <strong
                className="text-[14px] text-[#4f4e4e]"
                style={{ fontFamily: "Montserrat, Open Sans, sans-serif" }}
              >
                {item.day}
              </strong>
              <span className="h-px bg-[#c9c9c9]" />
              <span
                className="text-right text-[13px] text-[#4f4e4e]"
                style={{ fontFamily: "Montserrat, Open Sans, sans-serif" }}
              >
                {item.hours}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyHoursSection: ComponentConfig<Hs1AlbanyHoursSectionProps> =
  {
    label: "HS1 Albany Hours Section",
    fields: Hs1AlbanyHoursSectionFields,
    defaultProps: {
      heading: textDefault(
        "HOURS OF OPERATION",
        28,
        "#6f6f6f",
        400,
        "uppercase",
      ),
      subtitle: textDefault("Summer Hours", 18, "#d3a335", 300, "normal"),
      hours: {
        field: "hours",
        constantValue: {},
        constantValueEnabled: false,
      },
    },
    render: Hs1AlbanyHoursSectionComponent,
  };
