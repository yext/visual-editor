import * as React from "react";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import { layoutFields, layoutProps, layoutVariants } from "../Layout.tsx";
import {
  backgroundColors,
  themeManagerCn,
  Background,
  ContentBlockCategory,
  YextField,
  VisibilityWrapper,
  LayoutBlockCategory,
} from "@yext/visual-editor";

export interface FlexProps extends layoutProps {
  justifyContent: "start" | "center" | "end";
  alignItems: "start" | "center" | "end";
  direction: "flex-row" | "flex-col";
  wrap: "wrap" | "nowrap";
  liveVisibility: boolean;
}

const FlexContainer = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      direction,
      justifyContent,
      alignItems,
      wrap,
      gap,
      verticalPadding,
      horizontalPadding,
      backgroundColor,
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
        ref={ref}
      >
        <DropZone
          className={themeManagerCn(
            layoutVariants({ gap }),
            "flex w-full",
            direction
          )}
          zone="flex-container"
          style={{
            justifyContent,
            alignItems,
            flexWrap: wrap,
          }}
          allow={[...ContentBlockCategory, ...LayoutBlockCategory]}
        />
      </Background>
    );
  }
);

FlexContainer.displayName = "Flex";

const flexContainerFields: Fields<FlexProps> = {
  direction: YextField("Direction", {
    type: "radio",
    options: [
      { label: "Horizontal", value: "flex-row" },
      { label: "Vertical", value: "flex-col" },
    ],
  }),
  justifyContent: YextField("Justify Content", {
    type: "radio",
    options: "JUSTIFY_CONTENT",
  }),
  alignItems: YextField("Align Items", {
    type: "radio",
    options: "JUSTIFY_CONTENT",
  }),
  wrap: YextField("Wrap", {
    type: "radio",
    options: [
      { label: "No Wrap", value: "nowrap" },
      { label: "Wrap", value: "wrap" },
    ],
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

export const Flex: ComponentConfig<FlexProps> = {
  label: "Flex",
  fields: flexContainerFields,
  defaultProps: {
    direction: "flex-row",
    justifyContent: "start",
    alignItems: "start",
    wrap: "nowrap",
    gap: "4",
    verticalPadding: "0",
    horizontalPadding: "0",
    backgroundColor: backgroundColors.background1.value,
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
      iconSize="md"
    >
      <FlexContainer {...props} />
    </VisibilityWrapper>
  ),
};
