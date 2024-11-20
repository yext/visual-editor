import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  fontSizeVariants,
  fontWeightVariants,
  colorVariants,
  transformVariants,
} from "../variants.ts";

// Define the variants for the heading component
const headingVariants = cva("components", {
  variants: {
    fontSize: fontSizeVariants,
    weight: fontWeightVariants,
    color: colorVariants,
    transform: transformVariants,
    level: {
      1: "font-heading1-fontWeight text-heading1-fontSize text-heading1-color font-heading1-fontFamily",
      2: "font-heading2-fontWeight text-heading2-fontSize text-heading2-color font-heading2-fontFamily",
      3: "font-heading3-fontWeight text-heading3-fontSize text-heading3-color font-heading3-fontFamily",
      4: "font-heading4-fontWeight text-heading4-fontSize text-heading4-color font-heading4-fontFamily",
      5: "font-heading5-fontWeight text-heading5-fontSize text-heading5-color font-heading5-fontFamily",
      6: "font-heading6-fontWeight text-heading6-fontSize text-heading6-color font-heading6-fontFamily",
    },
  },
  defaultVariants: {
    fontSize: "default",
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
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    { className, level = 1, color, weight, transform, fontSize, ...props },
    ref
  ) => {
    const Tag = `h${level}` as keyof Pick<
      JSX.IntrinsicElements,
      "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    >;

    return (
      <Tag
        id="tag"
        className={headingVariants({
          fontSize,
          color,
          className,
          weight,
          transform,
          level,
        })}
        ref={ref}
        {...props}
      >
        {props.children}
      </Tag>
    );
  }
);
Heading.displayName = "Heading";

export { Heading, headingVariants };
