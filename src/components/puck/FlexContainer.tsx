import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import { themeMangerCn } from "../../index.js";
import {
  horizontalPaddingClasses,
  verticalPaddingClasses,
} from "./options/paddingClasses.js";

const flexContainerVariants = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
    },
    justification: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
    },
    wrap: {
      wrap: "flex-wrap",
      nowrap: "flex-nowrap",
    },
  },
  defaultVariants: {
    direction: "column",
    justification: "start",
    wrap: "nowrap",
  },
});

interface FlexContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexContainerVariants> {
  gap: number;
  verticalPadding: string;
  horizontalPadding: string;
}

const FlexContainer = React.forwardRef<HTMLDivElement, FlexContainerProps>(
  (
    {
      className,
      direction,
      justification,
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
        className={themeMangerCn(
          flexContainerVariants({
            direction,
            justification,
            wrap,
          }),
          verticalPadding,
          horizontalPadding,
          className
        )}
        ref={ref}
        {...props}
      >
        <DropZone zone="flex-container" style={{ gap }} />
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
  justification: {
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
    type: "number",
    min: 0,
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
    options: verticalPaddingClasses,
  },
  horizontalPadding: {
    label: "Horizontal Padding",
    type: "select",
    options: horizontalPaddingClasses,
  },
};

const FlexContainerComponent: ComponentConfig<FlexContainerProps> = {
  label: "Flex Container",
  fields: flexContainerFields,
  defaultProps: {
    direction: "column",
    justification: "start",
    wrap: "nowrap",
    gap: 0,
    verticalPadding: "0",
    horizontalPadding: "0",
  },
  render: ({
    direction,
    justification,
    wrap,
    gap,
    verticalPadding,
    horizontalPadding,
    className,
  }) => (
    <FlexContainer
      direction={direction}
      justification={justification}
      wrap={wrap}
      gap={gap}
      verticalPadding={verticalPadding}
      horizontalPadding={horizontalPadding}
      className={className}
    />
  ),
};

export { FlexContainerComponent as FlexContainer, type FlexContainerProps };
