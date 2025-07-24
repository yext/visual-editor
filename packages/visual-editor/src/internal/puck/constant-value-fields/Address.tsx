import { CustomField } from "@measured/puck";
import { AddressType } from "@yext/pages-components";
import { ConstantFields } from "./ConstantField.tsx";
import { pt } from "../../../utils/i18n/platform.ts";

export const ADDRESS_CONSTANT_CONFIG: CustomField<AddressType> = {
  type: "custom",
  render: ({ onChange, value }) => {
    return ConstantFields({
      onChange: onChange,
      value: value,
      fields: [
        {
          label: pt("addressInput.line1", "Line 1"),
          field: "line1",
          fieldType: "text",
        },
        {
          label: pt("addressInput.line2", "Line 2"),
          field: "line2",
          fieldType: "text",
        },
        {
          label: pt("addressInput.line3", "Line 3"),
          field: "line3",
          fieldType: "text",
        },
        {
          label: pt("addressInput.city", "City"),
          field: "city",
          fieldType: "text",
        },
        {
          label: pt("addressInput.region", "State/Region"),
          field: "region",
          fieldType: "text",
        },
        {
          label: pt("addressInput.sublocality", "Sublocality"),
          field: "sublocality",
          fieldType: "text",
        },
        {
          label: pt("addressInput.postalCode", "Postal Code"),
          field: "postalCode",
          fieldType: "text",
        },
        {
          label: pt("addressInput.countryCode", "Country Code"),
          field: "countryCode",
          fieldType: "text",
        },
      ],
    });
  },
};
