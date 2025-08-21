import { AutoField, CustomField, Field, FieldLabel } from "@measured/puck";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import {
  EnhancedTranslatableCTA,
  PresetImageType,
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
  getDirections: "type.coordinate",
  presetImage: "type.cta",
};

export const getCTATypeAndCoordinate = <T extends Record<string, any>>(
  entityField: YextEntityField<T>,
  cta: any
) => {
  const ctaType = entityField.constantValueEnabled
    ? entityField.constantValue.ctaType
    : entityField.selectedType;
  const coordinate =
    cta && "latitude" in cta && "longitude" in cta
      ? {
          latitude: (cta as any).latitude,
          longitude: (cta as any).longitude,
        }
      : cta?.coordinate;

  return { ctaType, coordinate };
};

export const presetImageTypeOptions = (): {
  label: string;
  value: PresetImageType;
}[] => {
  return [
    { label: pt("presetImages.appStore", "App Store"), value: "app-store" },
    {
      label: pt("presetImages.googlePlay", "Google Play"),
      value: "google-play",
    },
    {
      label: pt("presetImages.galaxyStore", "Galaxy Store"),
      value: "galaxy-store",
    },
    {
      label: pt("presetImages.appGallery", "App Gallery"),
      value: "app-gallery",
    },
    { label: pt("presetImages.uberEats", "Uber Eats"), value: "uber-eats" },
  ];
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
      const showCoordinate = value?.ctaType === "getDirections";
      const showPresetImage = value?.ctaType === "presetImage";
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
                    updatedValue.presetImageType =
                      updatedValue?.presetImageType || "app-store";
                  } else if (newValue === "getDirections") {
                    updatedValue.label = updatedValue?.label || {
                      en: "Get Directions",
                      hasLocalizedValue: "true",
                    };
                    updatedValue.coordinate = updatedValue?.coordinate || {
                      latitude: 0,
                      longitude: 0,
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
          {showPresetImage && (
            <div className="ve-mb-3">
              <FieldLabel
                label={pt("fields.presetImageType", "Preset Image Type")}
              >
                <AutoField
                  field={{
                    type: "select",
                    options: presetImageTypeOptions(),
                  }}
                  value={value?.presetImageType ?? "app-store"}
                  onChange={(newValue) =>
                    onChange({ ...value, presetImageType: newValue })
                  }
                />
              </FieldLabel>
            </div>
          )}
          {showCoordinate && (
            <>
              <div className="ve-mb-3">
                <FieldLabel label={pt("fields.latitude", "Latitude")}>
                  <AutoField
                    field={{ type: "number" }}
                    value={value?.coordinate?.latitude ?? 0}
                    onChange={(newValue) =>
                      onChange({
                        ...value,
                        coordinate: {
                          latitude: newValue,
                          longitude: value?.coordinate?.longitude ?? 0,
                        },
                      })
                    }
                  />
                </FieldLabel>
              </div>
              <div className="ve-mb-3">
                <FieldLabel label={pt("fields.longitude", "Longitude")}>
                  <AutoField
                    field={{ type: "number" }}
                    value={value?.coordinate?.longitude ?? 0}
                    onChange={(newValue) =>
                      onChange({
                        ...value,
                        coordinate: {
                          latitude: value?.coordinate?.latitude ?? 0,
                          longitude: newValue,
                        },
                      })
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
        presetImageType: {
          label: pt("fields.presetImageType", "Preset Image Type"),
          type: "select",
          options: presetImageTypeOptions(),
        },
        coordinate: {
          label: pt("fields.coordinate", "Coordinate"),
          type: "object",
          objectFields: {
            latitude: {
              label: pt("fields.latitude", "Latitude"),
              type: "number",
            },
            longitude: {
              label: pt("fields.longitude", "Longitude"),
              type: "number",
            },
          },
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
