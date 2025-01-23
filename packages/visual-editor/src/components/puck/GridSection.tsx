import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import { Section } from "./atoms/section.js";
import { themeMangerCn } from "../../index.js";
import { tailwindSpacingClasses } from "./options/spacingClasses.js";

const outerBackgroundVariants = cva("components w-full", {
  variants: {
    backgroundColor: {
      default: "bg-grid-backgroundColor",
      primary: "bg-palette-primary",
      secondary: "bg-palette-secondary",
      accent: "bg-palette-accent",
      text: "bg-palette-text",
      background: "bg-palette-background",
    },
  },
  defaultVariants: {
    backgroundColor: "default",
  },
});

const innerBackgroundVariants = cva(
  "components flex flex-col min-h-0 min-w-0 md:grid md:grid-cols-12 mx-auto",
  {
    variants: {
      maxContentWidth: {
        default: "max-w-grid-maxWidth",
        lg: "max-w-[1024px]",
        xl: "max-w-[1280px]",
        xxl: "max-w-[1536px]",
      },
    },
    defaultVariants: {
      maxContentWidth: "default",
    },
  }
);

interface ColumnProps {
  justifyContent: "center" | "start" | "end" | "spaceBetween";
  span?: number;
}

interface GridSectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof outerBackgroundVariants>,
    VariantProps<typeof innerBackgroundVariants> {
  gap: number;
  verticalPadding: number;
  horizontalPadding: number;
  columns: ColumnProps[];
}

const GridSection = React.forwardRef<HTMLDivElement, GridSectionProps>(
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
        className={themeMangerCn(outerBackgroundVariants({ backgroundColor }))}
        style={{
          paddingTop: verticalPadding,
          paddingBottom: verticalPadding,
          paddingRight: horizontalPadding,
          paddingLeft: horizontalPadding,
        }}
        maxWidth="full"
        padding="none"
      >
        <div
          className={themeMangerCn(
            innerBackgroundVariants({ maxContentWidth }),
            className
          )}
          ref={ref}
          style={{
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            gap,
          }}
          {...props}
        >
          {columns.map(({ span, justifyContent }, idx) => (
            <div
              key={idx}
              style={{
                gridColumn: span,
              }}
            >
              <DropZone
                style={{
                  display: "flex",
                  flexDirection: "column",
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

const gridSectionFields: Fields<GridSectionProps> = {
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
      justifyContent: {
        label: "Vertical Alignment",
        type: "select",
        options: [
          { value: "start", label: "Start" },
          { value: "center", label: "Center" },
          { value: "end", label: "End" },
          { value: "spaceBetween", label: "Space Between" },
        ],
      },
    },
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
  gap: {
    label: "Gap",
    type: "select",
    options: tailwindSpacingClasses,
  },
  maxContentWidth: {
    label: "Maximum Content Width",
    type: "select",
    options: [
      { value: "default", label: "Default" },
      { value: "lg", label: "LG" },
      { value: "xl", label: "XL" },
      { value: "xxl", label: "2XL" },
    ],
  },
  backgroundColor: {
    label: "Background Color",
    type: "select",
    options: [
      { label: "Default", value: "default" },
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
      { label: "Accent", value: "accent" },
      { label: "Text", value: "text" },
      { label: "Background", value: "background" },
    ],
  },
};

const GridSectionComponent: ComponentConfig<GridSectionProps> = {
  label: "Grid Section",
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
    gap: 0,
    verticalPadding: 0,
    horizontalPadding: 0,
    backgroundColor: "default",
    maxContentWidth: "default",
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

export { GridSectionComponent as GridSection, type GridSectionProps };
