import * as React from "react";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import { Section } from "./atoms/section.js";
import { themeManagerCn } from "../../utils/cn.js";
import {
  innerLayoutVariants,
  layoutFields,
  layoutProps,
  layoutVariants,
} from "./Layout.tsx";
import { BasicSelector } from "../../index.js";
import { backgroundColors } from "../../utils/themeConfigOptions.ts";

interface FlexProps extends layoutProps {
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
        background={backgroundColor}
        className={themeManagerCn(
          layoutVariants({
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
  direction: {
    label: "Direction",
    type: "radio",
    options: [
      { label: "Horizontal", value: "row" },
      { label: "Vertical", value: "column" },
    ],
  },
  justifyContent: {
    label: "Justify Content",
    type: "radio",
    options: [
      { label: "Start", value: "start" },
      { label: "Center", value: "center" },
      { label: "End", value: "end" },
    ],
  },
  wrap: {
    label: "Wrap",
    type: "radio",
    options: [
      { label: "No Wrap", value: "nowrap" },
      { label: "Wrap", value: "wrap" },
    ],
  },
  ...layoutFields,
};

const FlexContainerComponent: ComponentConfig<FlexProps> = {
  label: "Flex",
  fields: flexContainerFields,
  defaultProps: {
    direction: "row",
    justifyContent: "start",
    wrap: "nowrap",
    gap: "0",
    verticalPadding: "default",
    horizontalPadding: "0",
    backgroundColor: backgroundColors.background1.value,
  },
  resolveFields: (data, params) => {
    // If the Flex has a parent component, the defaultProps should
    // be adjusted and maxContentWidth should not be a field.
    if (params.parent) {
      // the props values should only be changed initially
      if (!data.props.maxContentWidth) {
        data.props.verticalPadding = "0";
        data.props.gap = "0";
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
  }: FlexProps) => (
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
