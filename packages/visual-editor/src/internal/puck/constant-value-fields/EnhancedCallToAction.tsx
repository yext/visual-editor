import { AutoField, CustomField, Field, FieldLabel } from "@measured/puck";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import {
  EnhancedTranslatableCTA,
  TranslatableString,
} from "../../../types/types.ts";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { linkTypeOptions } from "./CallToAction.tsx";
import { useMemo } from "react";
import { YextEntityField } from "@yext/visual-editor";

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

export const ctaTypeToEntityFieldType = {
  textAndLink: "type.cta",
  presetImage: "type.cta",
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
                    updatedValue.label = { en: "", hasLocalizedValue: "true" };
                  } else if (newValue === "getDirections") {
                    updatedValue.label = updatedValue?.label || {
                      en: "Get Directions",
                      hasLocalizedValue: "true",
                    };
                  } else if (newValue === "textAndLink") {
                    updatedValue.label = updatedValue?.label || {
                      en: "Learn More",
                      hasLocalizedValue: "true",
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
                <FieldLabel label={pt("fields.link", "Link")}>
                  <AutoField
                    field={{ type: "text" }}
                    value={value?.link || ""}
                    onChange={(newValue) =>
                      onChange({ ...value, link: newValue })
                    }
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
            </>
          )}
        </div>
      );
    },
  };

export const enhancedTranslatableCTAFields =
  (): Field<EnhancedTranslatableCTA> => {
    const labelField = TranslatableStringField<any>(
      msg("fields.label", "Label"),
      { types: ["type.string"] }
    );
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
        ctaType: {
          label: pt("fields.ctaType", "CTA Type"),
          type: "select",
          options: ctaTypeOptions(),
        },
      },
    };
  };

// Restricted CTA fields for page sections that should only show "Text & Link" options
export const restrictedTranslatableCTAFields =
  (): Field<EnhancedTranslatableCTA> => {
    const labelField = TranslatableStringField<any>(
      msg("fields.label", "Label"),
      { types: ["type.string"] }
    );
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
        // Note: ctaType is not included here, so it will default to "textAndLink"
        // and cannot be changed in the editor
      },
    };
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
