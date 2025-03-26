import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import { Section } from "./atoms/section.js";
import { themeManagerCn } from "../../index.js";
import { innerLayoutVariants, layoutVariants } from "./Layout.tsx";
import { layoutFields } from "./Layout.tsx";

interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof layoutVariants>,
    VariantProps<typeof innerLayoutVariants> {
  columns: number;
}

const GridSection = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      className,
      columns,
      gap,
      verticalPadding,
      horizontalPadding,
      backgroundColor,
      columnFormatting,
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
            layoutVariants({ gap, columnFormatting }),
            "flex flex-col min-h-0 min-w-0 mx-auto max-w-pageSection-contentWidth",
            className
          )}
          ref={ref}
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
          }}
          {...props}
        >
          {Array.from({ length: columns }).map((_, idx) => (
            <div className="w-full" key={idx}>
              <DropZone
                className="flex flex-col w-full"
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
    type: "number",
    label: "Columns",
    min: 1,
    max: 12,
  },
  ...layoutFields,
};

const GridSectionComponent: ComponentConfig<GridProps> = {
  label: "Grid",
  fields: gridSectionFields,
  defaultProps: {
    columns: 2,
    gap: "0",
    verticalPadding: "default",
    horizontalPadding: "default",
    backgroundColor: "none",
    columnFormatting: "default",
  },
  resolveFields: (data: { props: GridProps }, params: { parent: any }) => {
    // If the Grid has a parent component, the defaultProps should
    // be adjusted.
    if (params.parent) {
      // the props values should only be changed initially
      data.props.verticalPadding = "0";
      data.props.horizontalPadding = "0";
      data.props.gap = "0";
      data.props.backgroundColor = "inherit";
      data.props.columnFormatting = "forceHorizontal";
      return gridSectionFields;
    }

    return {
      ...gridSectionFields,
    };
  },
  render: ({
    columns,
    backgroundColor,
    gap,
    verticalPadding,
    horizontalPadding,
    columnFormatting,
  }: GridProps) => (
    <GridSection
      columns={columns}
      backgroundColor={backgroundColor}
      gap={gap}
      verticalPadding={verticalPadding}
      horizontalPadding={horizontalPadding}
      columnFormatting={columnFormatting}
    />
  ),
};

export { GridSectionComponent as Grid, type GridProps };
