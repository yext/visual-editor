import { AutoField, CustomField, Field } from "@measured/puck";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import {
  EnhancedTranslatableCTA,
  PresetImageType,
} from "../../../types/types.ts";
import React, { useMemo } from "react";
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

export const ENHANCED_CTA_CONSTANT_CONFIG: CustomField<EnhancedTranslatableCTA> =
  {
    type: "custom",
    render: ({ onChange, value }) => {
      const labelField = useMemo(() => {
        return TranslatableStringField<EnhancedTranslatableCTA["label"]>(
          msg("label", "Label"),
          { types: ["type.string"] }
        );
      }, []);

      const showLabel = value?.ctaType !== "presetImage";
      const showCoordinate = value?.ctaType === "getDirections";
      const showPresetImage = value?.ctaType === "presetImage";

      return (
        <div className={"ve-mt-3"}>
          {showLabel && (
            <AutoField
              field={labelField}
              value={value.label}
              onChange={(newValue) => onChange({ ...value, label: newValue })}
            />
          )}
          <AutoField
            field={{
              type: "select",
              label: pt("ctaType", "CTA Type"),
              options: ctaTypeOptions(),
            }}
            value={value.ctaType || "textAndLink"}
            onChange={(newValue) => {
              const updatedValue = { ...value, ctaType: newValue };
              // Clear label when switching to preset image
              if (newValue === "presetImage") {
                updatedValue.label = { en: "", hasLocalizedValue: "true" };
              }
              onChange(updatedValue);
            }}
          />
          <AutoField
            field={{
              type: "text",
              label: pt("Link", "Link"),
            }}
            value={value.link || ""}
            onChange={(newValue) => onChange({ ...value, link: newValue })}
          />
          <AutoField
            field={{
              type: "select",
              label: pt("linkType", "Link Type"),
              options: linkTypeOptions(),
            }}
            value={value.linkType || "URL"}
            onChange={(newValue) => onChange({ ...value, linkType: newValue })}
          />
          {showPresetImage && (
            <AutoField
              field={{
                type: "select",
                label: pt("presetImageType", "Preset Image Type"),
                options: presetImageTypeOptions(),
              }}
              value={value.presetImageType || "phone"}
              onChange={(newValue) =>
                onChange({ ...value, presetImageType: newValue })
              }
            />
          )}
          {showCoordinate && (
            <>
              <AutoField
                field={{
                  type: "number",
                  label: pt("coordinate.latitude", "Latitude"),
                }}
                value={value.coordinate?.latitude || 0}
                onChange={(newValue) =>
                  onChange({
                    ...value,
                    coordinate: {
                      latitude: newValue,
                      longitude: value.coordinate?.longitude || 0,
                    },
                  })
                }
              />
              <AutoField
                field={{
                  type: "number",
                  label: pt("coordinate.longitude", "Longitude"),
                }}
                value={value.coordinate?.longitude || 0}
                onChange={(newValue) =>
                  onChange({
                    ...value,
                    coordinate: {
                      latitude: value.coordinate?.latitude || 0,
                      longitude: newValue,
                    },
                  })
                }
              />
            </>
          )}
        </div>
      );
    },
  };

// Fields for EnhancedTranslatableCTA with labels
export const enhancedTranslatableCTAFields = (): Field<
  EnhancedTranslatableCTA | undefined
> => {
  const labelField = useMemo(() => {
    return TranslatableStringField<EnhancedTranslatableCTA["label"]>(
      msg("fields.label", "Label"),
      { types: ["type.string"] }
    );
  }, []);

  return {
    type: "object",
    label: pt("fields.callToAction", "Call To Action"),
    objectFields: {
      label: labelField,
      ctaType: {
        label: pt("fields.ctaType", "CTA Type"),
        type: "select",
        options: ctaTypeOptions(),
      },
      link: {
        label: pt("fields.link", "Link"),
        type: "text",
      },
      linkType: {
        label: pt("fields.linkType", "Link Type"),
        type: "select",
        options: linkTypeOptions(),
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
