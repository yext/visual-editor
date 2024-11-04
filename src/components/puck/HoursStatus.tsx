import React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { HoursStatus } from "@yext/pages-components";
import { useDocument } from "../../hooks/useDocument.tsx";
import { cn } from "../../internal/utils/cn.ts";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField.ts";
import { EntityField } from "../editor/EntityField.tsx";
import {
  YextEntityField,
  YextEntityFieldSelector,
} from "../editor/YextEntityFieldSelector.tsx";

export interface HoursStatusProps {
  hours: YextEntityField<any>;
  className?: string;
  showCurrentStatus?: boolean;
  timeFormat?: "12h" | "24h";
  dayOfWeekFormat?: "short" | "long";
  showDayNames?: boolean;
}

const hoursStatusWrapperFields: Fields<HoursStatusProps> = {
  hours: YextEntityFieldSelector({
    label: "Hours",
    filter: {
      types: ["type.hours"],
    },
  }),
  showCurrentStatus: {
    type: "radio",
    label: "Show Current Status",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  timeFormat: {
    type: "select",
    label: "Time Format",
    options: [
      { label: "12-hour", value: "12h" },
      { label: "24-hour", value: "24h" },
    ],
  },
  showDayNames: {
    type: "radio",
    label: "Show Day Names",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  dayOfWeekFormat: {
    type: "select",
    label: "Day of Week Format",
    options: [
      { label: "Short", value: "short" },
      { label: "Long", value: "long" },
    ],
  },
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
    <EntityField displayName="Hours" fieldId={hoursField.field}>
      <HoursStatus
        hours={hours}
        className={cn("font-semibold mb-2", className)}
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

export const HoursStatusComponent: ComponentConfig<HoursStatusProps> = {
  label: "Hours Status",
  fields: hoursStatusWrapperFields,
  defaultProps: {
    hours: {
      field: "hours",
      constantValue: "",
    },
    className: "",
    showCurrentStatus: true,
    timeFormat: "12h",
    showDayNames: true,
    dayOfWeekFormat: "long",
  },
  render: (props) => <HoursStatusWrapper {...props} />,
};
