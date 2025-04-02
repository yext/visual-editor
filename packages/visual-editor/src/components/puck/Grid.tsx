import * as React from "react";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import { themeManagerCn, backgroundColors, Section } from "../../index.js";
import { layoutFields, layoutProps, layoutVariants } from "./Layout.tsx";

export interface GridProps extends layoutProps {
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
        background={backgroundColor}
        className={themeManagerCn(
          layoutVariants({
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

export const Grid: ComponentConfig<GridProps> = {
  fields: gridSectionFields,
  defaultProps: {
    columns: 2,
    gap: "0",
    verticalPadding: "default",
    horizontalPadding: "0",
    backgroundColor: backgroundColors.background1.value,
    columnFormatting: "default",
  },
  resolveFields: (data: { props: GridProps }, params: { parent: any }) => {
    // If the Grid has a parent component, the defaultProps should
    // be adjusted.
    if (params.parent) {
      // the props values should only be changed initially
      data.props.verticalPadding = "0";
      data.props.gap = "0";
      data.props.columnFormatting = "forceHorizontal";
      return gridSectionFields;
    }

    return {
      ...gridSectionFields,
    };
  },
  render: (props) => <GridSection {...props} />,
};
