import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { msg, YextField, PresetImageType } from "@yext/visual-editor";
import { ImageButton } from "../atoms/imageButton";

export interface ImageButtonWrapperProps {
  link?: string;
  linkType?: any;
  eventName?: string;
  variant?: any;
  className?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  ariaLabel?: string;
  presetImageType: PresetImageType;
}

const imageButtonWrapperFields: Fields<ImageButtonWrapperProps> = {
  link: YextField(msg("fields.link", "Link"), {
    type: "text",
  }),
  linkType: YextField(msg("fields.linkType", "Link Type"), {
    type: "select",
    options: [
      { label: "URL", value: "URL" },
      { label: "Phone", value: "PHONE" },
      { label: "Email", value: "EMAIL" },
      { label: "Driving Directions", value: "DRIVING_DIRECTIONS" },
    ],
  }),
  eventName: YextField(msg("fields.eventName", "Event Name"), {
    type: "text",
  }),
  variant: YextField(msg("fields.variant", "Variant"), {
    type: "radio",
    options: "CTA_VARIANT",
  }),
  target: YextField(msg("fields.target", "Target"), {
    type: "select",
    options: [
      { label: "Same Window", value: "_self" },
      { label: "New Window", value: "_blank" },
      { label: "Parent Frame", value: "_parent" },
      { label: "Top Frame", value: "_top" },
    ],
  }),
  ariaLabel: YextField(msg("fields.ariaLabel", "Aria Label"), {
    type: "text",
  }),
  presetImageType: YextField(
    msg("fields.presetImageType", "Preset Image Type"),
    {
      type: "select",
      options: [
        { label: "Phone", value: "phone" },
        { label: "Email", value: "email" },
        { label: "Location", value: "location" },
        { label: "Calendar", value: "calendar" },
        { label: "Star", value: "star" },
        { label: "Heart", value: "heart" },
        { label: "Share", value: "share" },
        { label: "Download", value: "download" },
        { label: "Play", value: "play" },
        { label: "Pause", value: "pause" },
        { label: "Next", value: "next" },
        { label: "Previous", value: "previous" },
        { label: "Menu", value: "menu" },
        { label: "Search", value: "search" },
        { label: "Close", value: "close" },
        { label: "Check", value: "check" },
        { label: "Plus", value: "plus" },
        { label: "Minus", value: "minus" },
        { label: "Arrow Right", value: "arrow-right" },
        { label: "Arrow Left", value: "arrow-left" },
        { label: "Arrow Up", value: "arrow-up" },
        { label: "Arrow Down", value: "arrow-down" },
      ],
    }
  ),
};

const ImageButtonWrapperComponent: React.FC<ImageButtonWrapperProps> = ({
  link,
  linkType,
  eventName,
  variant,
  className,
  target,
  ariaLabel,
  presetImageType,
}) => {
  return (
    <ImageButton
      link={link}
      linkType={linkType}
      eventName={eventName}
      variant={variant}
      className={className}
      target={target}
      ariaLabel={ariaLabel}
      presetImageType={presetImageType}
    />
  );
};

export const ImageButtonWrapper: ComponentConfig<ImageButtonWrapperProps> = {
  label: msg("components.imageButton", "Image Button"),
  fields: imageButtonWrapperFields,
  defaultProps: {
    link: "#",
    linkType: "URL",
    variant: "primary",
    presetImageType: "phone",
  },
  render: (props: ImageButtonWrapperProps) => (
    <ImageButtonWrapperComponent {...props} />
  ),
};
