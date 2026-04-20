import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { HoursType } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

export type Hs1AlbanyOfficeHoursSectionProps = {
  title: StyledTextProps;
  subtitle: StyledTextProps;
  hours: YextEntityField<HoursType>;
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

const createStyledTextObjectFields = () => ({
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
});

const createStyledTextDefault = (
  text: string,
  fontSize: number,
  fontColor: string,
  fontWeight: StyledTextProps["fontWeight"],
  textTransform: StyledTextProps["textTransform"] = "normal",
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: text,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontSize,
  fontColor,
  fontWeight,
  textTransform,
});

const resolveStyledText = (
  value: StyledTextProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) => resolveComponentData(value.text, locale, streamDocument) || "";

const cssTextTransform = (value: StyledTextProps["textTransform"]) =>
  value === "normal" ? "none" : value;

const orderedDays = [
  ["monday", "Monday"],
  ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"],
  ["thursday", "Thursday"],
  ["friday", "Friday"],
  ["saturday", "Saturday"],
  ["sunday", "Sunday"],
] as const;

const formatHourLabel = (time: string) => {
  const [hourPart, minutePart] = time.split(":");
  const hour = Number.parseInt(hourPart, 10);
  const minute = Number.parseInt(minutePart, 10);
  const date = new Date(Date.UTC(2024, 0, 1, hour, minute));

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  })
    .format(date)
    .toLowerCase();
};

const Hs1AlbanyOfficeHoursSectionFields: Fields<Hs1AlbanyOfficeHoursSectionProps> =
  {
    title: {
      label: "Title",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    subtitle: {
      label: "Subtitle",
      type: "object",
      objectFields: createStyledTextObjectFields(),
    },
    hours: YextEntityFieldSelector<any, HoursType>({
      label: "Hours",
      filter: {
        types: ["type.hours"],
      },
    }),
  };

export const Hs1AlbanyOfficeHoursSectionComponent: PuckComponent<
  Hs1AlbanyOfficeHoursSectionProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown>;
  const locale = (streamDocument.locale as string) ?? "en";
  const title = resolveStyledText(props.title, locale, streamDocument);
  const subtitle = resolveStyledText(props.subtitle, locale, streamDocument);
  const hours = resolveComponentData(props.hours, locale, streamDocument);
  const schedule = orderedDays.map(([key, label]) => {
    const day = hours?.[
      key as keyof Pick<
        HoursType,
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      >
    ] as
      | { isClosed?: boolean; openIntervals?: { start: string; end: string }[] }
      | undefined;
    const intervals =
      day?.isClosed || !day?.openIntervals?.length
        ? "Closed"
        : day.openIntervals
            .map(
              (interval: { start: string; end: string }) =>
                `${formatHourLabel(interval.start)} - ${formatHourLabel(interval.end)}`,
            )
            .join(", ");

    return {
      key,
      label,
      intervals,
    };
  });

  return (
    <section className="bg-[#efefef] font-['Montserrat','Open_Sans',sans-serif]">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <h2
          className="m-0 leading-none"
          style={{
            fontSize: `${props.title.fontSize}px`,
            color: props.title.fontColor,
            fontWeight: props.title.fontWeight,
            textTransform: cssTextTransform(props.title.textTransform),
            letterSpacing: "1px",
          }}
        >
          {title}
        </h2>
        <p
          className="mb-8 mt-2"
          style={{
            fontSize: `${props.subtitle.fontSize}px`,
            color: props.subtitle.fontColor,
            fontWeight: props.subtitle.fontWeight,
            textTransform: cssTextTransform(props.subtitle.textTransform),
            letterSpacing: "0.06em",
          }}
        >
          {subtitle}
        </p>
        <div className="hidden grid-cols-7 gap-0 border-y border-[#d4d4d4] lg:grid">
          {schedule.map((day, index) => (
            <div
              key={day.key}
              className={`px-4 py-5 text-center ${index === schedule.length - 1 ? "" : "border-r border-[#d4d4d4]"}`}
            >
              <p className="m-0 text-[12px] font-bold text-[#4a4a4a]">
                {day.label}
              </p>
              <p className="mt-2 text-[11px] text-[#4a4a4a]">{day.intervals}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3 lg:hidden">
          {schedule.map((day) => (
            <div
              key={`${day.key}-mobile`}
              className="flex items-center justify-between border-b border-[#d4d4d4] py-3 text-[13px] text-[#4a4a4a]"
            >
              <span className="font-bold">{day.label}</span>
              <span>{day.intervals}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Hs1AlbanyOfficeHoursSection: ComponentConfig<Hs1AlbanyOfficeHoursSectionProps> =
  {
    label: "Hs1 Albany Office Hours Section",
    fields: Hs1AlbanyOfficeHoursSectionFields,
    defaultProps: {
      title: createStyledTextDefault(
        "Hours of Operation",
        28,
        "#4a4a4a",
        400,
        "uppercase",
      ),
      subtitle: createStyledTextDefault("Summer Hours", 16, "#d3a335", 300),
      hours: {
        field: "hours",
        constantValue: {},
      },
    },
    render: Hs1AlbanyOfficeHoursSectionComponent,
  };
