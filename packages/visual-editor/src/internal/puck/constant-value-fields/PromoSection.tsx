import { AutoField, CustomField } from "@measured/puck";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import { PromoSectionType } from "../../../types/types.ts";
import React from "react";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { TranslatableRichTextField } from "../../../editor/TranslatableRichTextField.tsx";
import { enhancedTranslatableCTAFields } from "./EnhancedCallToAction.tsx";

export const PROMO_SECTION_CONSTANT_CONFIG: CustomField<PromoSectionType> = {
  type: "custom",
  render: ({
    onChange,
    value,
  }: {
    value: PromoSectionType;
    onChange: (value: PromoSectionType) => void;
  }) => {
    const titleField = TranslatableStringField<any>(
      msg("fields.title", "Title"),
      { types: ["type.string"] }
    );

    const descriptionField = TranslatableRichTextField<any>(
      msg("fields.description", "Description")
    );

    return (
      <div className={"ve-mt-4"}>
        <AutoField
          field={{
            type: "object",
            label: pt("fields.image", "Image"),
            objectFields: {
              url: {
                label: pt("fields.url", "URL"),
                type: "text",
              },
              height: {
                label: pt("fields.height", "Height"),
                type: "number",
              },
              width: {
                label: pt("fields.width", "Width"),
                type: "number",
              },
            },
          }}
          value={value.image}
          onChange={(newValue) => onChange({ ...value, image: newValue })}
        />
        <AutoField
          field={titleField}
          value={value.title}
          onChange={(newValue) => onChange({ ...value, title: newValue })}
        />
        <AutoField
          field={descriptionField}
          value={value.description}
          onChange={(newValue) => onChange({ ...value, description: newValue })}
        />
        <AutoField
          field={enhancedTranslatableCTAFields()}
          value={value.cta}
          onChange={(newValue) => onChange({ ...value, cta: newValue })}
        />
      </div>
    );
  },
};
