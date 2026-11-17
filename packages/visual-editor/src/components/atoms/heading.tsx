import {
  ThemeColor,
  HeadingLevel,
  fontSizeOptions,
} from "../../utils/themeConfigOptions.ts";
import { themeManagerCn } from "../../utils/cn.ts";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { getTextColorStyle } from "../../utils/colors.ts";
import { useThemeData } from "../../hooks/useThemeData.ts";
import {
  resolveThemeEntry,
  resolveThemeColor,
} from "../../utils/dynamicTheme.ts";

// Define the variants for the heading component
export const headingVariants = cva("components", {
  variants: {
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
  level: HeadingLevel;
  semanticLevelOverride?: HeadingLevel | "span";
  color?: ThemeColor;
  typographyId?: string;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      className,
      level = 1,
      weight,
      fontSize,
      semanticLevelOverride,
      style,
      color,
      typographyId,
      ...props
    },
    ref
  ) => {
    const theme = useThemeData();
    const typography = resolveThemeEntry(theme.typography, typographyId);
    const Tag = (
      semanticLevelOverride
        ? typeof semanticLevelOverride === "string"
          ? semanticLevelOverride
          : `h${semanticLevelOverride}`
        : `h${level}`
    ) as keyof Pick<
      JSX.IntrinsicElements,
      "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span"
    >;

    return (
      <Tag
        data-ve-typography={typography.id}
        className={themeManagerCn(
          headingVariants({
            fontSize,
            weight,
          }),
          Tag === "span" && "block",
          className
        )}
        style={{
          ...getTextColorStyle(color),
          ...(color?.colorId !== undefined
            ? { color: resolveThemeColor(theme, color, true) }
            : {}),
          ...(weight && weight !== "default" ? { fontWeight: weight } : {}),
          ...(fontSize && fontSize !== "default"
            ? {
                fontSize: `${fontSizeOptions().find((option) => option.value === fontSize)?.px}px`,
              }
            : {}),
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
