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

export function timestampFormatter({
  date,
  option = TimestampOption.DATE,
  endDate,
  timeZone,
  hideTimeZone,
}: TimestampFormatterPropsType): string {
  let dateFormat = format1;
  let dateTimeFormat = format2;

  if (timeZone) {
    dateFormat = { ...dateFormat, timeZone };
    dateTimeFormat = { ...dateTimeFormat, timeZone };
  }

  if (hideTimeZone) {
    dateTimeFormat = { ...dateTimeFormat, timeZoneName: undefined };
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US", dateFormat);
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    ...(timeZone && { timeZone }),
    ...(hideTimeZone && { timeZoneName: undefined }),
  });

  switch (option) {
    case TimestampOption.DATE:
      return dateFormatter.format(date);
    case TimestampOption.DATE_TIME:
      return new Intl.DateTimeFormat("en-US", dateTimeFormat).format(date);
    case TimestampOption.DATE_RANGE:
      return new Intl.DateTimeFormat("en-US", dateFormat).formatRange(
        date,
        endDate!
      );
    case TimestampOption.DATE_TIME_RANGE: {
      const isSameDay = date.toDateString() === endDate!.toDateString();

      const dateStr = isSameDay
        ? dateFormatter.format(date)
        : `${dateFormatter.format(date)} - ${dateFormatter.format(endDate!)}`;

      const timeStr = `${timeFormatter.format(date)} - ${timeFormatter.format(endDate!)}`;

      return `${dateStr} | ${timeStr}`;
    }
    default:
      return dateFormatter.format(date);
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
