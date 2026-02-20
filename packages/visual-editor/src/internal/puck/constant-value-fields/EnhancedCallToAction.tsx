import { AutoField, CustomField, FieldLabel } from "@puckeditor/core";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import {
  EnhancedTranslatableCTA,
  TranslatableString,
} from "../../../types/types.ts";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { linkTypeOptions } from "./CallToAction.tsx";
import { useMemo } from "react";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { defaultText } from "../../../utils/defaultContent.ts";

export const ctaTypeOptions = () => {
  return [
    {
      label: pt("ctaTypes.textAndLink", "Text & Link"),
      value: "textAndLink",
    },
    {
      label: pt("ctaTypes.getDirections", "Get Directions"),
      value: "getDirections",
    },
    {
      label: pt("ctaTypes.presetImage", "Preset Image"),
      value: "presetImage",
    },
  ];
};

/**
 * Determines the CTA type
 *
 * @param entityField - The Yext entity field containing CTA configuration.
 * @returns An object containing the CTA type
 */
export const getCTAType = <T extends Record<string, any>>(
  entityField: YextEntityField<T>
): {
  ctaType: "textAndLink" | "getDirections" | "presetImage" | undefined;
} => {
  const ctaType = entityField.constantValueEnabled
    ? entityField.constantValue.ctaType
    : entityField.selectedType;

  return { ctaType };
};

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
              <AutoField
                field={{
                  type: "select",
                  options: ctaTypeOptions(),
                }}
                value={value?.ctaType || "textAndLink"}
                onChange={(newValue) => {
                  const updatedValue = { ...value, ctaType: newValue };
                  // Set defaults based on CTA type
                  if (newValue === "presetImage") {
                    updatedValue.label = "";
                  } else if (newValue === "getDirections") {
                    updatedValue.label =
                      updatedValue?.label ||
                      defaultText(
                        "componentDefaults.getDirections",
                        "Get Directions"
                      );
                  } else if (newValue === "textAndLink") {
                    updatedValue.label =
                      updatedValue?.label ||
                      defaultText("componentDefaults.learnMore", "Learn More");
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
              <AutoField
                field={labelField}
                value={value?.label}
                onChange={(newValue) => onChange({ ...value, label: newValue })}
              />
            </div>
          )}
          {showLinkFields && (
            <>
              <div className="ve-mb-3">
                <AutoField
                  field={linkField}
                  value={value?.link || ""}
                  onChange={(newValue) =>
                    onChange({ ...value, link: newValue })
                  }
                />
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
            </>
          )}
        </div>
      );
    },
  };
