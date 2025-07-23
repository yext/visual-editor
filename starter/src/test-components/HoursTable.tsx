import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextField,
  HoursTableAtom,
} from "@yext/visual-editor";

export interface HoursTableProps {
  hours: YextEntityField<any>;
}

const hoursTableFields: Fields<HoursTableProps> = {
  hours: YextField<any, any>("Hours", {
    type: "entityField",
    filter: { types: ["type.hours"] },
  }),
};

const HoursTableComponent = ({ hours }: HoursTableProps) => {
  const { t } = useTranslation();
  const document = useDocument();
  const hoursData = resolveYextEntityField(document, hours);

  return (
    <EntityField
      displayName={t("hoursTable", "Hours Table")}
      fieldId={hours.field}
      constantValueEnabled={hours.constantValueEnabled}
    >
      {hoursData && <HoursTableAtom hours={hoursData} />}
    </EntityField>
  );
};

export const HoursTable: ComponentConfig<HoursTableProps> = {
  label: "Hours Table",
  fields: hoursTableFields,
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
  },
  render: (props) => <HoursTableComponent {...props} />,
};
