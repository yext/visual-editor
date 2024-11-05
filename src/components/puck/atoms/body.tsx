import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { NumberOrDefault } from "../../editor/NumberOrDefaultField.tsx";

// Define the variants for the body component
const bodyVariants = cva("components text-body-fontSize", {
  variants: {
    fontWeight: {
      default: "font-body-fontWeight",
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
      default: "text-body-color",
      primary: "text-palette-primary",
      secondary: "text-palette-secondary",
      accent: "text-palette-accent",
      text: "text-palette-text",
      background: "text-palette-background",
    },
    textTransform: {
      none: "",
      uppercase: "uppercase",
      lowercase: "lowercase",
      capitalize: "capitalize",
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
  fontSize: NumberOrDefault;
}

const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  (
    { className, fontWeight, color, textTransform, fontSize, ...props },
    ref
  ) => {
    return (
      <p
        style={{
          fontSize: fontSize === "default" ? undefined : fontSize + "px",
        }}
        className={clsx(
          className,
          bodyVariants({
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
