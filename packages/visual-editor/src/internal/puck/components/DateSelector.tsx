import { CustomField, FieldLabel } from "@puckeditor/core";
import { pt } from "../../../utils/i18n/platform.ts";

export const DateSelector: CustomField<string | undefined> = {
  type: "custom",
  render: ({ value, onChange }) => {
    return (
      <FieldLabel label={pt("date", "Date")}>
        <input
          className="date-time-picker"
          type="date"
          onChange={(e) => onChange(e.target.value)}
          value={value ?? ""}
          // needed so that the browser's date picker opens
          onClick={(e) => e.stopPropagation()}
        />
      </FieldLabel>
    );
  },
};
