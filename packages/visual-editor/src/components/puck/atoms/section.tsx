import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  themeManagerCn,
  BackgroundStyle,
  BackgroundProvider,
} from "../../../index.ts";

export const sectionVariants = cva("mx-auto", {
  variants: {
    padding: {
      default: "px-4 py-16 md:px-8",
      none: "",
      small: "px-4 py-8 md:px-8",
      large: "px-[200px] py-24 md:px-8",
    },
    maxWidth: {
      default: "max-w-6xl",
      full: "max-w-full",
      xl: "max-w-4xl",
    },
  },
  defaultVariants: {
    padding: "default",
    maxWidth: "default",
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionVariants> {
  background?: BackgroundStyle;
}

export const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, padding, maxWidth, background, ...props }, ref) => {
    const SectionContainer = (
      <div
        className={themeManagerCn(
          "components",
          background?.bgColor,
          background?.textColor
        )}
      >
        <div
          className={themeManagerCn(
            sectionVariants({ padding, maxWidth }),
            className
          )}
          ref={ref}
          {...props}
        >
          {props.children}
        </div>
      </div>
    );

    // If background is set, create a new background context scope
    return background ? (
      <BackgroundProvider value={background}>
        {SectionContainer}
      </BackgroundProvider>
    ) : (
      SectionContainer
    );
  }
);
Section.displayName = "Section";
