import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { NumberOrDefault } from "../../editor/NumberOrDefaultField.tsx";

// Define the variants for the body component
const bodyVariants = cva("components text-body-fontSize font-body-fontFamily", {
  variants: {
    fontWeight: {
      default: "font-body-fontWeight",
      "100": "font-thin",
      "200": "font-extralight",
      "300": "font-light",
      "400": "font-normal",
      "500": "font-medium",
      "600": "font-semibold",
      "700": "font-bold",
      "800": "font-extrabold",
      "900": "font-black",
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
