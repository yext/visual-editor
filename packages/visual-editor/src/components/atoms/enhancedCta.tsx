import * as React from "react";
import { Link, LinkType } from "@yext/pages-components";
import { Button, ButtonProps } from "./button.js";
import { themeManagerCn } from "@yext/visual-editor";
import { FaAngleRight } from "react-icons/fa";
import { getDirections } from "@yext/pages-components";
import { PresetImageType } from "../../types/types";
import { presetImageIcons } from "../../utils/presetImageIcons";

export type CTAProps = {
  label?: React.ReactNode;
  link?: string;
  linkType?: LinkType;
  eventName?: string;
  variant?: ButtonProps["variant"];
  className?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  alwaysHideCaret?: boolean;
  ariaLabel?: string;
  ctaType?: "textAndLink" | "getDirections" | "presetImage";
  coordinate?: { latitude: number; longitude: number };
  presetImageType?: PresetImageType;
};

export const CTA = ({
  label,
  link,
  linkType,
  variant,
  eventName,
  className,
  target,
  alwaysHideCaret,
  ariaLabel,
  ctaType = "textAndLink",
  coordinate,
  presetImageType,
}: CTAProps) => {
  let caretVisibility = "none";
  let finalLink = link || "#";
  let finalLinkType = linkType ?? "URL";
  let finalLabel: React.ReactNode = label ?? "";
  let finalAriaLabel = ariaLabel || "";

  // Handle different CTA types
  switch (ctaType) {
    case "getDirections":
      if (coordinate) {
        const directionsLink = getDirections(
          undefined,
          undefined,
          undefined,
          { provider: "google" },
          coordinate
        );
        finalLink = directionsLink || "#";
        finalLinkType = "DRIVING_DIRECTIONS";
        finalLabel = finalLabel || "Get Directions";
        finalAriaLabel = finalAriaLabel || "Get Directions";
      }
      break;
    case "presetImage":
      if (presetImageType) {
        finalLabel = presetImageIcons[presetImageType];
        finalAriaLabel =
          finalAriaLabel || `Button with ${presetImageType} icon`;
      }
      break;
    case "textAndLink":
    default:
      // Use default behavior
      break;
  }

  if (!alwaysHideCaret) {
    if (
      variant === "link" &&
      finalLinkType !== "EMAIL" &&
      finalLinkType !== "PHONE"
    ) {
      caretVisibility = "var(--display-link-caret)";
    }
  }

  return (
    <Button
      asChild
      className={themeManagerCn("flex", className)}
      variant={variant}
    >
      <Link
        cta={{
          link: finalLink,
          linkType: finalLinkType,
        }}
        eventName={eventName}
        target={target}
        aria-label={finalAriaLabel || undefined}
      >
        {finalLabel || ""}
        {ctaType !== "presetImage" && (
          <FaAngleRight
            size={"12px"}
            className={variant === "directoryLink" ? "block sm:hidden" : ""}
            style={{
              display: variant === "directoryLink" ? "" : caretVisibility,
            }}
          />
        )}
      </Link>
    </Button>
  );
};

CTA.displayName = "CTA";
