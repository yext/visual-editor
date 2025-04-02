import * as React from "react";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import { Section } from "./atoms/section.js";
import {
  innerLayoutVariants,
  layoutFields,
  layoutProps,
  layoutVariants,
} from "./Layout.tsx";
import { backgroundColors, themeManagerCn } from "../../index.js";

interface FlexProps extends layoutProps {
  justifyContent: "start" | "center" | "end";
  direction: "row" | "column";
  wrap: "wrap" | "nowrap";
  insideDropZone?: boolean;
}

const FlexContainer = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      direction,
      justifyContent,
      wrap,
      gap,
      verticalPadding,
      horizontalPadding,
      backgroundColor,
      insideDropZone,
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
            innerLayoutVariants({
              maxContentWidth: insideDropZone ? "none" : "default",
            })
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
            disallow={["Banner", "Promo", "Card", "Breadcrumbs"]}
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
    gap: "8",
    verticalPadding: "default",
    horizontalPadding: "4",
    backgroundColor: backgroundColors.background1.value,
  },
  resolveFields: (data, params) => {
    // If the Flex has a parent component, the defaultProps should be adjusted.
    if (params.parent) {
      // the props values should only be changed initially
      if (!data.props.insideDropZone) {
        data.props.verticalPadding = "0";
        data.props.horizontalPadding = "0";
        data.props.gap = "0";
      }
      data.props.insideDropZone = true;
    } else {
      data.props.insideDropZone = false;
    }

    return flexContainerFields;
  },
  render: ({
    direction,
    justifyContent,
    wrap,
    gap,
    verticalPadding,
    horizontalPadding,
    backgroundColor,
  }: FlexProps) => (
    <FlexContainer
      direction={direction}
      justifyContent={justifyContent}
      wrap={wrap}
      gap={gap}
      verticalPadding={verticalPadding}
      horizontalPadding={horizontalPadding}
      backgroundColor={backgroundColor}
    />
  ),
};

export { FlexContainerComponent as Flex, type FlexProps };
