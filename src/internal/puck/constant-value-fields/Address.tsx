import { CustomField } from "@measured/puck";
import { AddressType } from "@yext/pages-components";
import { ConstantFields } from "./ConstantField.tsx";

export const ADDRESS_CONSTANT_CONFIG: CustomField<AddressType> = {
  type: "custom",
  render: ({ onChange, value }) => {
    return ConstantFields({
      onChange: onChange,
      value: value,
      fields: [
        {
          label: "Line 1",
          field: "line1",
          fieldType: "text",
        },
        {
          label: "Line 2",
          field: "line2",
          fieldType: "text",
        },
        {
          label: "Line 3",
          field: "line3",
          fieldType: "text",
        },
        {
          label: "City",
          field: "city",
          fieldType: "text",
        },
        {
          label: "State/Region",
          field: "region",
          fieldType: "text",
        },
        {
          label: "Sublocality",
          field: "sublocality",
          fieldType: "text",
        },
        {
          label: "Postal Code",
          field: "postalCode",
          fieldType: "text",
        },
        {
          label: "Country Code",
          field: "countryCode",
          fieldType: "text",
        },
      ],
    });
  },
};
