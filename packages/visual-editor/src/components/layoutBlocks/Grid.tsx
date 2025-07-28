import * as React from "react";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import {
  themeManagerCn,
  backgroundColors,
  Background,
  YextField,
  VisibilityWrapper,
  getAnalyticsScopeHash,
  msg,
} from "@yext/visual-editor";
import { layoutProps, layoutVariants } from "../Layout.tsx";
import { AdvancedCoreInfoCategory } from "../_componentCategories";
import { AnalyticsScopeProvider } from "@yext/pages-components";

export interface GridProps extends layoutProps {
  columns: number;
  liveVisibility: boolean;
  /** @internal */
  analytics?: {
    scope?: string;
  };
}

const GridSection = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, columns = 2, backgroundColor }, ref) => {
    return (
      <Background
        background={backgroundColor}
        className={themeManagerCn(
          "flex flex-col components w-full px-4 py-pageSection-verticalPadding items-center",
          className
        )}
      >
        <div
          className={
            "grid w-full gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-" +
            columns
          }
          ref={ref}
        >
          {Array.from({ length: columns })?.map((_, idx) => (
            <DropZone
              key={idx}
              className={themeManagerCn(
                layoutVariants({ gap: "4" }),
                `flex flex-col`
              )}
              zone={`column-${idx}`}
              allow={AdvancedCoreInfoCategory.filter((k) => k !== "Grid")}
            />
          ))}
        </div>
      </Background>
    );
  }
);

GridSection.displayName = "GridSection";

const gridSectionFields: Fields<GridProps> = {
  columns: YextField(msg("fields.columns", "Columns"), {
    type: "radio",
    options: [
      { label: msg("fields.options.two", "Two"), value: 2 },
      { label: msg("fields.options.three", "Three"), value: 3 },
    ],
  }),
  backgroundColor: YextField(
    msg("fields.backgroundColor", "Background Color"),
    {
      type: "select",
      options: "BACKGROUND_COLOR",
    }
  ),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: true },
      ],
    }
  ),
};

export const Grid: ComponentConfig<GridProps> = {
  label: msg("fields.gridSection", "Grid Section"),
  fields: gridSectionFields,
  defaultProps: {
    columns: 2,
    backgroundColor: backgroundColors.background1.value,
    liveVisibility: true,
    analytics: {
      scope: "gridSection",
    },
  },
  render: (props) => (
    <AnalyticsScopeProvider
      name={`${props.analytics?.scope ?? "gridSection"}${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
        iconSize="md"
      >
        <GridSection {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
