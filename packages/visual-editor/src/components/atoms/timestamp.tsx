const format1: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

const format2: Intl.DateTimeFormatOptions = {
  timeZoneName: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
};

export enum TimestampOption {
  DATE = "DATE",
  DATE_TIME = "DATE_TIME",
  DATE_RANGE = "DATE_RANGE",
  DATE_TIME_RANGE = "DATE_TIME_RANGE",
}

export type TimestampProps = {
  date: string; // ISO 8601 from KG like "YYYY-MM-DDTHH:MM"
  option?: TimestampOption;
  endDate?: string; // ISO 8601 from KG like "YYYY-MM-DDTHH:MM"
  timeZone?: string;
  hideTimeZone?: boolean;
};

type TimestampFormatterPropsType = {
  date: Date;
  option?: TimestampOption;
  endDate?: Date;
  timeZone?: string;
  hideTimeZone?: boolean;
};

function timestampFormatter({
  date,
  option = TimestampOption.DATE,
  endDate,
  timeZone,
  hideTimeZone,
}: TimestampFormatterPropsType): string {
  let format: Intl.DateTimeFormatOptions = (() => {
    switch (option) {
      case TimestampOption.DATE:
        return format1;
      case TimestampOption.DATE_TIME:
        return format2;
      case TimestampOption.DATE_RANGE:
        return format1;
      case TimestampOption.DATE_TIME_RANGE:
        return format2;
      default:
        return format1;
    }
  })();

  if (timeZone) {
    format = { ...format, timeZone };
  }

  if (hideTimeZone) {
    format = { ...format, timeZoneName: undefined };
  }

  if (
    option === TimestampOption.DATE_TIME_RANGE ||
    option === TimestampOption.DATE_RANGE
  ) {
    return new Intl.DateTimeFormat("en-US", format).formatRange(date, endDate!);
  } else {
    return new Intl.DateTimeFormat("en-US", format).format(date);
  }
}

export function Timestamp({
  date,
  option = TimestampOption.DATE,
  endDate = "",
  timeZone,
  hideTimeZone = false,
}: TimestampProps): JSX.Element {
  const startDate = new Date(date);
  const formattedEndDate = new Date(endDate);
  const timestamp = timestampFormatter({
    date: startDate,
    option,
    endDate: formattedEndDate,
    timeZone,
    hideTimeZone,
  });

  return (
    <div className="components font-body-fontFamily font-body-fontWeight text-body-fontSize inline-block">
      {timestamp}
    </div>
  );
}
