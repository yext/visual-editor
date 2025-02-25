import * as React from "react";
import { Link } from "@yext/pages-components";
import { cva, VariantProps } from "class-variance-authority";
import { themeManagerCn } from "../../../index.ts";

// Omit 'color' from HTMLAttributes<HTMLParagraphElement> to avoid conflict
interface MaybeLinkProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">,
    VariantProps<typeof linkVariants> {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  eventName?: string;
}

const linkVariants = cva("components", {
  variants: {
    fontSize: {
      default: "text-link-fontSize",
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
      "6xl": "text-6xl",
      "7xl": "text-7xl",
      "8xl": "text-8xl",
      "9xl": "text-9xl",
    },
    color: {
      default: "text-link-color",
      primary: "text-palette-primary",
      secondary: "text-palette-secondary",
      accent: "text-palette-accent",
      text: "text-palette-text",
      background: "text-palette-background",
    },
  },
  defaultVariants: {
    fontSize: "default",
    color: "default",
  },
});

const MaybeLink = (props: MaybeLinkProps) => {
  if (props.href) {
    return (
      <Link
        href={props.href}
        className={themeManagerCn(
          linkVariants({
            fontSize: props.fontSize,
            color: props.color,
          }),
          props.className
        )}
      >
        {props.children}
      </Link>
    );
  } else {
    return <>{props.children}</>;
  }
};
MaybeLink.displayName = "MaybeLink";

export { MaybeLink, type MaybeLinkProps };
