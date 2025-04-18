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
  hours: YextField("Hours", {
    type: "entityField",
    filter: {
      types: ["type.hours"],
    },
  }),
  showCurrentStatus: YextField("Show Current Status", {
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  }),
  timeFormat: YextField("Time Format", {
    type: "radio",
    options: [
      { label: "12-hour", value: "12h" },
      { label: "24-hour", value: "24h" },
    ],
  }),
  showDayNames: YextField("Show Day Names", {
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  }),
  dayOfWeekFormat: YextField("Day of Week Format", {
    type: "radio",
    options: [
      { label: "Short", value: "short" },
      { label: "Long", value: "long" },
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
      displayName="Hours"
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
  label: "Hours Status",
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
