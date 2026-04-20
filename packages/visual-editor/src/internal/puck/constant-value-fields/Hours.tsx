import { Field } from "@puckeditor/core";
import { pt } from "../../../utils/i18n/platform.ts";

const intervalArrayField = {
  type: "array" as const,
  label: pt("fields.openIntervals", "Open Intervals"),
  arrayFields: {
    start: {
      type: "text" as const,
      label: pt("fields.startTime", "Start Time"),
    },
    end: {
      type: "text" as const,
      label: pt("fields.endTime", "End Time"),
    },
  },
  defaultItemProps: {
    start: "09:00",
    end: "17:00",
  },
  getItemSummary: (item: { start?: string; end?: string }, index?: number) => {
    if (item?.start && item?.end) {
      return `${item.start} - ${item.end}`;
    }

    return `${pt("fields.interval", "Interval")} ${String((index ?? 0) + 1)}`;
  },
};

const dayField = (label: string): Field<any> => ({
  type: "object",
  label,
  objectFields: {
    isClosed: {
      type: "radio",
      label: pt("fields.closed", "Closed"),
      options: [
        { label: pt("fields.options.no", "No"), value: false },
        { label: pt("fields.options.yes", "Yes"), value: true },
      ],
    },
    openIntervals: intervalArrayField,
  },
});

export const HOURS_CONSTANT_CONFIG: Field<any> = {
  type: "object",
  label: "",
  objectFields: {
    monday: dayField(pt("days.monday", "Monday")),
    tuesday: dayField(pt("days.tuesday", "Tuesday")),
    wednesday: dayField(pt("days.wednesday", "Wednesday")),
    thursday: dayField(pt("days.thursday", "Thursday")),
    friday: dayField(pt("days.friday", "Friday")),
    saturday: dayField(pt("days.saturday", "Saturday")),
    sunday: dayField(pt("days.sunday", "Sunday")),
  },
};
