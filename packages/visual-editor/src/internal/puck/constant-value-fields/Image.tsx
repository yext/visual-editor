import { CustomField } from "@measured/puck";
import { ImageType } from "@yext/pages-components";
import { ConstantFields } from "./ConstantField.tsx";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";

export const IMAGE_CONSTANT_CONFIG: CustomField<ImageType> = {
  type: "custom",
  render: ({ onChange, value }) => {
    const { t } = usePlatformTranslation();

    return ConstantFields({
      onChange: onChange,
      value: value,
      fields: [
        {
          label: t("url", "URL"),
          field: "url",
          fieldType: "text",
        },
      ],
    });
  },
};
