import { CustomField } from "@measured/puck";
import { CTAProps } from "../../../components/puck/atoms/cta.tsx";
import { ConstantFields } from "./ConstantField.tsx";

export const CTA_CONSTANT_CONFIG: CustomField<CTAProps> = {
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
              label: "Other",
              value: "Other",
            },
            {
              label: "URL",
              value: "URL",
            },
            {
              label: "Phone",
              value: "Phone",
            },
            {
              label: "Email",
              value: "Email",
            },
          ],
        },
      ],
    });
  },
};
