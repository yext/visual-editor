import * as React from "react";
import { Link, LinkType } from "@yext/pages-components";
import { Button, ButtonProps } from "./button.js";
import { themeManagerCn } from "@yext/visual-editor";
import { FaAngleRight } from "react-icons/fa";

export interface CTAProps {
  label?: React.ReactNode;
  link?: string;
  linkType?: LinkType;
  eventName?: string;
  variant?: ButtonProps["variant"];
  className?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  alwaysHideCaret?: boolean;
  ariaLabel?: string;
}

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
}: CTAProps) => {
  let caretVisibility = "none";
  if (!alwaysHideCaret) {
    if (variant === "link" && linkType !== "EMAIL" && linkType !== "PHONE") {
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
          link: link || "#",
          linkType: linkType ?? "URL",
        }}
        eventName={eventName}
        target={target}
        aria-label={ariaLabel}
      >
        {label ?? ""}
        <FaAngleRight
          size={"12px"}
          // For directoryLink, the theme value for caret is ignored
          className={variant === "directoryLink" ? "block sm:hidden" : ""}
          style={{
            // display does not support custom Tailwind utilities so the property must be set directly
            display: variant === "directoryLink" ? "" : caretVisibility,
          }}
        />
      </Link>
    </Button>
  );
};

CTA.displayName = "CTA";
