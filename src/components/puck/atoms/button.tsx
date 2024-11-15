import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { NumberOrDefault } from "../../editor/NumberOrDefaultField.tsx";

const buttonVariants = cva(
  "py-4 components inline-flex items-center justify-center whitespace-nowrap rounded-button-borderRadius text-button-fontSize font-body-fontFamily font-button-fontWeight ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ",
  {
    variants: {
      variant: {
        primary:
          "bg-button-backgroundColor text-button-textColor border-2 border-button-backgroundColor hover:border-button-textColor focus:border-button-textColor active:bg-button-textColor active:text-button-backgroundColor active:border-button-backgroundColor",
        link: "text-button-textColor underline-offset-4 underline",
      },
      size: {
        default: "w-full md:w-fit h-10 px-4 py-2",
        small: "h-9 px-3",
        large: "h-11 px-8",
        icon: "h-10 w-10",
      },
      borderRadius: {
        default: "",
        none: "rounded-none",
        medium: "rounded-md",
        large: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      borderRadius: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  fontSize?: NumberOrDefault;
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
        style={{
          fontSize:
            !fontSize || fontSize === "default" ? undefined : fontSize + "px",
        }}
        className={clsx(
          className,
          buttonVariants({ variant, size, borderRadius })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
