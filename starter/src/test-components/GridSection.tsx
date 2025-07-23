import * as React from "react";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import {
  backgroundColors,
  ContentBlockCategory,
  YextField,
  VisibilityWrapper,
  LayoutBlockCategory,
  BackgroundStyle,
  PageSection,
} from "@yext/visual-editor";
import "./grid-section-styles.css";

export interface GridSectionProps {
  rows: number;
  columns: number;
  backgroundColor?: BackgroundStyle;
  liveVisibility: boolean;
}

const GridSectionComponent = React.forwardRef<HTMLDivElement, GridSectionProps>(
  ({ rows = 1, columns = 2, backgroundColor }, ref) => {
    return (
      <PageSection background={backgroundColor}>
        <div
          className="grid w-full min-h-0 min-w-0 max-w-pageSection-contentWidth"
          ref={ref}
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {Array.from({ length: columns * rows })?.map((_, idx) => (
            <div className="w-full" key={idx}>
              <DropZone
                className="flex flex-col w-full grid-column-dropzone"
                zone={`grid-column-${idx}`}
                allow={[...ContentBlockCategory, ...LayoutBlockCategory]}
              />
            </div>
          ))}
        </div>
      </PageSection>
    );
  },
);

GridSectionComponent.displayName = "GridSection";

const gridSectionFields: Fields<GridSectionProps> = {
  rows: YextField("Rows", {
    type: "number",
    min: 1,
    max: 12,
  }),
  columns: YextField("Columns", {
    type: "number",
    min: 1,
    max: 12,
  }),
  backgroundColor: YextField("Background Color", {
    type: "select",
    options: "BACKGROUND_COLOR",
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

// Helper function to find all HeadingText components in the grid data
const findHeadingTextComponents = (data: any): any[] => {
  const headingTexts: any[] = [];

  const traverse = (content: any[]) => {
    if (!Array.isArray(content)) return;

    content.forEach((item) => {
      if (item.type === "HeadingText") {
        headingTexts.push(item);
      }
      if (item.content && Array.isArray(item.content)) {
        traverse(item.content);
      }
    });
  };

  // Traverse all grid columns
  for (
    let i = 0;
    i < (data.props?.rows || 1) * (data.props?.columns || 2);
    i++
  ) {
    const zoneKey = `grid-column-${i}`;
    if (
      data.zones &&
      data.zones[zoneKey] &&
      Array.isArray(data.zones[zoneKey])
    ) {
      traverse(data.zones[zoneKey]);
    }
  }

  return headingTexts;
};

export const GridSection: ComponentConfig<GridSectionProps> = {
  label: "Grid Section",
  fields: gridSectionFields,
  defaultProps: {
    rows: 1,
    columns: 2,
    backgroundColor: backgroundColors.background1.value,
    liveVisibility: true,
  },
  resolveData: (data, { lastData }) => {
    // Find all HeadingText components in the current grid
    const headingTexts = findHeadingTextComponents(data);

    if (headingTexts.length === 0) {
      return data;
    }

    // Find the first HeadingText component that has a level set
    let masterLevel: number | undefined;

    // First, try to find a level from the current data
    for (const headingText of headingTexts) {
      if (headingText.props?.level !== undefined) {
        masterLevel = headingText.props.level;
        break;
      }
    }

    // If no level found in current data, try to find from lastData
    if (masterLevel === undefined && lastData) {
      const lastHeadingTexts = findHeadingTextComponents(lastData);
      for (const headingText of lastHeadingTexts) {
        if (headingText.props?.level !== undefined) {
          masterLevel = headingText.props.level;
          break;
        }
      }
    }

    // If still no level found, use default level 2
    if (masterLevel === undefined) {
      masterLevel = 2;
    }

    // Synchronize all HeadingText components to use the same level
    for (const headingText of headingTexts) {
      if (headingText.props) {
        headingText.props.level = masterLevel;
      }
    }

    return data;
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
      iconSize="md"
    >
      <GridSectionComponent {...props} />
    </VisibilityWrapper>
  ),
};
