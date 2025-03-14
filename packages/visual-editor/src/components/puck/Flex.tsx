import * as React from "react";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import { VariantProps } from "class-variance-authority";
import { Section } from "./atoms/section.js";
import { themeManagerCn } from "../../utils/cn.js";
import {
  innerLayoutVariants,
  layoutFields,
  layoutVariants,
} from "./Layout.tsx";
import { BasicSelector } from "../../index.js";

interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof layoutVariants>,
    VariantProps<typeof innerLayoutVariants> {
  justifyContent: "start" | "center" | "end";
  direction: "row" | "column";
  wrap: "wrap" | "nowrap";
}

const FlexContainer = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      direction,
      justifyContent,
      wrap,
      gap,
      verticalPadding,
      horizontalPadding,
      backgroundColor,
      maxContentWidth,
    },
    ref
  ) => {
    return (
      <Section
        className={themeManagerCn(
          layoutVariants({
            backgroundColor,
            verticalPadding,
            horizontalPadding,
            gap,
          })
        )}
        ref={ref}
        maxWidth="full"
        padding="none"
      >
        <div
          className={themeManagerCn(
            innerLayoutVariants({ maxContentWidth }),
            className
          )}
        >
          <DropZone
            className={themeManagerCn(layoutVariants({ gap }), "flex")}
            zone="flex-container"
            style={{
              justifyContent,
              flexDirection: direction,
              flexWrap: wrap,
            }}
            disallow={["Banner"]}
          />
        </div>
      </Section>
    );
  }
);

FlexContainer.displayName = "Flex";

const flexContainerFields: Fields<FlexProps> = {
  direction: BasicSelector("Direction", [
    { value: "row", label: "Horizontal" },
    { value: "column", label: "Vertical" },
  ]),
  justifyContent: BasicSelector("Justify Content", [
    { value: "start", label: "Start" },
    { value: "center", label: "Center" },
    { value: "end", label: "End" },
  ]),
  wrap: BasicSelector("Wrap", [
    { value: "nowrap", label: "No Wrap" },
    { value: "wrap", label: "Wrap" },
  ]),
  ...layoutFields,
};

const FlexContainerComponent: ComponentConfig<FlexProps> = {
  label: "Flex",
  fields: flexContainerFields,
  defaultProps: {
    direction: "column",
    justifyContent: "start",
    wrap: "nowrap",
    gap: "default",
    verticalPadding: "default",
    horizontalPadding: "default",
    backgroundColor: "default",
  },
  resolveFields: (data, params) => {
    // If the Flex has a parent component, the defaultProps should
    // be adjusted and maxContentWidth should not be a field.
    if (params.parent) {
      // the props values should only be changed initially
      if (!data.props.maxContentWidth) {
        data.props.verticalPadding = "0";
        data.props.horizontalPadding = "0";
        data.props.gap = "0";
        data.props.backgroundColor = "inherit";
        data.props.maxContentWidth = "none";
      }
      return flexContainerFields;
    }

    if (!data.props.maxContentWidth) {
      data.props.maxContentWidth = "default";
    }
    return {
      ...flexContainerFields,
      maxContentWidth: BasicSelector("Maximum Content Width", [
        { value: "default", label: "Default" },
        { value: "lg", label: "LG (1024px)" },
        { value: "xl", label: "XL (1280px)" },
        { value: "xxl", label: "2XL (1536px)" },
      ]),
    };
  },
  render: ({
    direction,
    justifyContent,
    wrap,
    gap,
    verticalPadding,
    horizontalPadding,
    className,
    backgroundColor,
    maxContentWidth,
  }) => (
    <FlexContainer
      direction={direction}
      justifyContent={justifyContent}
      wrap={wrap}
      gap={gap}
      verticalPadding={verticalPadding}
      horizontalPadding={horizontalPadding}
      className={className}
      backgroundColor={backgroundColor}
      maxContentWidth={maxContentWidth}
    />
  ),
};

export { FlexContainerComponent as Flex, type FlexProps };
