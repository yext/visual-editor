import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  DayOfWeekNames,
  HoursTable as HoursTableJS,
  HoursType,
} from "@yext/pages-components";
import "@yext/pages-components/style.css";
import {
  EntityField,
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  YextField,
  i18n,
} from "@yext/visual-editor";

export type HoursTableProps = {
  hours: YextEntityField<HoursType>;
  startOfWeek: keyof DayOfWeekNames | "today";
  collapseDays: boolean;
  showAdditionalHoursText: boolean;
  alignment: "items-start" | "items-center";
};

const hoursTableFields: Fields<HoursTableProps> = {
  hours: YextField(i18n("Hours"), {
    type: "entityField",
    filter: {
      types: ["type.hours"],
    },
  }),
  startOfWeek: YextField(i18n("Start of the Week"), {
    type: "select",
    hasSearch: true,
    options: "HOURS_OPTIONS",
  }),
  collapseDays: YextField(i18n("Collapse days"), {
    type: "radio",
    options: [
      { label: i18n("Yes"), value: true },
      { label: i18n("No"), value: false },
    ],
  }),
  showAdditionalHoursText: YextField(i18n("Show additional hours text"), {
    type: "radio",
    options: [
      { label: i18n("Yes"), value: true },
      { label: i18n("No"), value: false },
    ],
  }),
  alignment: YextField(i18n("Align card"), {
    type: "radio",
    options: [
      { label: i18n("Left"), value: "items-start" },
      { label: i18n("Center"), value: "items-center" },
    ],
  }),
};

const VisualEditorHoursTable = ({
  hours: hoursField,
  startOfWeek,
  collapseDays,
  showAdditionalHoursText,
  alignment,
}: HoursTableProps) => {
  const document = useDocument();
  const hours = resolveYextEntityField(document, hoursField);

  const { additionalHoursText } = document as {
    additionalHoursText: string;
  };

  return (
    <div className={`flex flex-col ${alignment}`}>
      {hours && (
        <EntityField
          displayName={i18n("Hours")}
          fieldId="hours"
          constantValueEnabled={hoursField.constantValueEnabled}
        >
          <HoursTableJS
            hours={hours}
            startOfWeek={startOfWeek}
            collapseDays={collapseDays}
          />
        </EntityField>
      )}
      {additionalHoursText && showAdditionalHoursText && (
        <EntityField
          displayName={i18n("Hours Text")}
          fieldId="additionalHoursText"
        >
          <div className="mt-4 text-body-sm-fontSize">
            {additionalHoursText}
          </div>
        </EntityField>
      )}
    </div>
  );
};

export const HoursTable: ComponentConfig<HoursTableProps> = {
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
  },
  label: i18n("Hours Table"),
  render: (props: HoursTableProps) => <VisualEditorHoursTable {...props} />,
};
