import * as React from "react";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import {
  themeManagerCn,
  backgroundColors,
  Background,
  ContentBlockCategory,
  CardCategory,
  LayoutBlockCategory,
  YextField,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { layoutFields, layoutProps, layoutVariants } from "../Layout.tsx";

export interface GridProps extends layoutProps {
  columns: number;
  liveVisibility: boolean;
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
      <Background
        background={backgroundColor}
        className={themeManagerCn(
          layoutVariants({
            verticalPadding,
            horizontalPadding,
          })
        )}
      >
        <div
          className={themeManagerCn(
            layoutVariants({ gap, columnFormatting }),
            `flex flex-col min-h-0 min-w-0 max-w-pageSection-contentWidth`,
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
                allow={[
                  ...CardCategory,
                  ...ContentBlockCategory,
                  ...LayoutBlockCategory.filter((x) => x !== "Collection"),
                ]}
              />
            </div>
          ))}
        </div>
      </Background>
    );
  }
);

GridSection.displayName = "GridSection";

const gridSectionFields: Fields<GridProps> = {
  columns: YextField("Columns", {
    type: "number",
    min: 1,
    max: 12,
  }),
  ...layoutFields,
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

export const Grid: ComponentConfig<GridProps> = {
  label: "Grid",
  fields: gridSectionFields,
  defaultProps: {
    columns: 2,
    gap: "4",
    verticalPadding: "0",
    horizontalPadding: "0",
    backgroundColor: backgroundColors.background1.value,
    columnFormatting: "default",
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
      iconSize="md"
    >
      <GridSection {...props} />
    </VisibilityWrapper>
  ),
};
