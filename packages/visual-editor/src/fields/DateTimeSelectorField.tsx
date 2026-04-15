import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { pt, type MsgString } from "../utils/i18n/platform.ts";

export type DateTimeSelectorField = BaseField & {
  type: "dateTimeSelector";
  label?: string | MsgString;
  visible?: boolean;
};

type DateTimeSelectorFieldProps = FieldProps<DateTimeSelectorField>;

const DateTimeInput = ({
  value,
  onChange,
}: Pick<DateTimeSelectorFieldProps, "value" | "onChange">) => {
  return (
    <input
      className="date-time-picker"
      type="datetime-local"
      onChange={(event) => onChange(event.target.value)}
      value={value ?? ""}
      // Needed so the browser's date picker opens instead of Puck intercepting the click.
      onClick={(event) => event.stopPropagation()}
    />
  );
};

export const DateTimeSelectorFieldOverride = ({
  field,
  value,
  onChange,
}: DateTimeSelectorFieldProps) => {
  const dateTimeInput = <DateTimeInput value={value} onChange={onChange} />;
  const translatedLabel = field.label && pt(field.label);

  return translatedLabel ? (
    <FieldLabel label={translatedLabel}>{dateTimeInput}</FieldLabel>
  ) : (
    // The class gives a margin above the input for the entity toggle
    <div className="ve-mt-3">{dateTimeInput}</div>
  );
};

export const DATE_TIME_CONSTANT_CONFIG: DateTimeSelectorField = {
  type: "dateTimeSelector",
};
