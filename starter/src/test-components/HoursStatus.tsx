import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextField,
  HoursStatusAtom,
} from "@yext/visual-editor";

export interface HoursStatusProps {
  hours: YextEntityField<any>;
  showTodayHours: boolean;
}

const hoursStatusFields: Fields<HoursStatusProps> = {
  hours: YextField<any, any>("Hours", {
    type: "entityField",
    filter: { types: ["type.hours"] },
  }),
  showTodayHours: YextField("Show Today's Hours", {
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  }),
};

const HoursStatusComponent = ({ hours, showTodayHours }: HoursStatusProps) => {
  const { t } = useTranslation();
  const document = useDocument();
  const hoursData = resolveYextEntityField(document, hours);

  return (
    <EntityField
      displayName={t("hoursStatus", "Hours Status")}
      fieldId={hours.field}
      constantValueEnabled={hours.constantValueEnabled}
    >
      {hoursData && (
        <HoursStatusAtom hours={hoursData} showCurrentStatus={showTodayHours} />
      )}
    </EntityField>
  );
};

export const HoursStatus: ComponentConfig<HoursStatusProps> = {
  label: "Hours Status",
  fields: hoursStatusFields,
  defaultProps: {
    hours: {
      field: "hours",
      constantValue: {
        monday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
        tuesday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
        wednesday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
        thursday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
        friday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
        saturday: { openIntervals: [{ start: "10:00", end: "16:00" }] },
        sunday: { isClosed: true },
      },
    },
    showTodayHours: true,
  },
  render: (props) => <HoursStatusComponent {...props} />,
};
