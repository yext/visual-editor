import {
  HoursTable,
  HoursTableDayData,
  HoursTableProps,
} from "@yext/pages-components";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { themeManagerCn } from "@yext/visual-editor";

export interface HoursTableAtomProps
  extends Omit<HoursTableProps, "dayOfWeekNames" | "intervalStringsBuilderFn"> {
  className?: string;
}

export const HoursTableAtom = (props: HoursTableAtomProps) => {
  const { hours, className, startOfWeek, collapseDays, timeOptions } = props;

  const { t, i18n } = useTranslation();

  const dayOfWeekNames = {
    monday: t("monday", { defaultValue: "Monday" }),
    tuesday: t("tuesday", { defaultValue: "Tuesday" }),
    wednesday: t("wednesday", { defaultValue: "Wednesday" }),
    thursday: t("thursday", { defaultValue: "Thursday" }),
    friday: t("friday", { defaultValue: "Friday" }),
    saturday: t("saturday", { defaultValue: "Saturday" }),
    sunday: t("sunday", { defaultValue: "Sunday" }),
  };

  // Based on defaultIntervalStringsBuilder in pages-components
  // https://github.com/yext/js/blob/e7f702c0b06b6adff25cfa05ce4fb920f1cda1c4/packages/pages-components/src/components/hours/hoursTable.tsx#L75
  const intervalStringsBuilder = useCallback(
    (dayData: HoursTableDayData, timeOptions?: Intl.DateTimeFormatOptions) => {
      const intervalStrings: string[] = [];
      const isOpen24h =
        dayData.intervals.length > 0 && dayData.intervals[0].is24h();
      if (dayData.intervals.length === 0) {
        intervalStrings.push(t("closed", { defaultValue: "Closed" }));
      } else if (isOpen24h) {
        intervalStrings.push(
          t("open24Hours", { defaultValue: "Open 24 Hours" })
        );
      } else {
        dayData.intervals.forEach((interval) => {
          const startTime = interval.getStartTime(i18n.language, timeOptions);
          const endTime = interval.getEndTime(i18n.language, timeOptions);
          intervalStrings.push(`${startTime} - ${endTime}`);
        });
      }
      return intervalStrings;
    },
    [t, i18n.language]
  );

  return (
    <HoursTable
      hours={hours}
      dayOfWeekNames={dayOfWeekNames}
      startOfWeek={startOfWeek}
      collapseDays={collapseDays}
      timeOptions={timeOptions}
      intervalStringsBuilderFn={intervalStringsBuilder}
      className={themeManagerCn(
        "text-body-fontSize font-body-fontWeight font-body-fontFamily",
        className
      )}
    />
  );
};
