import React from "react";
import { Link } from "@yext/pages-components";
import { Button, ButtonProps } from "./button.tsx";

export interface CTAProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  url?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  fontSize?: ButtonProps["fontSize"];
}

const CTA = ({ label, url, variant, size, className, fontSize }: CTAProps) => {
  return (
    <Button
      asChild
      className={className}
      variant={variant}
      size={size}
      fontSize={fontSize}
    >
      <Link href={url ?? ""}>{label}</Link>
    </Button>
  );
};

CTA.displayName = "CTA";

export { CTA };
