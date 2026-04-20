import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  resolveComponentData,
  TranslatableString,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { HoursTable, HoursType } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  fontSize: number;
  fontColor: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  textTransform: "normal" | "uppercase" | "lowercase" | "capitalize";
};

export type Hs1AlbanyStaffHoursSectionProps = {
  title: StyledTextProps;
  subtitle: StyledTextProps;
  data: {
    hours: YextEntityField<HoursType>;
  };
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

const toCssTextTransform = (
  value: StyledTextProps["textTransform"],
): "none" | "uppercase" | "lowercase" | "capitalize" =>
  value === "normal" ? "none" : value;

export const Hs1AlbanyStaffHoursSectionFields: Fields<Hs1AlbanyStaffHoursSectionProps> =
  {
    title: styledTextFields("Title"),
    subtitle: styledTextFields("Subtitle"),
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

const resolveStyledText = (
  textField: StyledTextProps,
  locale: string,
  streamDocument: Record<string, any>,
) => resolveComponentData(textField.text, locale, streamDocument) || "";

export const Hs1AlbanyStaffHoursSectionComponent: PuckComponent<
  Hs1AlbanyStaffHoursSectionProps
> = ({ title, subtitle, data }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedTitle = resolveStyledText(title, locale, streamDocument);
  const resolvedSubtitle = resolveStyledText(subtitle, locale, streamDocument);
  const hours = resolveComponentData(data.hours, locale, streamDocument);

  if (!hours) {
    return <></>;
  }

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="absolute inset-0 bg-[#e0e0e0]" />
      <div className="relative mx-auto max-w-[1140px] px-[15px] py-[50px]">
        <h2
          className="m-0"
          style={{
            fontFamily: '"Montserrat", "Open Sans", sans-serif',
            fontSize: `${title.fontSize}px`,
            color: title.fontColor,
            fontWeight: title.fontWeight,
            lineHeight: "28px",
            letterSpacing: "1px",
            textTransform: toCssTextTransform(title.textTransform),
          }}
        >
          {resolvedTitle}
        </h2>
        <p
          className="mb-[30px] mt-[5px]"
          style={{
            fontFamily: '"Montserrat", "Open Sans", sans-serif',
            fontSize: `${subtitle.fontSize}px`,
            color: subtitle.fontColor,
            fontWeight: subtitle.fontWeight,
            lineHeight: "22px",
            letterSpacing: "1.5px",
            textTransform: toCssTextTransform(subtitle.textTransform),
          }}
        >
          {resolvedSubtitle}
        </p>
        <HoursTable
          hours={hours}
          dayOfWeekNames={{
            monday: "Monday",
            tuesday: "Tuesday",
            wednesday: "Wednesday",
            thursday: "Thursday",
            friday: "Friday",
            saturday: "Saturday",
            sunday: "Sunday",
          }}
          startOfWeek="monday"
          collapseDays={false}
          intervalStringsBuilderFn={(day, timeOptions) =>
            day.intervals.length === 0
              ? ["Closed"]
              : day.intervals.map(
                  (interval) =>
                    `${interval.getStartTime("en", timeOptions)} - ${interval.getEndTime("en", timeOptions)}`,
                )
          }
          timeOptions={{ hour: "numeric", minute: "2-digit", hour12: true }}
          className="w-full lg:grid lg:grid-cols-7 lg:gap-0 [&_.HoursTable-row]:grid [&_.HoursTable-row]:w-full [&_.HoursTable-row]:min-w-0 [&_.HoursTable-row]:grid-cols-[minmax(0,1fr)_auto] [&_.HoursTable-row]:items-center [&_.HoursTable-row]:gap-x-4 [&_.HoursTable-row]:py-3 [&_.HoursTable-day]:font-bold [&_.HoursTable-day]:text-[16px] [&_.HoursTable-day]:leading-6 [&_.HoursTable-day]:text-black [&_.HoursTable-intervals]:min-w-0 [&_.HoursTable-intervals]:text-right [&_.HoursTable-intervals]:text-[16px] [&_.HoursTable-intervals]:leading-6 [&_.HoursTable-interval]:whitespace-nowrap [&_.HoursTable-row.is-today]:font-normal lg:[&_.HoursTable-row]:grid-cols-1 lg:[&_.HoursTable-row]:justify-items-center lg:[&_.HoursTable-row]:border-r-[2px] lg:[&_.HoursTable-row]:border-r-[#cccccc] lg:[&_.HoursTable-row]:px-3 lg:[&_.HoursTable-row]:py-0 lg:[&_.HoursTable-row]:text-center lg:[&_.HoursTable-row]:min-h-[62px] lg:[&_.HoursTable-row:last-child]:border-r-0 lg:[&_.HoursTable-day]:mb-[6px] lg:[&_.HoursTable-day]:text-center lg:[&_.HoursTable-intervals]:text-center"
        />
      </div>
    </section>
  );
};

export const Hs1AlbanyStaffHoursSection: ComponentConfig<Hs1AlbanyStaffHoursSectionProps> =
  {
    label: "HS1 Albany Staff Hours Section",
    fields: Hs1AlbanyStaffHoursSectionFields,
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
        },
      },
    },
    render: Hs1AlbanyStaffHoursSectionComponent,
  };
