import {
  HoursStatus as HoursStatusJS,
  HoursType,
} from "@yext/pages-components";
import { themeManagerCn } from "@yext/visual-editor";
import * as React from "react";
import { TFunction } from "i18next";

export interface HoursStatusAtomProps {
  hours: HoursType;
  t: TFunction;
  className?: string;
  locale?: string;
  showCurrentStatus?: boolean;
  showDayNames?: boolean;
  timeFormat?: "12h" | "24h";
  dayOfWeekFormat?: "short" | "long";
  timezone?: string;
}

export const HoursStatusAtom = ({
  hours,
  t,
  className,
  locale = "en-US",
  showCurrentStatus = true,
  showDayNames = true,
  timeFormat = "12h",
  dayOfWeekFormat = "long",
  timezone,
}: HoursStatusAtomProps): any => {
  return (
    <HoursStatusJS
      hours={hours}
      className={themeManagerCn(
        "components mb-2 font-body-fontWeight text-body-lg-fontSize",
        className || ""
      )}
      currentTemplate={
        showCurrentStatus
          ? (params: HoursStatusParams) =>
              hoursCurrentTemplateOverride(params, t)
          : () => <></>
      }
      futureTemplate={(params: HoursStatusParams) =>
        hoursFutureTemplateOverride(params, t)
      }
      separatorTemplate={showCurrentStatus ? undefined : () => <></>}
      dayOfWeekTemplate={
        showDayNames
          ? (params: HoursStatusParams) =>
              hoursDayOfWeekTemplateOverride(params, locale || "en-US")
          : () => <></>
      }
      dayOptions={{ weekday: dayOfWeekFormat }}
      timeOptions={{ hour12: timeFormat === "12h" }}
      timezone={timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone}
    />
  );
};

/**
 * Overrides the current status text to incorporate i18n
 * @param params used to determine the status
 * @param t translation function
 */
function hoursCurrentTemplateOverride(
  params: HoursStatusParams,
  t: TFunction
): React.ReactNode {
  if (params?.currentInterval?.is24h?.()) {
    return (
      <span className="HoursStatus-current">
        {t("open24Hours", { defaultValue: "Open 24 Hours" })}
      </span>
    );
  }
  if (!params.futureInterval) {
    return (
      <span className="HoursStatus-current">
        {t("temporarilyClosed", { defaultValue: "Temporarily Closed" })}
      </span>
    );
  }
  return (
    <span className="HoursStatus-current">
      {params.isOpen
        ? t("openNow", { defaultValue: "Open Now" })
        : t("closed", { defaultValue: "Closed" })}
    </span>
  );
}

/**
 * Overrides the future status text to incorporate i18n
 * @param params used to determine the status
 * @param t translation function
 */
function hoursFutureTemplateOverride(
  params: HoursStatusParams,
  t: TFunction
): React.ReactNode {
  if (params?.currentInterval?.is24h?.() || !params.futureInterval) {
    return null;
  }
  return (
    <span className="HoursStatus-future">
      {params.isOpen
        ? t("closesAt", { defaultValue: "Closes at" })
        : t("opensAt", { defaultValue: "Opens at" })}
    </span>
  );
}

/**
 * Overrides the day of the week appearance
 * @param params used to determine the day of the week
 * @param locale used to translate the day of the week
 */
function hoursDayOfWeekTemplateOverride(
  params: HoursStatusParams,
  locale: string
): React.ReactNode {
  if (params?.currentInterval?.is24h?.() || !params.futureInterval) {
    return null;
  }
  const dayOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    ...(params.dayOptions ?? {}),
  };

  let dayOfWeek = "";
  if (params.isOpen) {
    const interval = params.currentInterval;
    dayOfWeek +=
      interval?.end?.setLocale(locale).toLocaleString(dayOptions) || "";
  } else {
    const interval = params.futureInterval;
    dayOfWeek +=
      interval?.start?.setLocale(locale).toLocaleString(dayOptions) || "";
  }
  return <span className="HoursStatus-dayOfWeek"> {dayOfWeek}</span>;
}

interface HoursStatusParams {
  isOpen: boolean;
  currentInterval: any | null;
  futureInterval: any | null;
  timeOptions?: Intl.DateTimeFormatOptions;
  dayOptions?: Intl.DateTimeFormatOptions;
}
