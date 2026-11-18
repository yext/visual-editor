import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { themeManagerCn } from "../../utils/cn.ts";
import { getThemeColorCssValue } from "../../utils/colors.ts";
import {
  type ThemeColor,
  type InteractionRole,
  type TypographyRole,
} from "../../utils/themeOptions.ts";

export const variantToInteractionRole = (
  variant?: string | null
): InteractionRole => {
  switch (variant) {
    case "secondary":
      return "secondary-button";
    case "headerFooterMainLink":
    case "headerFooterSecondaryLink":
      return "navigation-link";
    case "link":
    case "directoryLink":
      return "link";
    default:
      return "primary-button";
  }
};

/** Apply a complete typography role to an element that also has an interaction role. */
const typographyRoleStyle = (role: TypographyRole): React.CSSProperties =>
  ({
    "--ve-typography-mobile-size": `var(--ve-${role}-mobile-font-size)`,
    "--ve-typography-size": `var(--ve-${role}-font-size)`,
    fontFamily: `var(--ve-${role}-font-family)`,
    fontWeight: `var(--ve-${role}-font-weight)`,
    fontStyle: `var(--ve-${role}-font-style)`,
    "--ve-typography-mobile-line-height": `var(--ve-${role}-mobile-line-height)`,
    "--ve-typography-line-height": `var(--ve-${role}-line-height)`,
    letterSpacing: `var(--ve-${role}-letter-spacing)`,
    textTransform: `var(--ve-${role}-text-transform)`,
  }) as React.CSSProperties;

export const buttonLayoutVariants = cva(
  "components h-fit flex items-center justify-center",
  {
    variants: {
      variant: {
        primary: "sm:w-fit w-full",
        secondary: "sm:w-fit w-full",
        link: "w-fit gap-2",
        directoryLink:
          "border-b sm:border-transparent w-full sm:w-fit py-3 gap-2",
        headerFooterMainLink: "",
        headerFooterSecondaryLink: "",
      },
      linkPadding: { none: "", yOnly: "py-3" },
    },
    defaultVariants: { variant: "primary", linkPadding: "none" },
  }
);

export interface ButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonLayoutVariants> {
  asChild?: boolean;
  interactionRole?: InteractionRole;
  typographyRole?: TypographyRole;
  color?: ThemeColor;
  labelColor?: ThemeColor;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      interactionRole,
      typographyRole,
      color,
      labelColor,
      style,
      asChild = false,
      linkPadding = "none",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const role = interactionRole ?? variantToInteractionRole(variant);
    const selected = getThemeColorCssValue(color);
    const explicit: React.CSSProperties =
      role === "primary-button"
        ? {
            background: selected,
            borderColor: selected,
            color: getThemeColorCssValue(color?.contrastingColor),
          }
        : role === "secondary-button"
          ? { borderColor: selected, color: selected }
          : { color: selected };
    return (
      <Comp
        className={themeManagerCn(
          buttonLayoutVariants({ variant, linkPadding }),
          `ve-theme-${role}`,
          typographyRole && `ve-theme-${typographyRole}`,
          typographyRole && "ve-theme-typography-override",
          className
        )}
        style={{
          ...(typographyRole ? typographyRoleStyle(typographyRole) : {}),
          ...explicit,
          ...(labelColor ? { color: getThemeColorCssValue(labelColor) } : {}),
          ...style,
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
