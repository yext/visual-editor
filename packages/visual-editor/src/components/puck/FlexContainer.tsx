import * as React from "react";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import { VariantProps } from "class-variance-authority";
import { Section } from "./atoms/section.js";
import { themeMangerCn } from "../../utils/cn.js";
import {
  innerLayoutVariants,
  layoutFields,
  layoutVariants,
} from "./Layout.tsx";

interface FlexContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof layoutVariants>,
    VariantProps<typeof innerLayoutVariants> {
  justifyContent: "start" | "center" | "end";
  direction: "row" | "column";
  wrap: "wrap" | "nowrap";
}

const FlexContainer = React.forwardRef<HTMLDivElement, FlexContainerProps>(
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
        className={themeMangerCn(
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
          className={themeMangerCn(
            innerLayoutVariants({ maxContentWidth }),
            className
          )}
        >
          <DropZone
            className={themeMangerCn(layoutVariants({ gap }))}
            zone="flex-container"
            style={{
              display: "flex",
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

const flexContainerFields: Fields<FlexContainerProps> = {
  direction: {
    label: "Direction",
    type: "select",
    options: [
      { value: "row", label: "Horizontal" },
      { value: "column", label: "Vertical" },
    ],
  },
  justifyContent: {
    label: "Justify Content",
    type: "select",
    options: [
      { value: "start", label: "Start" },
      { value: "center", label: "Center" },
      { value: "end", label: "End" },
    ],
  },
  wrap: {
    label: "Wrap",
    type: "select",
    options: [
      { value: "nowrap", label: "No Wrap" },
      { value: "wrap", label: "Wrap" },
    ],
  },
  ...layoutFields,
};

const FlexContainerComponent: ComponentConfig<FlexContainerProps> = {
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
      maxContentWidth: {
        label: "Maximum Content Width",
        type: "select",
        options: [
          { value: "default", label: "Default" },
          { value: "lg", label: "LG (1024px)" },
          { value: "xl", label: "XL (1280px)" },
          { value: "xxl", label: "2XL (1536px)" },
        ],
      },
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

export { FlexContainerComponent as FlexContainer, type FlexContainerProps };
