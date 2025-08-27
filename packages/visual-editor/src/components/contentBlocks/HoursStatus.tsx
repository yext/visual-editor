import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { HoursType } from "@yext/pages-components";
import {
  useDocument,
  resolveComponentData,
  EntityField,
  YextEntityField,
  YextField,
  msg,
  pt,
  HoursStatusAtom,
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
  hours: YextField(msg("fields.hours", "Hours"), {
    type: "entityField",
    filter: {
      types: ["type.hours"],
    },
  }),
  showCurrentStatus: YextField(
    msg("fields.showCurrentStatus", "Show Current Status"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    }
  ),
  timeFormat: YextField(msg("fields.timeFormat", "Time Format"), {
    type: "radio",
    options: [
      { label: msg("fields.options.hour12", "12-hour"), value: "12h" },
      { label: msg("fields.options.hour24", "24-hour"), value: "24h" },
    ],
  }),
  showDayNames: YextField(msg("fields.showDayNames", "Show Day Names"), {
    type: "radio",
    options: [
      { label: msg("fields.options.yes", "Yes"), value: true },
      { label: msg("fields.options.no", "No"), value: false },
    ],
  }),
  dayOfWeekFormat: YextField(
    msg("fields.dayOfWeekFormat", "Day of Week Format"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.short", "Short"), value: "short" },
        { label: msg("fields.options.long", "Long"), value: "long" },
      ],
    }
  ),
};

const HoursStatusWrapper: React.FC<HoursStatusProps> = ({
  hours: hoursField,
  className,
  showCurrentStatus,
  timeFormat,
  showDayNames,
  dayOfWeekFormat,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const hours = resolveComponentData(hoursField, i18n.language, streamDocument);

  if (!hours) {
    return null;
  }

  return (
    <EntityField
      displayName={pt("hours", "Hours")}
      fieldId={hoursField.field}
      constantValueEnabled={hoursField.constantValueEnabled}
    >
      <HoursStatusAtom
        hours={hours}
        className={className}
        showCurrentStatus={showCurrentStatus}
        showDayNames={showDayNames}
        timeFormat={timeFormat}
        dayOfWeekFormat={dayOfWeekFormat}
      />
    </EntityField>
  );
};

export const HoursStatus: ComponentConfig<{ props: HoursStatusProps }> = {
  label: msg("components.hoursStatus", "Hours Status"),
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
