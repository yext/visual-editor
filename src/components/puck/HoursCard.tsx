import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { DayOfWeekNames, HoursTable, HoursType } from "@yext/pages-components";
import { Section, sectionVariants } from "./atoms/section.js";
import "@yext/pages-components/style.css";
import { VariantProps } from "class-variance-authority";
import { EntityField, useDocument } from "../../index.js";

export type HoursCardProps = {
  startOfWeek: keyof DayOfWeekNames | "today";
  collapseDays: boolean;
  showAdditionalHoursText: boolean;
  alignment: "items-start" | "items-center";
  padding: VariantProps<typeof sectionVariants>["padding"];
};

type Interval = {
  start: any;
  end: any;
};

type HolidayHours = {
  date: string;
  openIntervals?: Interval[];
  isClosed?: boolean;
  isRegularHours?: boolean;
};

type DayHour = {
  openIntervals?: Interval[];
  isClosed?: boolean;
};

type Hours = {
  monday?: DayHour;
  tuesday?: DayHour;
  wednesday?: DayHour;
  thursday?: DayHour;
  friday?: DayHour;
  saturday?: DayHour;
  sunday?: DayHour;
  holidayHours?: HolidayHours[];
  reopenDate?: string;
};

const hoursCardFields: Fields<HoursCardProps> = {
  startOfWeek: {
    label: "Start of the week",
    type: "radio",
    options: [
      { label: "Monday", value: "monday" },
      { label: "Tuesday", value: "tuesday" },
      { label: "Wednesday", value: "wednesday" },
      { label: "Thursday", value: "thursday" },
      { label: "Friday", value: "friday" },
      { label: "Saturday", value: "saturday" },
      { label: "Sunday", value: "sunday" },
      { label: "Today", value: "today" },
    ],
  },
  collapseDays: {
    label: "Collapse days",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  showAdditionalHoursText: {
    label: "Show additional hours text",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  alignment: {
    label: "Align card",
    type: "radio",
    options: [
      { label: "Left", value: "items-start" },
      { label: "Center", value: "items-center" },
    ],
  },
  padding: {
    label: "Padding",
    type: "radio",
    options: [
      { label: "None", value: "none" },
      { label: "Small", value: "small" },
      { label: "Medium", value: "default" },
      { label: "Large", value: "large" },
    ],
  },
};

const HoursCard = ({
  startOfWeek,
  collapseDays,
  showAdditionalHoursText,
  alignment,
  padding,
}: HoursCardProps) => {
  const { hours, additionalHoursText } = useDocument() as {
    hours: Hours;
    additionalHoursText: string;
  };

  return (
    <Section
      className={`flex flex-col justify-center components ${alignment} font-body-fontWeight text-body-fontSize text-body-color`}
      padding={padding}
    >
      <div>
        {hours && (
          <EntityField displayName="Hours" fieldId="hours">
            <HoursTable
              hours={hours as HoursType}
              startOfWeek={startOfWeek}
              collapseDays={collapseDays}
            />
          </EntityField>
        )}
        {additionalHoursText && showAdditionalHoursText && (
          <EntityField displayName="Hours Text" fieldId="additionalHoursText">
            <div className="mt-4">{additionalHoursText}</div>
          </EntityField>
        )}
      </div>
    </Section>
  );
};

export const HoursCardComponent: ComponentConfig<HoursCardProps> = {
  fields: hoursCardFields,
  defaultProps: {
    startOfWeek: "today",
    collapseDays: false,
    showAdditionalHoursText: true,
    alignment: "items-center",
    padding: "none",
  },
  label: "Hours Card",
  render: (props) => <HoursCard {...props} />,
};
