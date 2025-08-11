import { AutoField, CustomField, Field, FieldLabel } from "@measured/puck";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import { PresetImageType } from "../../../types/types.ts";
import React from "react";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";

export const linkTypeOptions = () => {
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

export const presetImageTypeOptions = (): {
  label: string;
  value: PresetImageType;
}[] => {
  return [
    { label: pt("presetImages.phone", "Phone"), value: "phone" },
    { label: pt("presetImages.email", "Email"), value: "email" },
    { label: pt("presetImages.location", "Location"), value: "location" },
    { label: pt("presetImages.calendar", "Calendar"), value: "calendar" },
    { label: pt("presetImages.star", "Star"), value: "star" },
    { label: pt("presetImages.heart", "Heart"), value: "heart" },
    { label: pt("presetImages.share", "Share"), value: "share" },
    { label: pt("presetImages.download", "Download"), value: "download" },
    { label: pt("presetImages.play", "Play"), value: "play" },
    { label: pt("presetImages.pause", "Pause"), value: "pause" },
    { label: pt("presetImages.next", "Next"), value: "next" },
    { label: pt("presetImages.previous", "Previous"), value: "previous" },
    { label: pt("presetImages.menu", "Menu"), value: "menu" },
    { label: pt("presetImages.search", "Search"), value: "search" },
    { label: pt("presetImages.close", "Close"), value: "close" },
    { label: pt("presetImages.check", "Check"), value: "check" },
    { label: pt("presetImages.plus", "Plus"), value: "plus" },
    { label: pt("presetImages.minus", "Minus"), value: "minus" },
    {
      label: pt("presetImages.arrowRight", "Arrow Right"),
      value: "arrow-right",
    },
    { label: pt("presetImages.arrowLeft", "Arrow Left"), value: "arrow-left" },
    { label: pt("presetImages.arrowUp", "Arrow Up"), value: "arrow-up" },
    { label: pt("presetImages.arrowDown", "Arrow Down"), value: "arrow-down" },
  ];
};

export const ENHANCED_CTA_CONSTANT_CONFIG: CustomField<any> = {
  type: "custom",
  render: ({ onChange, value }) => {
    const labelField = TranslatableStringField<any>(msg("label", "Label"), {
      types: ["type.string"],
    });

    const showLabel = value?.ctaType !== "presetImage";
    const showCoordinate = value?.ctaType === "getDirections";
    const showPresetImage = value?.ctaType === "presetImage";

    return (
      <div className={"ve-mt-3"}>
        <div className="ve-mb-3">
          <FieldLabel label={pt("fields.ctaType", "CTA Type")}>
            <AutoField
              field={{
                type: "select",
                options: ctaTypeOptions(),
              }}
              value={value.ctaType || "textAndLink"}
              onChange={(newValue) => {
                const updatedValue = { ...value, ctaType: newValue };

                // Set defaults based on CTA type
                if (newValue === "presetImage") {
                  updatedValue.label = { en: "", hasLocalizedValue: "true" };
                  updatedValue.presetImageType =
                    updatedValue.presetImageType || "phone";
                } else if (newValue === "getDirections") {
                  updatedValue.label = updatedValue.label || {
                    en: "Get Directions",
                    hasLocalizedValue: "true",
                  };
                  updatedValue.coordinate = updatedValue.coordinate || {
                    latitude: 0,
                    longitude: 0,
                  };
                } else if (newValue === "textAndLink") {
                  updatedValue.label = updatedValue.label || {
                    en: "Learn More",
                    hasLocalizedValue: "true",
                  };
                  // Clear preset image and coordinate fields
                  delete updatedValue.presetImageType;
                  delete updatedValue.coordinate;
                }

                onChange(updatedValue);
              }}
            />
          </FieldLabel>
        </div>
        {showLabel && (
          <AutoField
            field={labelField}
            value={value.label}
            onChange={(newValue) => onChange({ ...value, label: newValue })}
          />
        )}
        <div className="ve-mb-3">
          <FieldLabel label={pt("fields.link", "Link")}>
            <AutoField
              field={{ type: "text" }}
              value={value.link || ""}
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
              value={value.linkType || "URL"}
              onChange={(newValue) =>
                onChange({ ...value, linkType: newValue })
              }
            />
          </FieldLabel>
        </div>
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
                value={value.presetImageType ?? "phone"}
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
                  value={value.coordinate?.latitude ?? 0}
                  onChange={(newValue) =>
                    onChange({
                      ...value,
                      coordinate: {
                        latitude: newValue,
                        longitude: value.coordinate?.longitude ?? 0,
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
                  value={value.coordinate?.longitude ?? 0}
                  onChange={(newValue) =>
                    onChange({
                      ...value,
                      coordinate: {
                        latitude: value.coordinate?.latitude ?? 0,
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

export const enhancedTranslatableCTAFields = (): Field<any> => {
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
export const restrictedTranslatableCTAFields = (): Field<any> => {
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
export const LINK_ONLY_CTA_CONFIG: CustomField<any> = {
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
