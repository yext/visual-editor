import React from "react";
import { Link } from "@yext/pages-components";
import { Button, ButtonProps } from "./button.tsx";
import { NumberOrDefault } from "../../editor/NumberOrDefaultField.tsx";

export interface CTAProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  url?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  borderRadius?: ButtonProps["borderRadius"];
  fontSize?: NumberOrDefault;
}

const CTA = ({
  label,
  url,
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
      <Link href={url ?? ""}>{label}</Link>
    </Button>
  );
};

CTA.displayName = "CTA";

export { CTA };
