import * as React from "react";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import { layoutFields, layoutProps, layoutVariants } from "../Layout.tsx";
import {
  backgroundColors,
  themeManagerCn,
  Background,
  CardCategory,
  ContentBlockCategory,
  LayoutBlockCategory,
  YextField,
  VisibilityWrapper,
  i18n,
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
          allow={[
            ...CardCategory,
            ...ContentBlockCategory,
            ...LayoutBlockCategory.filter((x) => x !== "Collection"),
          ]}
        />
      </Background>
    );
  }
);

FlexContainer.displayName = "Flex";

const flexContainerFields: Fields<FlexProps> = {
  direction: YextField(i18n("Direction"), {
    type: "radio",
    options: [
      { label: i18n("Horizontal"), value: "flex-row" },
      { label: i18n("Vertical"), value: "flex-col" },
    ],
  }),
  justifyContent: YextField(i18n("Justify Content"), {
    type: "radio",
    options: "JUSTIFY_CONTENT",
  }),
  alignItems: YextField(i18n("Align Items"), {
    type: "radio",
    options: "JUSTIFY_CONTENT",
  }),
  wrap: YextField(i18n("Wrap"), {
    type: "radio",
    options: [
      { label: i18n("No Wrap"), value: "nowrap" },
      { label: i18n("Wrap"), value: "wrap" },
    ],
  }),
  ...layoutFields,
  liveVisibility: YextField(i18n("Visible on Live Page"), {
    type: "radio",
    options: [
      { label: i18n("Show"), value: true },
      { label: i18n("Hide"), value: false },
    ],
  }),
};

export const Flex: ComponentConfig<FlexProps> = {
  label: i18n("Flex"),
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
