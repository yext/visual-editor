import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { DayOfWeekNames, HoursTable, HoursType } from "@yext/pages-components";
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

type HoursTableProps = {
  hours: YextEntityField<HoursType>;
  startOfWeek: keyof DayOfWeekNames | "today";
  collapseDays: boolean;
  showAdditionalHoursText: boolean;
  alignment: "items-start" | "items-center";
  padding: VariantProps<typeof sectionVariants>["padding"];
};

const hoursTableFields: Fields<HoursTableProps> = {
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

const VisualEditorHoursTable = ({
  hours: hoursField,
  startOfWeek,
  collapseDays,
  showAdditionalHoursText,
  alignment,
  padding,
}: HoursTableProps) => {
  const document = useDocument();
  const hours = resolveYextEntityField(document, hoursField);

  const { additionalHoursText } = document as {
    additionalHoursText: string;
  };

  return (
    <Section
      className={`flex flex-col justify-center components ${alignment} font-body-fontFamily font-body-fontWeight text-body-fontSize`}
      padding={padding}
    >
      <div>
        {hours && (
          <EntityField
            displayName="Hours"
            fieldId="hours"
            constantValueEnabled={hoursField.constantValueEnabled}
          >
            <HoursTable
              hours={hours}
              startOfWeek={startOfWeek}
              collapseDays={collapseDays}
            />
          </EntityField>
        )}
        {additionalHoursText && showAdditionalHoursText && (
          <EntityField displayName="Hours Text" fieldId="additionalHoursText">
            <div className="mt-4 text-body-sm-fontSize">
              {additionalHoursText}
            </div>
          </EntityField>
        )}
      </div>
    </Section>
  );
};

const HoursTableComponent: ComponentConfig<HoursTableProps> = {
  fields: hoursTableFields,
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
  render: (props) => <VisualEditorHoursTable {...props} />,
};

export { HoursTableComponent as HoursTable, type HoursTableProps };
