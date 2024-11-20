import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const buttonVariants = cva(
  "py-4 components inline-flex items-center justify-center whitespace-nowrap rounded-button-borderRadius text-button-fontSize font-button-fontWeight ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ",
  {
    variants: {
      variant: {
        primary:
          "bg-palette-primary text-palette-secondary border-2 border-palette-primary hover:border-palette-secondary focus:border-palette-secondary active:bg-palette-secondary active:text-palette-primary active:border-palette-primary",
        secondary:
          "bg-palette-secondary text-palette-primary border-2 border-palette-secondary hover:border-palette-primary focus:border-palette-primary active:bg-palette-primary active:text-palette-secondary active:border-palette-secondary",
        outline:
          "border-palette-primary bg-palette-background border-2 hover:border-palette-background focus:border-palette-background active:bg-palette-primary active:text-palette-background",
        link: "text-palette-primary underline-offset-4 underline hover:no-underline",
      },
      size: {
        default: "w-full md:w-fit h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
      fontSize: {
        default: "!text-body-fontSize",
        xs: "!text-xs",
        sm: "!text-sm",
        base: "!text-base",
        lg: "!text-lg",
        xl: "!text-xl",
        "2xl": "!text-2xl",
        "3xl": "!text-3xl",
        "4xl": "!text-4xl",
        "5xl": "!text-5xl",
        "6xl": "!text-6xl",
        "7xl": "!text-7xl",
        "8xl": "!text-8xl",
        "9xl": "!text-9xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, fontSize, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={clsx(className, buttonVariants({ variant, size, fontSize }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
