import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  DayOfWeekNames,
  HoursTable as HoursTableComponent,
  HoursType,
} from "@yext/pages-components";
import { Section, sectionVariants } from "./atoms/section.js";
import "@yext/pages-components/style.css";
import { VariantProps } from "class-variance-authority";
import {
  EntityField,
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "../../index.js";

export type HoursCardProps = {
  hours: YextEntityField<HoursType>;
  startOfWeek: keyof DayOfWeekNames | "today";
  collapseDays: boolean;
  showAdditionalHoursText: boolean;
  alignment: "items-start" | "items-center";
  padding: VariantProps<typeof sectionVariants>["padding"];
};

const hoursCardFields: Fields<HoursCardProps> = {
  hours: YextEntityFieldSelector({
    label: "Hours",
    filter: {
      types: ["type.hours"],
    },
  }),
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

const HoursTable = ({
  hours: hoursField,
  startOfWeek,
  collapseDays,
  showAdditionalHoursText,
  alignment,
  padding,
}: HoursCardProps) => {
  const document = useDocument();
  const hours = resolveYextEntityField(document, hoursField);

  const { additionalHoursText } = document as {
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
            <HoursTableComponent
              hours={hours}
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
    hours: {
      field: "hours",
      constantValue: {},
    },
    startOfWeek: "today",
    collapseDays: false,
    showAdditionalHoursText: true,
    alignment: "items-center",
    padding: "none",
  },
  label: "Hours Table",
  render: (props) => <HoursTable {...props} />,
};