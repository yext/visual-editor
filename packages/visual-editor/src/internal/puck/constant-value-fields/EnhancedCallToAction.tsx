import { AutoField, CustomField, FieldLabel } from "@measured/puck";
import { useMemo } from "react";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import {
  EnhancedTranslatableCTA,
  TranslatableString,
} from "../../../types/types.ts";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { linkTypeOptions } from "./CallToAction.tsx";
import { EntityFieldTypes } from "../../../internal/utils/getFilteredEntityFields.ts";

export const ctaTypeOptions = () => {
  return [
    {
      label: pt("ctaTypes.link", "Link"),
      value: ["type.cta"],
    },
    {
      label: pt("ctaTypes.getDirections", "Get Directions"),
      value: ["type.coordinate"],
    },
  ];
};

export const ctaTypeToEntityFieldType: Record<string, EntityFieldTypes> = {
  link: "type.cta",
  getDirections: "type.coordinate",
};

export const ENHANCED_CTA_LINK_CONSTANT_CONFIG: CustomField<EnhancedTranslatableCTA> =
  {
    type: "custom",
    render: ({ onChange, value }) => {
      const labelField = useMemo(() => {
        return TranslatableStringField<TranslatableString>(
          msg("fields.label", "Label"),
          { types: ["type.string"] }
        );
      }, []);

      return (
        <div className="ve-mt-3 flex flex-col gap-3">
          <div>
            <AutoField
              field={labelField}
              value={value?.label}
              onChange={(newValue) => onChange({ ...value, label: newValue })}
            />
          </div>
          <FieldLabel label={pt("fields.link", "Link")} el="div">
            <AutoField
              field={{ type: "text" }}
              value={value?.link || ""}
              onChange={(newValue) => onChange({ ...value, link: newValue })}
            />
          </FieldLabel>
          <FieldLabel label={pt("fields.linkType", "Link Type")} el="div">
            <AutoField
              field={{
                type: "select",
                options: linkTypeOptions(),
              }}
              value={value?.linkType || "URL"}
              onChange={(newValue) =>
                onChange({ ...value, linkType: newValue })
              }
            />
          </FieldLabel>
        </div>
      );
    },
  };

export const ENHANCED_CTA_COORDINATE_CONSTANT_CONFIG: CustomField<EnhancedTranslatableCTA> =
  {
    type: "custom",
    render: ({ onChange, value }) => {
      const labelField = useMemo(() => {
        return TranslatableStringField<TranslatableString>(
          msg("fields.label", "Label"),
          { types: ["type.string"] }
        );
      }, []);

      return (
        <div className="ve-mt-3 ve-flex ve-flex-col ve-gap-3">
          <div className="ve-mb-3">
            <AutoField
              field={labelField}
              value={value?.label}
              onChange={(newValue) => onChange({ ...value, label: newValue })}
            />
          </div>
          <FieldLabel label={pt("fields.latitude", "Latitude")} el="div">
            <AutoField
              field={{ type: "number" }}
              value={value?.latitude ?? 0}
              onChange={(newValue) =>
                onChange({
                  ...value,
                  latitude: newValue,
                  longitude: value?.longitude ?? 0,
                })
              }
            />
          </FieldLabel>
          <FieldLabel label={pt("fields.longitude", "Longitude")} el="div">
            <AutoField
              field={{ type: "number" }}
              value={value?.longitude ?? 0}
              onChange={(newValue) =>
                onChange({
                  ...value,
                  latitude: value?.latitude ?? 0,
                  longitude: newValue,
                })
              }
            />
          </FieldLabel>
        </div>
      );
    },
  };

// Restricted constant config for components that should only use textAndLink CTA type
export const LINK_ONLY_CTA_CONFIG: CustomField<EnhancedTranslatableCTA> = {
  type: "custom",
  render: ({ onChange, value }) => {
    const labelField = TranslatableStringField<any>(
      msg("fields.label", "Label"),
      {
        types: ["type.string"],
      }
    );
    return (
      <div className={"ve-mt-3"}>
        <div className="ve-mb-3">
          <FieldLabel label={pt("fields.callToAction", "Call To Action")}>
            <AutoField
              field={labelField}
              value={value?.label}
              onChange={(newValue) => onChange({ ...value, label: newValue })}
            />
          </FieldLabel>
        </div>
        <div className="ve-mb-3">
          <FieldLabel label={pt("fields.link", "Link")}>
            <AutoField
              field={{ type: "text" }}
              value={value?.link || ""}
              onChange={(newValue) => onChange({ ...value, link: newValue })}
            />
          </FieldLabel>
        </div>
        <div className="ve-mb-3">
          <FieldLabel label={pt("fields.linkType", "Link Type")}>
            <AutoField
              field={{
                type: "select",
                options: linkTypeOptions(),
              }}
              value={value?.linkType || "URL"}
              onChange={(newValue) =>
                onChange({ ...value, linkType: newValue })
              }
            />
          </FieldLabel>
        </div>
      </div>
    );
  },
};
