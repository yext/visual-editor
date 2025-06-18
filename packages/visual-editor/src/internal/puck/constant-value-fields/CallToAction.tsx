import { AutoField, CustomField, Field } from "@measured/puck";
import { ConstantFields } from "./ConstantField.tsx";
import { msg, pt } from "../../../utils/i18nPlatform.ts";
import { TranslatableCTA, TranslatableString } from "../../../types/types.ts";
import React, { useMemo } from "react";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";

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
      return TranslatableStringField<TranslatableString | undefined>(
        msg("label", "Label"),
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
    return TranslatableStringField<TranslatableString | undefined>(
      msg("fields.label", "Label"),
      "text"
    );
  }, []);

  return {
    type: "object",
    label: pt("fields.callToAction", "Call To Action"),
    objectFields: {
      label: labelField,
      link: {
        label: pt("fields.link", "Link"),
        type: "text",
      },
      linkType: {
        label: pt("fields.linkType", "Link Type"),
        type: "select",
        options: linkTypeOptions(),
      },
    },
  };
};
