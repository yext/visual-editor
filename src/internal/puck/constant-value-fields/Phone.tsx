import { CustomField } from "@measured/puck";
import { ConstantFields } from "./ConstantField.tsx";

export const PHONE_CONSTANT_CONFIG: CustomField = {
  type: "custom",
  render: ({ onChange, value }) => {
    return ConstantFields({
      onChange: onChange,
      value: value,
      fields: [
        {
          label: "Phone Number",
          field: "phone",
          fieldType: "text",
        },
      ],
    });
  },
};
