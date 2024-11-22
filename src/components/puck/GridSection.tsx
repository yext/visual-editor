import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ComponentConfig, Fields } from "@measured/puck";
import { Section } from "./atoms/section.js";
import { themeMangerCn } from "../../index.js";

const paddingClasses = [
  { label: "0", value: "py-0" },
  { label: "0.5", value: "py-0.5" },
  { label: "1", value: "py-1" },
  { label: "1.5", value: "py-1.5" },
  { label: "2", value: "py-2" },
  { label: "2.5", value: "py-2.5" },
  { label: "3", value: "py-3" },
  { label: "3.5", value: "py-3.5" },
  { label: "4", value: "py-4" },
  { label: "5", value: "py-5" },
  { label: "6", value: "py-6" },
  { label: "7", value: "py-7" },
  { label: "8", value: "py-8" },
  { label: "9", value: "py-9" },
  { label: "10", value: "py-10" },
  { label: "11", value: "py-11" },
  { label: "12", value: "py-12" },
  { label: "14", value: "py-14" },
  { label: "16", value: "py-16" },
  { label: "20", value: "py-20" },
  { label: "24", value: "py-24" },
];

const backgroundVariants = cva("components", {
  variants: {
    backgroundColor: {
      default: "bg-grid-backgroundColor",
      primary: "bg-palette-primary",
      secondary: "bg-palette-secondary",
      accent: "bg-palette-accent",
      text: "bg-palette-text",
      background: "bg-palette-background",
    },
    maxContentWidth: {
      default: "max-w-grid-maxWidth",
      lg: "max-w-[1024px]",
      xl: "max-w-[1280px]",
      xxl: "max-w-[1536px]",
    },
  },
  defaultVariants: {
    backgroundColor: "default",
    maxContentWidth: "default",
  },
});

const gridSectionVariants = cva(
  "components flex flex-col min-h-0 min-w-0 md:grid md:grid-cols-12 mx-auto gap-y-grid-verticalSpacing",
  {
    variants: {
      horizontalSpacing: {
        small: "gap-x-2 md:gap-x-4",
        medium: "gap-x-8 md:gap-x-12",
        large: "gap-x-12 md:gap-x-16",
      },
    },
    defaultVariants: {
      horizontalSpacing: "medium",
    },
  }
);

const columnVariants = cva("flex flex-col gap-y-grid-verticalSpacing", {
  variants: {
    verticalAlignment: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      spaceBetween: "justify-between",
    },
  },
  defaultVariants: {
    verticalAlignment: "start",
  },
});

interface ColumnProps extends VariantProps<typeof columnVariants> {
  span?: number;
}

interface GridSectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridSectionVariants>,
    VariantProps<typeof backgroundVariants> {
  verticalPadding: string;
  distribution: "auto" | "manual";
  columns: ColumnProps[];
  renderDropZone?: any;
}

const GridSection = React.forwardRef<HTMLDivElement, GridSectionProps>(
  (
    {
      className,
      distribution,
      columns,
      horizontalSpacing,
      verticalPadding,
      maxContentWidth,
      renderDropZone,
      backgroundColor,
      ...props
    },
    ref
  ) => {
    return (
      <Section
        className={themeMangerCn(
          backgroundVariants({ maxContentWidth, backgroundColor }),
          verticalPadding
        )}
        padding="none"
      >
        <div
          className={themeMangerCn(
            gridSectionVariants({
              horizontalSpacing,
            }),
            className
          )}
          ref={ref}
          style={{
            gridTemplateColumns:
              distribution === "manual"
                ? "repeat(12, 1fr)"
                : `repeat(${columns.length}, 1fr)`,
          }}
          {...props}
        >
          {columns.map(({ span, verticalAlignment }, idx) => (
            <div
              key={idx}
              className={themeMangerCn(
                columnVariants({
                  verticalAlignment,
                })
              )}
              style={{
                gridColumn:
                  span && distribution === "manual"
                    ? `span ${Math.max(Math.min(span, 12), 1)}`
                    : "",
              }}
            >
              {renderDropZone({ zone: `column-${idx}` })}
            </div>
          ))}
        </div>
      </Section>
    );
  }
);

GridSection.displayName = "GridSection";

const gridSectionFields: Fields<GridSectionProps> = {
  distribution: {
    type: "radio",
    options: [
      { value: "auto", label: "Auto" },
      { value: "manual", label: "Manual" },
    ],
  },
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
      verticalAlignment: {
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
    options: paddingClasses,
  },
  horizontalSpacing: {
    label: "Horizontal Spacing",
    type: "select",
    options: [
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "large", label: "Large" },
    ],
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
    distribution: "auto",
    columns: [
      {
        verticalAlignment: "start",
      },
      {
        verticalAlignment: "start",
      },
    ],
    verticalPadding: "default",
    backgroundColor: "default",
    horizontalSpacing: "medium",
    maxContentWidth: "default",
  },
  render: ({
    columns,
    distribution,
    backgroundColor,
    maxContentWidth,
    horizontalSpacing,
    verticalPadding,
    puck: { renderDropZone },
  }) => (
    <GridSection
      renderDropZone={renderDropZone}
      columns={columns}
      distribution={distribution}
      backgroundColor={backgroundColor}
      maxContentWidth={maxContentWidth}
      horizontalSpacing={horizontalSpacing}
      verticalPadding={verticalPadding}
    />
  ),
};

export { GridSectionComponent as GridSection, type GridSectionProps };
