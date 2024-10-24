import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../internal/utils/cn.ts";

// Define the variants for the heading component
const headingVariants = cva("font-bold", {
  variants: {
    level: {
      1: "font-heading1 text-heading1-fontSize text-heading1-color",
      2: "font-heading2 text-heading2-fontSize text-heading2-color",
      3: "font-heading3 text-heading3-fontSize text-heading3-color",
      4: "font-heading4 text-heading4-fontSize text-heading4-color",
      5: "font-heading5 text-heading5-fontSize text-heading5-color",
      6: "font-heading6 text-heading6-fontSize text-heading6-color",
    },
    weight: {
      default: "font-normal",
      bold: "font-bold",
    },
    size: {
      default: "",
      page: "text-5xl",
      section: "text-[34px]",
      subheading: "text-2xl",
    },
    color: {
      default: "",
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent",
    },
    transform: {
      none: "",
      uppercase: "uppercase",
      lowercase: "lowercase",
      capitalize: "capitalize",
    },
  },
  defaultVariants: {
    size: "default",
    color: "default",
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
  ({ className, level = 1, size, color, ...props }, ref) => {
    const Tag = `h${level}` as keyof Pick<
      JSX.IntrinsicElements,
      "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    >;

    return (
      <Tag
        id="hello"
        className={cn(headingVariants({ size, color, className, level }))}
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
