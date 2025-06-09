import { CustomField, FieldLabel } from "@measured/puck";
import { Calendar } from "lucide-react";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";

export const DateSelector: CustomField<string | undefined> = {
  type: "custom",
  render: ({ value, onChange }) => {
    const { t } = usePlatformTranslation();

    return (
      <FieldLabel icon={<Calendar size={"16"} />} label={t("date", "Date")}>
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
