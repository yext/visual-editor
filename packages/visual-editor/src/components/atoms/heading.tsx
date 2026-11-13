import {
  ThemeColor,
  HeadingLevel,
  type TypographyRole,
  fontSizeOptions,
} from "../../utils/themeOptions.ts";
import { themeManagerCn } from "../../utils/cn.ts";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { getTextColorClass, getTextColorStyle } from "../../utils/colors.ts";

const headingLevelToTypographyRole = (level?: HeadingLevel): TypographyRole =>
  level === 1 ? "headline" : level === 2 ? "section-title" : "card-title";

// Default size and weight inherit the selected typography role.
export const headingVariants = cva("components", {
  variants: {
    typographyRole: {
      headline: "ve-theme-headline",
      "section-title": "ve-theme-section-title",
      "card-title": "ve-theme-card-title",
      eyebrow: "ve-theme-eyebrow",
      "body-small": "ve-theme-body-small",
      body: "ve-theme-body",
      "body-large": "ve-theme-body-large",
    },
    fontSize: {
      default: "",
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
    weight: {
      default: "",
      "100": "font-thin",
      "200": "font-extralight",
      "300": "font-light",
      "400": "font-normal",
      "500": "font-medium",
      "600": "font-semibold",
      "700": "font-bold",
      "800": "font-extrabold",
      "900": "font-black",
    },
  },
  defaultVariants: {
    fontSize: "default",
    weight: "default",
  },
});

// Omit 'color' from HTMLAttributes<HTMLHeadingElement> to avoid conflict
export interface HeadingProps
  extends
    Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">,
    VariantProps<typeof headingVariants> {
  level?: HeadingLevel;
  typographyRole?: TypographyRole;
  semanticLevelOverride?: HeadingLevel | "span" | "p";
  color?: ThemeColor;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      className,
      level = 1,
      typographyRole,
      fontSize = "default",
      weight = "default",
      semanticLevelOverride,
      style,
      color,
      ...props
    },
    ref
  ) => {
    const Tag = (
      semanticLevelOverride
        ? typeof semanticLevelOverride === "string"
          ? semanticLevelOverride
          : `h${semanticLevelOverride}`
        : `h${level}`
    ) as keyof Pick<
      JSX.IntrinsicElements,
      "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "p"
    >;
    const role = typographyRole ?? headingLevelToTypographyRole(level);
    const textColorClass = getTextColorClass(color);
    const fontSizePx =
      fontSize && fontSize !== "default"
        ? fontSizeOptions().find((option) => option.value === fontSize)?.px
        : undefined;

    return (
      <Tag
        className={themeManagerCn(
          headingVariants({ typographyRole: role, fontSize, weight }),
          textColorClass,
          Tag === "span" && "block",
          className
        )}
        style={{
          ...getTextColorStyle(color),
          // Authored overrides must win even when the live theme is injected last.
          ...(fontSizePx ? { fontSize: `${fontSizePx}px` } : {}),
          ...(weight && weight !== "default" ? { fontWeight: weight } : {}),
          ...style,
        }}
        ref={ref}
        {...props}
      >
        {props.children}
      </Tag>
    );
  }
);
Heading.displayName = "Heading";
