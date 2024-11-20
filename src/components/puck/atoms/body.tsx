import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import {
  fontSizeVariants,
  fontWeightVariants,
  colorVariants,
  transformVariants,
} from "../variants.ts";

// Define the variants for the body component
const bodyVariants = cva(
  "components font-body-fontFamily text-body-fontSize text-body-color",
  {
    variants: {
      fontSize: fontSizeVariants,
      fontWeight: fontWeightVariants,
      color: colorVariants,
      textTransform: transformVariants,
    },
    defaultVariants: {
      fontSize: "default",
      fontWeight: "default",
      color: "default",
      textTransform: "none",
    },
  }
);

// Omit 'color' from HTMLAttributes<HTMLParagraphElement> to avoid conflict
export interface BodyProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">,
    VariantProps<typeof bodyVariants> {}

const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  (
    { className, fontSize, fontWeight, color, textTransform, ...props },
    ref
  ) => {
    return (
      <p
        className={clsx(
          className,
          bodyVariants({
            fontSize,
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
