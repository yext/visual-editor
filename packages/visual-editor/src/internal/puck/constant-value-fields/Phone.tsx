import { CustomField, FieldLabel } from "@measured/puck";
import { Phone } from "lucide-react";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import "react-phone-number-input/style.css";
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
          <PhoneInputWithCountrySelect
            value={value}
            countryCallingCodeEditable
            international
            defaultCountry="US"
            onChange={(number) => {
              // cast to string because this field needs to output a string
              // but the component outputs a specific type of string
              onChange(number as string);
            }}
          />
        </FieldLabel>
      </div>
    );
  },
};
