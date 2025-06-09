import { CustomField } from "@measured/puck";
import { AddressType } from "@yext/pages-components";
import { ConstantFields } from "./ConstantField.tsx";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";

export const ADDRESS_CONSTANT_CONFIG: CustomField<AddressType> = {
  type: "custom",
  render: ({ onChange, value }) => {
    const { t } = usePlatformTranslation();

    return ConstantFields({
      onChange: onChange,
      value: value,
      fields: [
        {
          label: t("addressInput.line1", "Line 1"),
          field: "line1",
          fieldType: "text",
        },
        {
          label: t("addressInput.line2", "Line 2"),
          field: "line2",
          fieldType: "text",
        },
        {
          label: t("addressInput.line3", "Line 3"),
          field: "line3",
          fieldType: "text",
        },
        {
          label: t("addressInput.city", "City"),
          field: "city",
          fieldType: "text",
        },
        {
          label: t("addressInput.region", "State/Region"),
          field: "region",
          fieldType: "text",
        },
        {
          label: t("addressInput.sublocality", "Sublocality"),
          field: "sublocality",
          fieldType: "text",
        },
        {
          label: t("addressInput.postalCode", "Postal Code"),
          field: "postalCode",
          fieldType: "text",
        },
        {
          label: t("addressInput.countryCode", "Country Code"),
          field: "countryCode",
          fieldType: "text",
        },
      ],
    });
  },
};
