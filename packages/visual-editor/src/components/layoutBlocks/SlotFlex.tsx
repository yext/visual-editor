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

export type SlotFlexProps = WithLayout<{
  className?: string;
  items: Slot;
}>;

const SlotFlexInternal: ComponentConfig<SlotFlexProps> = {
  label: "Slot Flex",
  fields: {
    className: {
      label: "CSS Classes",
      type: "text",
    },
    items: {
      type: "slot",
    },
  },
  defaultProps: {
    className: "flex w-full flex-wrap",
    layout: {
      grow: true,
    },
    items: [],
  },
  permissions: {
    drag: false,
    insert: false,
  },
  render: ({ className, items: Items }) => {
    return (
      <Section style={{ height: "100%" }}>
        <Items
          className={cn("flex w-full", className)}
          disallow={["Hero", "Stats"]}
        />
      </Section>
    );
  },
};

export const SlotFlex = withLayout(SlotFlexInternal);
