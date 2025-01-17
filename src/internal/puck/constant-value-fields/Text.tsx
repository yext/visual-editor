import { CustomField } from "@measured/puck";
import { ConstantFields } from "./ConstantField.tsx";

export const TEXT_CONSTANT_CONFIG: CustomField = {
  type: "custom",
  render: ({ onChange, value }) => {
    return ConstantFields({
      onChange: onChange,
      value: value,
      fields: [
        {
          label: "Text",
          field: "text",
          fieldType: "text",
        },
      ],
    });
  },
};
