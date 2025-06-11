import * as React from "react";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import { layoutFields, layoutProps, layoutVariants } from "../Layout.tsx";
import {
  backgroundColors,
  themeManagerCn,
  Background,
  ContentBlockCategory,
  YextField,
  VisibilityWrapper,
  LayoutBlockCategory,
  msg,
} from "@yext/visual-editor";

export interface FlexProps extends layoutProps {
  justifyContent: "start" | "center" | "end";
  alignItems: "start" | "center" | "end";
  direction: "flex-row" | "flex-col";
  wrap: "wrap" | "nowrap";
  liveVisibility: boolean;
  flexZone: Slot;
}

const FlexContainer = React.forwardRef<
  HTMLDivElement,
  Parameters<PuckComponent<FlexProps>>[0]
>(
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
      flexZone: FlexZone,
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
        <FlexZone
          className={themeManagerCn(
            layoutVariants({ gap }),
            "flex w-full",
            direction
          )}
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
  flexZone: {
    type: "slot",
  },
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
  label: msg("components.flex", "Flex"),
  fields: flexContainerFields,
  defaultProps: {
    direction: "flex-row",
    justifyContent: "start",
    alignItems: "start",
    wrap: "nowrap",
    gap: "4",
    flexZone: [],
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
