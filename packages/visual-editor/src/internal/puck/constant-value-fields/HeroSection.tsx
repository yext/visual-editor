import { AutoField, CustomField } from "@measured/puck";
import { pt } from "../../../utils/i18n/platform.ts";
import { HeroSectionType } from "../../../types/types.ts";
import React from "react";
import { ENHANCED_CTA_CONSTANT_CONFIG } from "./EnhancedCallToAction.tsx";

export const HERO_SECTION_CONSTANT_CONFIG: CustomField<HeroSectionType> = {
  type: "custom",
  render: ({
    onChange,
    value,
  }: {
    value: HeroSectionType;
    onChange: (value: HeroSectionType) => void;
  }) => {
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
          field={ENHANCED_CTA_CONSTANT_CONFIG}
          value={value.primaryCta}
          onChange={(newValue) => onChange({ ...value, primaryCta: newValue })}
        />
        <AutoField
          field={ENHANCED_CTA_CONSTANT_CONFIG}
          value={value.secondaryCta}
          onChange={(newValue) =>
            onChange({ ...value, secondaryCta: newValue })
          }
        />
      </div>
    );
  },
};
