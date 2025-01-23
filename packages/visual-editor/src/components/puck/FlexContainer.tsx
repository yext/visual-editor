import * as React from "react";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import { tailwindSpacingClasses } from "./options/spacingClasses.js";

interface FlexContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  gap: number;
  justifyContent: "start" | "center" | "end";
  direction: "row" | "column";
  wrap: "wrap" | "nowrap";
  verticalPadding: number;
  horizontalPadding: number;
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
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={className}
        ref={ref}
        style={{
          paddingTop: verticalPadding,
          paddingBottom: verticalPadding,
          paddingRight: horizontalPadding,
          paddingLeft: horizontalPadding,
        }}
        {...props}
      >
        <DropZone
          zone="flex-container"
          style={{
            display: "flex",
            justifyContent,
            flexDirection: direction,
            gap,
            flexWrap: wrap,
          }}
          disallow={["Banner"]}
        />
      </div>
    );
  }
);

FlexContainer.displayName = "FlexContainer";

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
  gap: {
    label: "Gap",
    type: "select",
    options: tailwindSpacingClasses,
  },
  wrap: {
    label: "Wrap",
    type: "select",
    options: [
      { value: "nowrap", label: "No Wrap" },
      { value: "wrap", label: "Wrap" },
    ],
  },
  verticalPadding: {
    label: "Vertical Padding",
    type: "select",
    options: tailwindSpacingClasses,
  },
  horizontalPadding: {
    label: "Horizontal Padding",
    type: "select",
    options: tailwindSpacingClasses,
  },
};

const FlexContainerComponent: ComponentConfig<FlexContainerProps> = {
  label: "Flex Container",
  fields: flexContainerFields,
  defaultProps: {
    direction: "column",
    justifyContent: "start",
    wrap: "nowrap",
    gap: 0,
    verticalPadding: 0,
    horizontalPadding: 0,
  },
  render: ({
    direction,
    justifyContent,
    wrap,
    gap,
    verticalPadding,
    horizontalPadding,
    className,
  }) => (
    <FlexContainer
      direction={direction}
      justifyContent={justifyContent}
      wrap={wrap}
      gap={gap}
      verticalPadding={verticalPadding}
      horizontalPadding={horizontalPadding}
      className={className}
    />
  ),
};

export { FlexContainerComponent as FlexContainer, type FlexContainerProps };
