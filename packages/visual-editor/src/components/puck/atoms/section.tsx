import * as React from "react";
import {
  themeManagerCn,
  BackgroundStyle,
  BackgroundProvider,
} from "../../../index.ts";
import { cva, VariantProps } from "class-variance-authority";

const sectionVariants = cva("", {
  variants: {
    verticalPadding: {
      sm: "py-4",
      default: "py-pageSection-verticalPadding",
      header: "py-2 sm:py-6",
      footer: "py-8 sm:py-20",
    },
  },
  defaultVariants: {
    verticalPadding: "default",
  },
});

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  background?: BackgroundStyle;
  applyPageLevelStyles?: boolean;
  verticalPadding?: VariantProps<typeof sectionVariants>["verticalPadding"];
}

export const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  (
    { className, background, verticalPadding, applyPageLevelStyles, ...props },
    ref
  ) => {
    // If this is being used as a Page Section, create an outer and inner div, and
    // apply the ref/props to the inner div.
    // If not a Page Section, only create one div
    const SectionContainer = (
      <div
        className={themeManagerCn(
          "components",
          applyPageLevelStyles
            ? `w-full px-4 lg:px-0 ${sectionVariants({ verticalPadding })}`
            : className,
          background?.bgColor,
          background?.textColor
        )}
        {...(!applyPageLevelStyles && props)}
        ref={applyPageLevelStyles ? undefined : ref}
      >
        {applyPageLevelStyles ? (
          <div
            className={themeManagerCn(
              "max-w-pageSection-contentWidth mx-auto",
              className
            )}
            ref={ref}
            {...props}
          >
            {props.children}
          </div>
        ) : (
          <>{props.children}</>
        )}
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
