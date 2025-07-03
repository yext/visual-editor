import * as React from "react";
import {
  themeManagerCn,
  BackgroundStyle,
  Background,
} from "@yext/visual-editor";
import { cva, VariantProps } from "class-variance-authority";

const pageSectionVariants = cva("", {
  variants: {
    verticalPadding: {
      sm: "py-4",
      default: "py-pageSection-verticalPadding",
      header: "py-2 sm:py-6",
      footer: "py-8 sm:py-20",
      footer_secondary: "py-8 sm:py-10",
    },
  },
  defaultVariants: {
    verticalPadding: "default",
  },
});

export interface PageSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  background?: BackgroundStyle;
  verticalPadding?: VariantProps<typeof pageSectionVariants>["verticalPadding"];
  as?: "div" | "section" | "nav" | "header" | "footer" | "main" | "aside";
  outerClassName?: string;
}

export const PageSection = React.forwardRef<HTMLDivElement, PageSectionProps>(
  (
    { className, background, verticalPadding, outerClassName, as, ...props },
    ref
  ) => {
    const InnerComponent = as ?? "section";

    return (
      <Background
        className={themeManagerCn(
          "components w-full px-4",
          pageSectionVariants({ verticalPadding }),
          outerClassName
        )}
        background={background}
        ref={ref}
      >
        <InnerComponent
          className={themeManagerCn(
            "max-w-pageSection-contentWidth mx-auto",
            className
          )}
          {...props}
        >
          {props.children}
        </InnerComponent>
      </Background>
    );
  }
);
PageSection.displayName = "PageSection";
