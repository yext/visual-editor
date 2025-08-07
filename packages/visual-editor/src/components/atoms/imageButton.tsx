import * as React from "react";
import { Link, LinkType } from "@yext/pages-components";
import { Button, ButtonProps } from "./button.js";
import { themeManagerCn } from "@yext/visual-editor";
import { PresetImageType } from "../../types/types";
import { presetImageIcons } from "../../utils/presetImageIcons";

export type ImageButtonProps = {
  link?: string;
  linkType?: LinkType;
  eventName?: string;
  variant?: ButtonProps["variant"];
  className?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  ariaLabel?: string;
  presetImageType: PresetImageType;
};

export const ImageButton = ({
  link,
  linkType,
  variant,
  eventName,
  className,
  target,
  ariaLabel,
  presetImageType,
}: ImageButtonProps) => {
  const icon = presetImageIcons[presetImageType];
  const finalAriaLabel = ariaLabel || `Button with ${presetImageType} icon`;

  return (
    <Button
      asChild
      className={themeManagerCn("flex", className)}
      variant={variant}
    >
      <Link
        cta={{
          link: link || "#",
          linkType: linkType ?? "URL",
        }}
        eventName={eventName}
        target={target}
        aria-label={finalAriaLabel}
      >
        {icon}
      </Link>
    </Button>
  );
};

ImageButton.displayName = "ImageButton";
