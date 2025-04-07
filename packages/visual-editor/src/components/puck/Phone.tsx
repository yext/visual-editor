import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  CTA,
  Body,
} from "../../index.js";
import { Phone as PhoneIcon } from "lucide-react";
import parsePhoneNumber from "libphonenumber-js";

export interface PhoneProps {
  phone: YextEntityField<string>;
  format?: "domestic" | "international";
  includeHyperlink: boolean;
}

/*
 * formatPhoneNumber formats a phone number into one of the following forms,
 * depending on whether format is set to domestic or international:
 * (123) 456-7890 or +1 (123) 456-7890. A variety of 1-3 digit international
 * codes are accepted. If formatting fails, the original string is returned.
 */
const formatPhoneNumber = (
  phoneNumberString: string,
  format: string = "domestic"
): string => {
  const parsedPhoneNumber = parsePhoneNumber(phoneNumberString);
  if (!parsedPhoneNumber) {
    return phoneNumberString;
  }

  return format === "international"
    ? parsedPhoneNumber.formatInternational()
    : parsedPhoneNumber.formatNational();
};

const PhoneFields: Fields<PhoneProps> = {
  phone: YextEntityFieldSelector({
    label: "Phone Number",
    filter: {
      types: ["type.phone"],
    },
  }),
  format: {
    label: "Format",
    type: "radio",
    options: [
      { label: "Domestic", value: "domestic" },
      { label: "International", value: "international" },
    ],
  },
  includeHyperlink: {
    label: "Include Hyperlink",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
};

const PhoneComponent: React.FC<PhoneProps> = ({
  phone,
  format,
  includeHyperlink,
}) => {
  const document = useDocument();
  const resolvedPhone = resolveYextEntityField<string>(document, phone);

  if (!resolvedPhone) {
    return;
  }

  const formattedPhoneNumber: string = formatPhoneNumber(resolvedPhone, format);

  return (
    <EntityField
      displayName="Phone"
      fieldId={phone.field}
      constantValueEnabled={phone.constantValueEnabled}
    >
      <div className={"components flex gap-2 items-center"}>
        <PhoneIcon className="w-4 h-4" />
        {includeHyperlink ? (
          <CTA
            link={resolvedPhone}
            label={formattedPhoneNumber}
            linkType="PHONE"
            variant="link"
          />
        ) : (
          <Body>{formattedPhoneNumber}</Body>
        )}
      </div>
    </EntityField>
  );
};

export const Phone: ComponentConfig<PhoneProps> = {
  label: "Phone",
  fields: PhoneFields,
  defaultProps: {
    phone: {
      field: "mainPhone",
      constantValue: "",
    },
    includeHyperlink: true,
  },
  render: (props) => <PhoneComponent {...props} />,
};
