import * as React from "react";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import {
  themeManagerCn,
  backgroundColors,
  PageSection,
  YextField,
  VisibilityWrapper,
  getAnalyticsScopeHash,
  msg,
  AdvancedCoreInfoCategory,
  ThemeOptions,
} from "@yext/visual-editor";
import { layoutProps, layoutVariants } from "../Layout.tsx";
import { AnalyticsScopeProvider } from "@yext/pages-components";

export interface GridProps extends layoutProps {
  columns: number;
  slots: { Column: Slot }[];
  liveVisibility: boolean;
  className?: string;
  align?: "left" | "center" | "right";
  /** @internal */
  analytics: {
    scope?: string;
  };
}

const GridSection = React.forwardRef<
  HTMLDivElement,
  Parameters<PuckComponent<GridProps>>[0]
>(({ className, columns = 2, backgroundColor, slots, align }, ref) => {
  const resolvedAlign = align ?? "left";

  return (
    <PageSection background={backgroundColor} className={className}>
      <div
        className={
          columns === 1
            ? "grid w-full gap-8 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1"
            : columns === 2
              ? "grid w-full gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
              : "grid w-full gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }
        ref={ref}
      >
        {slots.slice(0, columns).map(({ Column }, idx) => (
          <Column
            key={idx}
            className={themeManagerCn(
              layoutVariants({ gap: "4" }),
              `flex flex-col max-w-full overflow-hidden`,
              columns === 1 &&
                (resolvedAlign === "left"
                  ? `md:items-start text-start`
                  : resolvedAlign === "right"
                    ? `md:items-end text-end`
                    : `md:items-center text-center`)
            )}
            allow={AdvancedCoreInfoCategory.filter((k) => k !== "Grid")}
          />
        ))}
      </div>
    </PageSection>
  );
});

GridSection.displayName = "GridSection";

const gridSectionFields: Fields<GridProps> = {
  columns: YextField(msg("fields.columns", "Columns"), {
    type: "radio",
    options: [
      { label: msg("fields.options.one", "One"), value: 1 },
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
  align: YextField(msg("fields.alignContent", "Align Content"), {
    type: "radio",
    options: ThemeOptions.ALIGNMENT,
  }),
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
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

/**
 * The Grid Section component presents a series of columns into which a variety of smaller content blocks may be dragged, allowing for a higher degree of customization.
 */
export const Grid: ComponentConfig<{ props: GridProps }> = {
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
    align: "left",
  },
  resolveFields: (data) => {
    if (data.props.columns === 1) {
      return gridSectionFields;
    }

    const rest = { ...gridSectionFields };
    delete rest.align;

    return rest;
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
