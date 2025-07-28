import { CustomField, FieldLabel } from "@measured/puck";
import { Phone } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import "../ui/puck.css";
import { pt } from "../../../utils/i18n/platform.ts";

export const PHONE_CONSTANT_CONFIG: CustomField<string | undefined> = {
  type: "custom",
  render: ({ value, onChange }) => {
    return (
      <div className="ve-mt-[12px]">
        <FieldLabel
          label={pt("fields.phoneNumber", "Phone Number")}
          icon={<Phone size={16} />}
        >
          <PhoneInput value={value} defaultCountry="us" onChange={onChange} />
        </FieldLabel>
      </div>
    );
  },
};
