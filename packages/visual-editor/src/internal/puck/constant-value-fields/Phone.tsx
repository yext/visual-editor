import { CustomField, FieldLabel } from "@measured/puck";
import { Phone } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import "../ui/puck.css";
import { pt } from "../../../utils/i18n/platform.ts";
import React from "react";

export const PHONE_CONSTANT_CONFIG: CustomField<string | undefined> = {
  type: "custom",
  render: ({ value, onChange }) => {
    /* Managing an internal state is necessary to prevent PhoneInput from 
       reverting back to its initial value unexpectedly. */
    const [phoneNumber, setPhoneNumber] = React.useState(value);

    const handleOnChange = (newPhoneNumber: any) => {
      setPhoneNumber(newPhoneNumber);
      onChange(newPhoneNumber);
    };

    return (
      <div className="ve-mt-[12px]">
        <FieldLabel
          label={pt("fields.phoneNumber", "Phone Number")}
          icon={<Phone size={16} />}
        >
          {/* FieldLabel grabs the onclick event for the first button in its children, 
              and applies it to the whole area covered by the FieldLabel and its children.
              This hidden button catches clicks on the label/phone input to block unintended behavior. */}
          <button
            className="ve-absolute ve-inset-0 ve-z-10 ve-hidden"
            onClick={(e) => e.stopPropagation()}
          />
          <PhoneInput
            value={phoneNumber}
            defaultCountry="us"
            onChange={handleOnChange}
          />
        </FieldLabel>
      </div>
    );
  },
};
