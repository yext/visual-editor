import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { DayOfWeekNames, HoursType } from "@yext/pages-components";
import "@yext/pages-components/style.css";
import {
  EntityField,
  HoursTableAtom,
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  YextField,
} from "@yext/visual-editor";

export type HoursTableProps = {
  hours: YextEntityField<HoursType>;
  startOfWeek: keyof DayOfWeekNames | "today";
  collapseDays: boolean;
  showAdditionalHoursText: boolean;
  alignment: "items-start" | "items-center";
};

const hoursTableFields: Fields<HoursTableProps> = {
  hours: YextField("Hours", {
    type: "entityField",
    filter: {
      types: ["type.hours"],
    },
  }),
  startOfWeek: YextField("Start of the Week", {
    type: "select",
    hasSearch: true,
    options: "HOURS_OPTIONS",
  }),
  collapseDays: YextField("Collapse days", {
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  }),
  showAdditionalHoursText: YextField("Show additional hours text", {
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  }),
  alignment: YextField("Align card", {
    type: "radio",
    options: [
      { label: "Left", value: "items-start" },
      { label: "Center", value: "items-center" },
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
  const { t } = useTranslation();
  const document = useDocument();
  const hours = resolveYextEntityField(document, hoursField);

  const { additionalHoursText } = document as {
    additionalHoursText: string;
  };

  return (
    <div className={`flex flex-col ${alignment}`}>
      {hours && (
        <EntityField
          displayName={t("hours", "Hours")}
          fieldId="hours"
          constantValueEnabled={hoursField.constantValueEnabled}
        >
          <HoursTableAtom
            hours={hours}
            startOfWeek={startOfWeek}
            collapseDays={collapseDays}
          />
        </EntityField>
      )}
      {additionalHoursText && showAdditionalHoursText && (
        <EntityField
          displayName={t("hoursText", "Hours Text")}
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
  label: "Hours Table",
  render: (props: HoursTableProps) => <VisualEditorHoursTable {...props} />,
};
