import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { themeManagerCn } from "../../../index.ts";

// Define the variants for the body component
export const bodyVariants = cva(
  "components font-body-fontFamily font-body-fontWeight",
  {
    variants: {
      variant: {
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
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">,
    VariantProps<typeof bodyVariants> {}

export const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <p
        className={themeManagerCn(
          bodyVariants({
            variant,
            className,
          }),
          className
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
