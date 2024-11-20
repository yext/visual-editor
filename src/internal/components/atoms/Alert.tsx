import { cva, type VariantProps } from "class-variance-authority";
import { yextCn } from "../../../utils/yextCn.ts";
import React from "react";

const alertVariants = cva(
  "ve-relative ve-rounded ve-border ve-mx-4 ve-my-3 ve-p-4 ve-[&>svg~*]:pl-7 ve-[&>svg+div]:translate-y-[-3px] ve-[&>svg]:absolute ve-[&>svg]:left-4 ve-[&>svg]:top-4 ve-[&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "ve-bg-background ve-text-foreground",
        destructive:
          "ve-border-destructive/50 ve-text-destructive ve-dark:border-destructive ve-[&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={yextCn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={yextCn(
      "ve-mb-1 ve-font-medium ve-leading-none ve-tracking-tight",
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={yextCn("ve-text-sm [&_p]:ve-leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
