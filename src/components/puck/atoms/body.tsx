import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../internal/utils/cn.ts";

// Define the variants for the body component
const bodyVariants = cva("components", {
  variants: {
    fontWeight: {
      default: "",
      thin: "ve-font-thin",
      extralight: "ve-font-extralight",
      light: "ve-font-light",
      normal: "ve-font-normal",
      medium: "ve-font-medium",
      semibold: "ve-font-semibold",
      bold: "ve-font-bold",
      extrabold: "ve-font-extrabold",
      black: "ve-font-black",
    },
    color: {
      default: "",
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent",
      text: "text-text",
      background: "text-primary-background",
    },
    textTransform: {
      none: "ve-normal-case",
      uppercase: "ve-uppercase",
      lowercase: "ve-lowercase",
      capitalize: "ve-capitalize",
    },
  },
  defaultVariants: {
    fontWeight: "default",
    color: "default",
    textTransform: "none",
  },
});

// Omit 'color' from HTMLAttributes<HTMLParagraphElement> to avoid conflict
export interface BodyProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">,
    VariantProps<typeof bodyVariants> {
  textSize?: number;
}

const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  (
    { className, textSize, fontWeight, color, textTransform, ...props },
    ref
  ) => {
    const dynamicStyles = {
      fontSize: (textSize ?? 16) + "px",
    };

    return (
      <p
        className={cn(
          bodyVariants({
            fontWeight,
            color,
            textTransform,
            className,
          })
        )}
        ref={ref}
        style={dynamicStyles}
        {...props}
      >
        {props.children}
      </p>
    );
  }
);
Body.displayName = "Body";

export { Body, bodyVariants };
