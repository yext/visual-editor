import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../utils/cn.ts";

const buttonVariants = cva(
  "ve-inline-flex ve-items-center ve-justify-center ve-whitespace-nowrap ve-rounded-full ve-text-sm" +
    " ve-font-medium ve-ring-offset-background ve-transition-colors focus-visible:ve-outline-none" +
    " focus-visible:ve-ring-2 focus-visible:ve-ring-ring focus-visible:ve-ring-offset-2" +
    " disabled:ve-pointer-events-none disabled:ve-opacity-50",
  {
    variants: {
      variant: {
        default:
          "ve-bg-primary ve-text-primary-foreground hover:ve-bg-primary/90",
        destructive:
          "ve-bg-destructive ve-text-destructive-foreground hover:ve-bg-destructive/90",
        outline:
          "ve-border ve-border-input ve-bg-background hover:ve-bg-accent" +
          " hover:ve-text-accent-foreground",
        secondary:
          "ve-bg-secondary ve-text-secondary-foreground hover:ve-bg-secondary/80",
        ghost: "hover:ve-bg-accent hover:ve-text-accent-foreground",
        link: "ve-text-primary ve-underline-offset-4 hover:ve-underline",
        puckSelect: "", // puck copycat styles applied in puck.css
      },
      size: {
        default: "ve-h-10 ve-px-4 ve-py-2",
        sm: "ve-h-9 ve-px-3",
        lg: "ve-h-11 ve-px-8",
        icon: "ve-h-10 ve-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={
          variant === "puckSelect"
            ? "puck-select"
            : cn(buttonVariants({ variant, size, className }))
        }
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
