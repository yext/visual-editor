import { CustomField, FieldLabel } from "@measured/puck";
import { pt } from "../../../utils/i18n/platform.ts";

export const DateTimeSelector: CustomField<string | undefined> = {
  type: "custom",
  render: ({ value, onChange }) => {
    return (
      <FieldLabel label={pt("dateAndTime", "Date and Time")}>
        <input
          className="date-time-picker"
          type="datetime-local"
          onChange={(e) => onChange(e.target.value)}
          value={value ?? ""}
          // needed so that the browser's date picker opens
          onClick={(e) => e.stopPropagation()}
        />
      </FieldLabel>
    );
  },
};
