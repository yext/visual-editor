import { CustomField } from "@measured/puck";
import { ConstantFields } from "./ConstantField.tsx";

export const CTA_CONSTANT_CONFIG: CustomField<
  { label: string; link: string; linkType: string }[]
> = {
  type: "custom",
  render: ({ onChange, value }) => {
    return ConstantFields({
      onChange: onChange,
      value: value,
      fields: [
        {
          label: "Label",
          field: "label",
          fieldType: "text",
        },
        {
          label: "Link",
          field: "link",
          fieldType: "text",
        },
        {
          label: "Link Type",
          field: "linkType",
          fieldType: "select",
          options: [
            {
              label: "URL",
              value: "URL",
            },
            {
              label: "Email",
              value: "EMAIL",
            },
            {
              label: "Phone",
              value: "PHONE",
            },
            {
              label: "Click to Website",
              value: "CLICK_TO_WEBSITE",
            },
            {
              label: "Driving Directions",
              value: "DRIVING_DIRECTIONS",
            },
            {
              label: "Other",
              value: "OTHER",
            },
          ],
        },
      ],
    });
  },
};
