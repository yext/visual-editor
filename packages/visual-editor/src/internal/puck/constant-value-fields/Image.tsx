import { CustomField } from "@measured/puck";
import { ImageType } from "@yext/pages-components";
import { ConstantFields } from "./ConstantField.tsx";

export const IMAGE_CONSTANT_CONFIG: CustomField<ImageType> = {
  type: "custom",
  render: ({ onChange, value }) => {
    return ConstantFields({
      onChange: onChange,
      value: value,
      fields: [
        {
          label: "URL",
          field: "url",
          fieldType: "text",
        },
      ],
    });
  },
};
