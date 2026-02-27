import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { themeManagerCn } from "../../utils/cn.ts";
import { BackgroundStyle } from "../../utils/themeConfigOptions.ts";
import { normalizeThemeColor } from "../../utils/normalizeThemeColor.ts";

// Define the variants for the body component
export const bodyVariants = cva(
  "components font-body-fontFamily font-body-fontWeight",
  {
    variants: {
      variant: {
        xs: "text-body-xs-fontSize",
        sm: "text-body-sm-fontSize",
        base: "text-body-fontSize",
        lg: "text-body-lg-fontSize",
      },
    },
    defaultVariants: {
      variant: "base",
    },
  }
);

// Omit 'color' from HTMLAttributes<HTMLParagraphElement> to avoid conflict
export interface BodyProps
  extends
    Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">,
    VariantProps<typeof bodyVariants> {
  color?: BackgroundStyle;
}

export const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  ({ className, variant, color, style, ...props }, ref) => {
    const dynamicStyle = color?.bgColor
      ? { color: `var(--colors-${normalizeThemeColor(color.bgColor)})` }
      : undefined;
    return (
      <p
        className={themeManagerCn(
          bodyVariants({
            variant,
            className,
          }),
          className
        )}
        style={{
          // @ts-ignore: the css variable here resolves to a valid enum value
          textTransform: `var(--textTransform-body-textTransform)`,
          ...dynamicStyle,
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
