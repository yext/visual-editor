import { Phone as PhoneIcon } from "lucide-react";
import { CTA, Body } from "../index.ts";
import * as React from "react";
import parsePhoneNumber from "libphonenumber-js";

export type PhoneProps = {
  phoneNumber: string;
  format: "domestic" | "international" | undefined;
  includeHyperlink: boolean;
};

export const Phone = (props: PhoneProps) => {
  const formattedPhoneNumber = formatPhoneNumber(
    props.phoneNumber,
    props.format
  );

  return (
    <div className={"components flex gap-2 items-center"}>
      <PhoneIcon className="w-4 h-4" />
      {props.includeHyperlink ? (
        <CTA
          link={props.phoneNumber}
          label={formattedPhoneNumber}
          linkType="PHONE"
          variant="link"
        />
      ) : (
        <Body>{formattedPhoneNumber}</Body>
      )}
    </div>
  );
};

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
