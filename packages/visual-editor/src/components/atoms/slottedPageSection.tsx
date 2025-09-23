import * as React from "react";
import {
  themeManagerCn,
  BackgroundStyle,
  Background,
} from "@yext/visual-editor";
import { cva, VariantProps } from "class-variance-authority";
import { Slot, PuckComponent } from "@measured/puck";

const pageSectionVariants = cva("", {
  variants: {
    verticalPadding: {
      sm: "py-4",
      default: "py-pageSection-verticalPadding",
      header: "py-2 sm:py-6",
      footer: "py-8 sm:py-20",
      footerSecondary: "py-8 sm:py-10",
    },
  },
  defaultVariants: {
    verticalPadding: "default",
  },
});

export interface SlottedPageSectionProps {
  className?: string;
  background?: BackgroundStyle;
  verticalPadding?: VariantProps<typeof pageSectionVariants>["verticalPadding"];
  as?: "div" | "section" | "nav" | "header" | "footer" | "main" | "aside";
  outerClassName?: string;
  children: Slot;
}

export const SlottedPageSection: PuckComponent<SlottedPageSectionProps> = ({
  className,
  background,
  verticalPadding,
  outerClassName,
  as,
  children: Children,
}) => {
  const InnerComponent = as ?? "section";

  return (
    <Background
      className={themeManagerCn(
        "components w-full px-4",
        pageSectionVariants({ verticalPadding }),
        outerClassName
      )}
      background={background}
    >
      <InnerComponent
        className={themeManagerCn(
          "max-w-pageSection-contentWidth mx-auto",
          className
        )}
      >
        <Children />
      </InnerComponent>
    </Background>
  );
};
