import * as React from "react";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
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
  slots: { Column: Slot }[];
  liveVisibility: boolean;
  className?: string;
  /** @internal */
  analytics: {
    scope?: string;
  };
}

const GridSection = React.forwardRef<
  HTMLDivElement,
  Parameters<PuckComponent<GridProps>>[0]
>(({ className, columns = 2, backgroundColor, slots }, ref) => {
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
        {slots.slice(0, columns).map(({ Column }, idx) => (
          <Column
            key={idx}
            className={themeManagerCn(
              layoutVariants({ gap: "4" }),
              `flex flex-col`
            )}
            allow={AdvancedCoreInfoCategory.filter((k) => k !== "Grid")}
          />
        ))}
      </div>
    </Background>
  );
});

GridSection.displayName = "GridSection";

const gridSectionFields: Fields<GridProps> = {
  columns: YextField(msg("fields.columns", "Columns"), {
    type: "radio",
    options: [
      { label: msg("fields.options.two", "Two"), value: 2 },
      { label: msg("fields.options.three", "Three"), value: 3 },
    ],
  }),
  slots: {
    type: "array",
    arrayFields: {
      Column: { type: "slot" },
    },
    visible: false,
  },
  backgroundColor: YextField(
    msg("fields.backgroundColor", "Background Color"),
    {
      type: "select",
      options: "BACKGROUND_COLOR",
    }
  ),
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
    },
  }),
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

/**
 * The Grid Section component presents a series of columns into which a variety of smaller content blocks may be dragged, allowing for a higher degree of customization.
 */
export const Grid: ComponentConfig<GridProps> = {
  label: msg("components.gridSection", "Grid Section"),
  fields: gridSectionFields,
  defaultProps: {
    columns: 2,
    slots: [{ Column: [] }, { Column: [] }, { Column: [] }],
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
