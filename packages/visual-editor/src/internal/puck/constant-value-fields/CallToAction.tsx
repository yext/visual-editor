import { CustomField, Field } from "@measured/puck";
import { ConstantFields } from "./ConstantField.tsx";
import { CTA } from "@yext/pages-components";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";

const linkTypeOptions = () => {
  const { t } = usePlatformTranslation();

  return [
    {
      label: t("linkTypes.url", "URL"),
      value: "URL",
    },
    {
      label: t("linkTypes.email", "Email"),
      value: "EMAIL",
    },
    {
      label: t("linkTypes.phone", "Phone"),
      value: "PHONE",
    },
    {
      label: t("linkTypes.clickToWebsite", "Click to Website"),
      value: "CLICK_TO_WEBSITE",
    },
    {
      label: t("linkTypes.drivingDirections", "Driving Directions"),
      value: "DRIVING_DIRECTIONS",
    },
    {
      label: t("linkTypes.other", "Other"),
      value: "OTHER",
    },
  ];
};

export const CTA_CONSTANT_CONFIG: CustomField<
  { label: string; link: string; linkType: string }[]
> = {
  type: "custom",
  render: ({ onChange, value }) => {
    const { t } = usePlatformTranslation();

    return ConstantFields({
      onChange: onChange,
      value: value,
      fields: [
        {
          label: t("label", "Label"),
          field: "label",
          fieldType: "text",
        },
        {
          label: t("Link", "Link"),
          field: "link",
          fieldType: "text",
        },
        {
          label: t("linkType", "Link Type"),
          field: "linkType",
          fieldType: "select",
          options: linkTypeOptions(),
        },
      ],
    });
  },
};

// Fields for CTA with labels
export const ctaFields = (): Field<CTA | undefined> => {
  const { t } = usePlatformTranslation();

  return {
    type: "object",
    label: t("Call To Action"),
    objectFields: {
      label: {
        label: t("label", "Label"),
        type: "text",
      },
      link: {
        label: t("Link", "Link"),
        type: "text",
      },
      linkType: {
        label: t("linkType", "Link Type"),
        type: "select",
        options: linkTypeOptions(),
      },
    },
  };
};
