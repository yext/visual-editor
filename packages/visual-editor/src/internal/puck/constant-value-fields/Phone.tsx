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
    console.log("existing value:", value);
    // By removing useCallback, we ensure this function doesn't close over a stale `value`.
    const tempOnChange = (newVal: any) => {
      // This check is still useful to prevent unnecessary re-renders if the value hasn't changed.
      if (newVal === value) return;
      onChange(newVal);
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
          {/* By removing useMemo, we ensure the component always receives the latest props. */}
          <PhoneInput
            key={value}
            value={value}
            defaultCountry="us"
            onChange={tempOnChange}
          />
        </FieldLabel>
      </div>
    );
  },
};
