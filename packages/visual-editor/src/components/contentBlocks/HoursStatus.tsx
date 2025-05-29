import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  HoursStatus as HoursStatusJS,
  HoursType,
} from "@yext/pages-components";
import {
  themeManagerCn,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextField,
  i18n,
} from "@yext/visual-editor";

export interface HoursStatusProps {
  hours: YextEntityField<HoursType>;
  className?: string;
  showCurrentStatus?: boolean;
  timeFormat?: "12h" | "24h";
  dayOfWeekFormat?: "short" | "long";
  showDayNames?: boolean;
}

const hoursStatusWrapperFields: Fields<HoursStatusProps> = {
  hours: YextField(i18n("Hours"), {
    type: "entityField",
    filter: {
      types: ["type.hours"],
    },
  }),
  showCurrentStatus: YextField(i18n("Show Current Status"), {
    type: "radio",
    options: [
      { label: i18n("Yes"), value: true },
      { label: i18n("No"), value: false },
    ],
  }),
  timeFormat: YextField(i18n("Time Format"), {
    type: "radio",
    options: [
      { label: i18n("12-hour"), value: "12h" },
      { label: i18n("24-hour"), value: "24h" },
    ],
  }),
  showDayNames: YextField(i18n("Show Day Names"), {
    type: "radio",
    options: [
      { label: i18n("Yes"), value: true },
      { label: i18n("No"), value: false },
    ],
  }),
  dayOfWeekFormat: YextField(i18n("Day of Week Format"), {
    type: "radio",
    options: [
      { label: i18n("Short"), value: "short" },
      { label: i18n("Long"), value: "long" },
    ],
  }),
};

const HoursStatusWrapper: React.FC<HoursStatusProps> = ({
  hours: hoursField,
  className,
  showCurrentStatus,
  timeFormat,
  showDayNames,
  dayOfWeekFormat,
}) => {
  const document = useDocument();
  const hours = resolveYextEntityField(document, hoursField);

  if (!hours) {
    return null;
  }

  return (
    <EntityField
      displayName={i18n("Hours")}
      fieldId={hoursField.field}
      constantValueEnabled={hoursField.constantValueEnabled}
    >
      <HoursStatusJS
        hours={hours}
        className={themeManagerCn(
          "components mb-2 font-body-fontWeight text-body-lg-fontSize",
          className
        )}
        currentTemplate={showCurrentStatus ? undefined : () => <></>}
        separatorTemplate={showCurrentStatus ? undefined : () => <></>}
        dayOfWeekTemplate={showDayNames ? undefined : () => <></>}
        dayOptions={{ weekday: dayOfWeekFormat }}
        timeOptions={{ hour12: timeFormat === "12h" }}
        timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
      />
    </EntityField>
  );
};

export const HoursStatus: ComponentConfig<HoursStatusProps> = {
  label: i18n("Hours Status"),
  fields: hoursStatusWrapperFields,
  defaultProps: {
    hours: {
      field: "hours",
      constantValue: {},
    },
    className: "",
    showCurrentStatus: true,
    timeFormat: "12h",
    showDayNames: true,
    dayOfWeekFormat: "long",
  },
  render: (props) => <HoursStatusWrapper {...props} />,
};
