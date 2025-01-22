import * as React from "react";
import { Link, LinkType } from "@yext/pages-components";
import { Button, ButtonProps } from "./button.js";

export interface CTAProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  link?: string;
  linkType?: LinkType;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  borderRadius?: ButtonProps["borderRadius"];
  fontSize?: ButtonProps["fontSize"];
}

const CTA = ({
  label,
  link,
  linkType,
  variant,
  size,
  borderRadius,
  className,
  fontSize = "default",
}: CTAProps) => {
  return (
    <Button
      asChild
      className={className}
      variant={variant}
      size={size}
      borderRadius={borderRadius}
      fontSize={fontSize}
    >
      <Link cta={{
        link: link ?? "",
        linkType: linkType,
      }}>{label}</Link>
    </Button>
  );
};

CTA.displayName = "CTA";

export { CTA };
