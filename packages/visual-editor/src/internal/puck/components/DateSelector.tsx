import { CustomField, FieldLabel } from "@measured/puck";
import { Calendar } from "lucide-react";

export const DateSelector: CustomField<string | undefined> = {
  type: "custom",
  render: ({ value, onChange }) => {
    return (
      <FieldLabel icon={<Calendar size={"16"} />} label="Date">
        <input
          className="date-time-picker"
          type="date"
          onChange={(e) => onChange(e.target.value)}
          value={value}
          // needed so that the browser's date picker opens
          onClick={(e) => e.stopPropagation()}
        />
      </FieldLabel>
    );
  },
};
