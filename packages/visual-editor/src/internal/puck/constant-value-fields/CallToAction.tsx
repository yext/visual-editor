import { AutoField, CustomField, Field } from "@measured/puck";
import { ConstantFields } from "./ConstantField.tsx";
import { pt } from "../../../utils/i18nPlatform.ts";
import { TranslatableCTA, TranslatableString } from "../../../types/types.ts";
import React, { useMemo } from "react";
import { generateTranslatableConfig } from "../../../utils/generateTranslatableConfig.tsx";

const linkTypeOptions = () => {
  return [
    {
      label: pt("linkTypes.url", "URL"),
      value: "URL",
    },
    {
      label: pt("linkTypes.email", "Email"),
      value: "EMAIL",
    },
    {
      label: pt("linkTypes.phone", "Phone"),
      value: "PHONE",
    },
    {
      label: pt("linkTypes.clickToWebsite", "Click to Website"),
      value: "CLICK_TO_WEBSITE",
    },
    {
      label: pt("linkTypes.drivingDirections", "Driving Directions"),
      value: "DRIVING_DIRECTIONS",
    },
    {
      label: pt("linkTypes.other", "Other"),
      value: "OTHER",
    },
  ];
};

export const CTA_CONSTANT_CONFIG: CustomField<TranslatableCTA> = {
  type: "custom",
  render: ({ onChange, value }) => {
    const labelField = useMemo(() => {
      return generateTranslatableConfig<TranslatableString | undefined>(
        {
          key: "label",
          options: {
            defaultValue: "Label",
          },
        },
        "text"
      );
    }, []);

    const constantFields = ConstantFields({
      onChange: onChange,
      value: value,
      fields: [
        {
          label: pt("Link", "Link"),
          field: "link",
          fieldType: "text",
        },
        {
          label: pt("linkType", "Link Type"),
          field: "linkType",
          fieldType: "select",
          options: linkTypeOptions(),
        },
      ],
    });

    return (
      <div className={"ve-mt-3"}>
        <AutoField
          field={labelField}
          value={value.label}
          onChange={(newValue) => onChange({ ...value, label: newValue })}
        />
        {constantFields}
      </div>
    );
  },
};

// Fields for TranslatableCTA with labels
export const translatableCTAFields = (): Field<TranslatableCTA | undefined> => {
  const labelField = useMemo(() => {
    return generateTranslatableConfig<TranslatableString | undefined>(
      {
        key: "label",
        options: {
          defaultValue: "Label",
        },
      },
      "text"
    );
  }, []);

  return {
    type: "object",
    label: pt("Call To Action"),
    objectFields: {
      label: labelField,
      link: {
        label: pt("Link", "Link"),
        type: "text",
      },
      linkType: {
        label: pt("linkType", "Link Type"),
        type: "select",
        options: linkTypeOptions(),
      },
    },
  };
};
