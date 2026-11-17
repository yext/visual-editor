import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { themeManagerCn } from "../../utils/cn.ts";
import { ThemeColor } from "../../utils/themeConfigOptions.ts";
import { getTextColorStyle } from "../../utils/colors.ts";
import { useThemeData } from "../../hooks/useThemeData.ts";
import {
  resolveThemeEntry,
  resolveThemeColor,
} from "../../utils/dynamicTheme.ts";

// Define the variants for the body component
export const bodyVariants = cva("components", {
  variants: {
    variant: {
      xs: "text-xs",
      sm: "text-sm",
      base: "",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "base",
  },
});

// Omit 'color' from HTMLAttributes<HTMLParagraphElement> to avoid conflict
export interface BodyProps
  extends
    Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">,
    VariantProps<typeof bodyVariants> {
  color?: ThemeColor;
  typographyId?: string;
}

export const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  ({ className, variant, color, style, typographyId, ...props }, ref) => {
    const theme = useThemeData();
    const typography = resolveThemeEntry(theme.typography, typographyId);
    return (
      <p
        data-ve-typography={typography.id}
        className={themeManagerCn(bodyVariants({ variant }), className)}
        style={{
          ...getTextColorStyle(color),
          ...(color?.colorId !== undefined
            ? { color: resolveThemeColor(theme, color, true) }
            : {}),
          ...style,
        }}
        ref={ref}
        {...props}
      >
        {props.children}
      </p>
    );
  }
);
Body.displayName = "Body";
