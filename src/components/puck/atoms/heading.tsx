import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../internal/utils/cn.ts";

// Define the variants for the heading component
const headingVariants = cva("py-4", {
  variants: {
    level: {
      1: "ve-text-[48px]",
      2: "ve-text-[24px]",
      3: "font-heading3 text-heading3-fontSize text-heading3-color",
      4: "font-heading4 text-heading4-fontSize text-heading4-color",
      5: "font-heading5 text-heading5-fontSize text-heading5-color",
      6: "font-heading6 text-heading6-fontSize text-heading6-color",
    },
    weight: {
      default: "",
      thin: "ve-font-thin",
      extralight: "ve-font-extralight",
      light: "ve-font-light",
      normal: "ve-font-normal",
      medium: "ve-font-medium",
      semibold: "ve-font-semibold",
      bold: "ve-font-bold",
      extrabold: "ve-font-extrabold",
      black: "ve-font-black",
    },
    color: {
      primary: "text-header-primary",
      secondary: "text-header-secondary",
      accent: "text-header-accent",
      text: "text-header-text",
    },
    transform: {
      none: "",
      uppercase: "ve-uppercase",
      lowercase: "ve-lowercase",
      capitalize: "ve-capitalize",
    },
  },
  defaultVariants: {
    color: "primary",
    weight: "default",
    transform: "none",
  },
});

// Define the valid levels for the heading element
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// Omit 'color' from HTMLAttributes<HTMLHeadingElement> to avoid conflict
export interface HeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">,
    VariantProps<typeof headingVariants> {
  level?: HeadingLevel;
  // size?: number;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, color, weight, transform, ...props }, ref) => {
    const Tag = `h${level}` as keyof Pick<
      JSX.IntrinsicElements,
      "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    >;

    // const dynamicStyles = {
    //   fontSize: size ? size + "px" : undefined,
    // };

    return (
      <Tag
        id="tag"
        className={
          "components " +
          cn(headingVariants({ color, className, weight, transform, level }))
        }
        ref={ref}
        // style={dynamicStyles ?? ""}
        {...props}
      >
        {props.children}
      </Tag>
    );
  }
);
Heading.displayName = "Heading";

export { Heading, headingVariants };
