import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import { Section } from "./atoms/section.js";
import { themeManagerCn, BasicSelector } from "../../index.js";
import { innerLayoutVariants, layoutVariants } from "./Layout.tsx";
import { layoutFields } from "./Layout.tsx";

interface ColumnProps {
  justifyContent: "center" | "start" | "end" | "spaceBetween";
  span?: number;
}

interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof layoutVariants>,
    VariantProps<typeof innerLayoutVariants> {
  columns: ColumnProps[];
}

const GridSection = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      className,
      columns,
      gap,
      verticalPadding,
      horizontalPadding,
      maxContentWidth,
      backgroundColor,
      ...props
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
          })
        )}
        maxWidth="full"
        padding="none"
      >
        <div
          className={themeManagerCn(
            layoutVariants({ gap }),
            innerLayoutVariants({ maxContentWidth }),
            "flex flex-col md:grid md:grid-cols-12",
            className
          )}
          ref={ref}
          style={{
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
          }}
          {...props}
        >
          {columns.map(({ span, justifyContent }, idx) => (
            <div
              className="w-full"
              key={idx}
              style={{
                gridColumn: span,
              }}
            >
              <DropZone
                className="flex flex-col w-full"
                style={{
                  justifyContent,
                }}
                zone={`column-${idx}`}
                disallow={["Banner"]}
              />
            </div>
          ))}
        </div>
      </Section>
    );
  }
);

GridSection.displayName = "GridSection";

const gridSectionFields: Fields<GridProps> = {
  columns: {
    type: "array",
    getItemSummary: (col, id) =>
      `Column ${(id ?? 0) + 1}, span ${
        col.span ? Math.max(Math.min(col.span, 12), 1) : "auto"
      }`,
    arrayFields: {
      span: {
        label: "Span (1-12)",
        type: "number",
        min: 0,
        max: 12,
      },
      justifyContent: BasicSelector("Vertical Alignment", [
        { value: "start", label: "Start" },
        { value: "center", label: "Center" },
        { value: "end", label: "End" },
        { value: "spaceBetween", label: "Space Between" },
      ]),
    },
  },
  ...layoutFields,
};

const GridSectionComponent: ComponentConfig<GridProps> = {
  label: "Grid",
  fields: gridSectionFields,
  defaultProps: {
    columns: [
      {
        justifyContent: "start",
      },
      {
        justifyContent: "start",
      },
    ],
    gap: "default",
    verticalPadding: "default",
    horizontalPadding: "default",
    backgroundColor: "default",
  },
  resolveFields: (data, params) => {
    // If the Grid has a parent component, the defaultProps should
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
      return gridSectionFields;
    }

    if (!data.props.maxContentWidth) {
      data.props.maxContentWidth = "default";
    }
    return {
      ...gridSectionFields,
      maxContentWidth: BasicSelector("Maximum Content Width", [
        { value: "default", label: "Default" },
        { value: "lg", label: "LG (1024px)" },
        { value: "xl", label: "XL (1280px)" },
        { value: "xxl", label: "2XL (1536px)" },
      ]),
    };
  },
  render: ({
    columns,
    backgroundColor,
    maxContentWidth,
    gap,
    verticalPadding,
    horizontalPadding,
  }) => (
    <GridSection
      columns={columns}
      backgroundColor={backgroundColor}
      maxContentWidth={maxContentWidth}
      gap={gap}
      verticalPadding={verticalPadding}
      horizontalPadding={horizontalPadding}
    />
  ),
};

export { GridSectionComponent as Grid, type GridProps };
