import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../internal/utils/cn.ts";

// Define the variants for the body component
const bodyVariants = cva("", {
  variants: {
    textSize: {
      default: "",
    },
    fontWeight: {
      thin: "font-thin",
      extralight: "font-extralight",
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
      black: "font-black",
    },
    color: {
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent",
      text: "text-text",
      background: "text-primary-background",
    },
    textTransform: {
      none: "normal-case",
      uppercase: "uppercase",
      lowercase: "lowercase",
      capitalize: "capitalize",
    },
  },
  defaultVariants: {
    textSize: "default",
    fontWeight: "normal",
    color: "text",
    textTransform: "none",
  },
});

// Omit 'color' from HTMLAttributes<HTMLParagraphElement> to avoid conflict
export interface BodyProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">,
    VariantProps<typeof bodyVariants> {}

const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  (
    { className, textSize, fontWeight, color, textTransform, ...props },
    ref
  ) => {
    return (
      <p
        className={cn(
          bodyVariants({
            textSize,
            fontWeight,
            color,
            textTransform,
            className,
          })
        )}
        ref={ref}
        {...props}
      >
        {props.children}
      </p>
    );
  }
);
Body.displayName = "Body";

export { Body, bodyVariants };
