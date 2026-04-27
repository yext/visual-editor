import { CustomField, FieldLabel } from "@puckeditor/core";
import { YextAutoField } from "../../../fields/YextAutoField.tsx";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import {
  EnhancedTranslatableCTA,
  TranslatableString,
} from "../../../types/types.ts";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { linkTypeOptions } from "./CallToAction.tsx";
import { useMemo } from "react";
import { ctaTypeOptions } from "../../../internal/utils/ctaFieldUtils.ts";

export const ENHANCED_CTA_CONSTANT_CONFIG: CustomField<EnhancedTranslatableCTA> =
  {
    type: "custom",
    render: ({ onChange, value }) => {
      const labelField = useMemo(() => {
        return TranslatableStringField<TranslatableString>(
          msg("fields.label", "Label"),
          { types: ["type.string"] }
        );
      }, []);

      const linkField = useMemo(() => {
        return TranslatableStringField<TranslatableString>(
          msg("fields.link", "Link"),
          { types: ["type.string"] },
          true,
          false
        );
      }, []);

      const showLabel = value?.ctaType !== "presetImage";
      const showLinkFields = value?.ctaType !== "getDirections";

      return (
        <div className={"ve-mt-3"}>
          <div className="ve-mb-3">
            <FieldLabel label={pt("fields.ctaType", "CTA Type")}>
              <YextAutoField
                field={{
                  type: "basicSelector",
                  options: ctaTypeOptions(),
                }}
                value={value?.ctaType || "textAndLink"}
                onChange={(newValue) => {
                  const updatedValue = { ...value, ctaType: newValue };
                  // Set defaults based on CTA type
                  if (newValue === "presetImage") {
                    updatedValue.label = { defaultValue: "" };
                  } else if (newValue === "getDirections") {
                    updatedValue.label = updatedValue?.label || {
                      defaultValue: "Get Directions",
                    };
                  } else if (newValue === "textAndLink") {
                    updatedValue.label = updatedValue?.label || {
                      defaultValue: "Learn More",
                    };
                    updatedValue.link = updatedValue?.link || "#";
                    updatedValue.linkType = updatedValue?.linkType || "URL";
                  }
                  onChange(updatedValue);
                }}
              />
            </FieldLabel>
          </div>
          {showLabel && (
            <div className="ve-mb-3">
              <YextAutoField
                field={labelField}
                value={value?.label}
                onChange={(newValue) => onChange({ ...value, label: newValue })}
              />
            </div>
          )}
          {showLinkFields && (
            <>
              <div className="ve-mb-3">
                <YextAutoField
                  field={linkField}
                  value={value?.link || ""}
                  onChange={(newValue) =>
                    onChange({ ...value, link: newValue })
                  }
                />
              </div>
              <div className="ve-mb-3">
                <FieldLabel label={pt("fields.linkType", "Link Type")}>
                  <YextAutoField
                    field={{
                      type: "basicSelector",
                      options: linkTypeOptions(),
                    }}
                    value={value?.linkType || "URL"}
                    onChange={(newValue) =>
                      onChange({ ...value, linkType: newValue })
                    }
                  />
                </FieldLabel>
              </div>
            </>
          )}
        </div>
      );
    },
  };
