import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
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

export interface HoursStatusParams {
  isOpen: boolean;
  currentInterval: any | null;
  futureInterval: any | null;
  timeOptions?: Intl.DateTimeFormatOptions;
  dayOptions?: Intl.DateTimeFormatOptions;
}

const HoursStatusWrapper: React.FC<HoursStatusProps> = ({
  hours: hoursField,
  className,
  showCurrentStatus,
  timeFormat,
  showDayNames,
  dayOfWeekFormat,
}) => {
  const document = useDocument();
  const { t } = useTranslation();
  const hours = resolveYextEntityField(document, hoursField);
  const locale = "en-US"; // TODO pass real locale through

  if (!hours) {
    return null;
  }

  return (
    <EntityField
      displayName={t("hours", { defaultValue: "Hours" })}
      fieldId={hoursField.field}
      constantValueEnabled={hoursField.constantValueEnabled}
    >
      <HoursStatusJS
        hours={hours}
        className={themeManagerCn(
          "components mb-2 font-body-fontWeight text-body-lg-fontSize",
          className
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
                hoursDayOfWeekTemplateOverride(params, locale)
            : () => <></>
        }
        dayOptions={{ weekday: dayOfWeekFormat }}
        timeOptions={{ hour12: timeFormat === "12h" }}
        timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
      />
    </EntityField>
  );
};

/**
 * Overrides the current status text to incorporate i18n
 * @param params used to determine the status
 * @param t translation function
 */
export function hoursCurrentTemplateOverride(
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
export function hoursFutureTemplateOverride(
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
export function hoursDayOfWeekTemplateOverride(
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
