import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { themeManagerCn } from "../../../index.ts";

const buttonVariants = cva(
  "py-4 components inline-flex items-center justify-center whitespace-nowrap font-body-fontFamily font-button-fontWeight " +
    "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-button-backgroundColor text-button-textColor border-2 border-button-backgroundColor hover:border-button-textColor " +
          "focus:border-button-textColor active:bg-button-textColor active:text-button-backgroundColor active:border-button-backgroundColor text-button-fontSize",
        // TODO: Update to use styles set in the theme
        seconday:
          "bg-button-backgroundColor text-button-textColor border-2 border-button-backgroundColor hover:border-button-textColor " +
          "focus:border-button-textColor active:bg-button-textColor active:text-button-backgroundColor active:border-button-backgroundColor text-button-fontSize",
        link: "text-link-color text-link-fontSize underline-offset-4 underline hover:no-underline",
      },
      size: {
        small: "h-9 px-3",
        large: "h-11 px-8",
        icon: "h-10 w-10",
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
      },
      borderRadius: {
        default: "rounded-button-borderRadius",
        none: "rounded-none",
        xs: "rounded-xs",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        "3xl": "rounded-3xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "small",
      fontSize: "default",
      borderRadius: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      borderRadius,
      asChild = false,
      fontSize,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={themeManagerCn(
          buttonVariants({ variant, size, borderRadius, fontSize }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
