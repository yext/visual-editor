import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { themeManagerCn, useBackground } from "@yext/visual-editor";

export const buttonVariants = cva(
  "components h-fit flex items-center justify-center whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-palette-primary text-palette-primary-contrast border-palette-primary",
        secondary: "bg-none",
        link: "w-fit underline",
        directoryLink:
          "border-b-gray-400 border-b sm:border-transparent w-full sm:w-fit sm:underline py-3",
      },
      hasDarkBackground: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: ["primary", "secondary"],
        className:
          "font-button-fontFamily text-button-fontSize font-button-fontWeight tracking-button-letterSpacing " +
          "hover:underline focus:underline active:underline sm:w-fit w-full px-6 py-3 border-2 border-solid rounded",
      },
      {
        variant: ["link", "directoryLink"],
        className:
          "bg-none justify-between gap-2 decoration-0 hover:no-underline " +
          "font-link-fontFamily text-link-fontSize font-link-fontWeight tracking-link-letterSpacing ",
      },
      {
        hasDarkBackground: false,
        variant: "secondary",
        className: "text-palette-primary-dark border-palette-primary-dark",
      },
      {
        hasDarkBackground: true,
        variant: "secondary",
        className: "text-white border-white",
      },
      {
        hasDarkBackground: false,
        variant: ["link", "directoryLink"],
        className: "text-palette-primary-dark",
      },
      {
        hasDarkBackground: true,
        variant: ["link", "directoryLink"],
        className: "text-white",
      },
    ],
    defaultVariants: {
      variant: "primary",
      hasDarkBackground: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const background = useBackground();
    const hasDarkBackground =
      background && background.textColor === "text-white";

    return (
      <Comp
        className={themeManagerCn(
          buttonVariants({ variant, hasDarkBackground }),
          className
        )}
        // textTransform has to be applied via styles because there is no custom tailwind utility
        style={{
          // @ts-expect-error ts(2322) the css variable here resolves to a valid enum value
          textTransform:
            variant === "link"
              ? "var(--textTransform-link-textTransform)"
              : "var(--textTransform-button-textTransform)",
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
