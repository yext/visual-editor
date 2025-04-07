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
  verticalPadding?: VariantProps<typeof sectionVariants>["verticalPadding"];
  /**
   * Applies the background to the full page width and wraps the content in
   * an element that respects the max content width
   */
  applyPageLevelStyles?: boolean;
  /**
   * The wrapping element. If applyPageLevelStyles=true, defaults to section and
   * applies to the inner element. If applyPageLevelStyles=false, defaults to
   * div and applies to the only returned element.
   */
  as?: "div" | "section" | "nav" | "header" | "footer" | "main" | "aside";
  /** If applyPageLevelStyles=true, applies to the outer element. */
  outerClassName?: string;
}

export const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  (
    {
      className,
      background,
      verticalPadding,
      applyPageLevelStyles,
      outerClassName,
      as,
      ...props
    },
    ref
  ) => {
    // If being used as a Page Section, the outer container is a styling div and the inner container
    // should be the semantic element. If not a Page Section, the outer container is semantic
    // and there should not be an inner container.
    const OuterComponent = applyPageLevelStyles ? "div" : (as ?? "div");
    const InnerComponent = applyPageLevelStyles
      ? (as ?? "section")
      : React.Fragment;

    // If this is being used as a Page Section, apply the maxWidth, margin, and padding,
    // and attach the ref/HTMLDivElement props to the inner element.
    // If not a Page Section, only create one element and do not apply the layout styling.
    const SectionContainer = (
      <OuterComponent
        className={themeManagerCn(
          "components",
          applyPageLevelStyles
            ? `w-full px-4 ${sectionVariants({ verticalPadding })} ${outerClassName}`
            : className,
          background?.bgColor,
          background?.textColor
        )}
        {...(!applyPageLevelStyles && props)}
        ref={ref}
      >
        {applyPageLevelStyles ? (
          <InnerComponent
            className={themeManagerCn(
              "max-w-pageSection-contentWidth mx-auto",
              className
            )}
            {...props}
          >
            {props.children}
          </InnerComponent>
        ) : (
          <>{props.children}</>
        )}
      </OuterComponent>
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
