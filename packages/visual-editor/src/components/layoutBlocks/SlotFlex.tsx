import { CSSProperties, forwardRef, ReactNode } from "react";
import { cn } from "../../utils/cn";
import { withLayout, WithLayout } from "./Layout";
import { ComponentConfig, Slot } from "@measured/puck";

type SectionProps = {
  className?: string;
  children: ReactNode;
  maxWidth?: string;
  style?: CSSProperties;
};

const Section = forwardRef<HTMLDivElement, SectionProps>(
  ({ children, className, maxWidth = "1280px", style = {} }, ref) => {
    return (
      <div
        className={cn(className)}
        style={{
          ...style,
        }}
        ref={ref}
      >
        <div className="mx-auto h-full w-full" style={{ maxWidth }}>
          {children}
        </div>
      </div>
    );
  }
);

export type FlexProps = WithLayout<{
  justifyContent: "start" | "center" | "end";
  direction: "row" | "column";
  gap: number;
  wrap: "wrap" | "nowrap";
  items: Slot;
}>;

const FlexInternal: ComponentConfig<FlexProps> = {
  fields: {
    direction: {
      label: "Direction",
      type: "radio",
      options: [
        { label: "Row", value: "row" },
        { label: "Column", value: "column" },
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
    gap: {
      label: "Gap",
      type: "number",
      min: 0,
    },
    wrap: {
      label: "Wrap",
      type: "radio",
      options: [
        { label: "true", value: "wrap" },
        { label: "false", value: "nowrap" },
      ],
    },
    items: {
      type: "slot",
    },
  },
  defaultProps: {
    justifyContent: "start",
    direction: "row",
    gap: 24,
    wrap: "wrap",
    layout: {
      grow: true,
    },
    items: [],
  },
  render: ({ justifyContent, direction, gap, wrap, items: Items }) => {
    return (
      <Section style={{ height: "100%" }}>
        <Items
          className="flex w-full flex-wrap"
          style={{
            justifyContent,
            flexDirection: direction,
            gap,
            flexWrap: wrap,
          }}
          disallow={["Hero", "Stats"]}
        />
      </Section>
    );
  },
};

export const Flex = withLayout(FlexInternal);
