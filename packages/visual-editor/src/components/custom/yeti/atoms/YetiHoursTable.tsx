// @ts-nocheck
import {
  HoursType,
  HoursTable as SharedHoursTable,
} from "@yext/pages-components";
import { useTranslation } from "react-i18next";

export interface YetiHoursTableProps {
  hours: HoursType;
  className?: string;
  startOfWeek?:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
    | "today";
  collapseDays?: boolean;
}

export const YetiHoursTable = ({
  hours,
  className,
  startOfWeek = "today",
  collapseDays = false,
}: YetiHoursTableProps) => {
  const { t, i18n } = useTranslation();

  return (
    <SharedHoursTable
      hours={hours}
      className={className}
      startOfWeek={startOfWeek}
      collapseDays={collapseDays}
      dayOfWeekNames={{
        monday: t("monday", "Monday"),
        tuesday: t("tuesday", "Tuesday"),
        wednesday: t("wednesday", "Wednesday"),
        thursday: t("thursday", "Thursday"),
        friday: t("friday", "Friday"),
        saturday: t("saturday", "Saturday"),
        sunday: t("sunday", "Sunday"),
      }}
      intervalTranslations={{
        isClosed: t("closed", "Closed"),
        open24Hours: t("open24Hours", "Open 24 Hours"),
        reopenDate: t("reopenDate", "Reopen Date"),
        timeFormatLocale: i18n.language,
      }}
    />
  );
};
