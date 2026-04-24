import * as React from "react";
import { PuckComponent, Slot } from "@puckeditor/core";
import { layoutFields, layoutProps, layoutVariants } from "../Layout.tsx";
import {
  backgroundColors,
  ThemeOptions,
} from "../../utils/themeConfigOptions.ts";
import { themeManagerCn } from "../../utils/cn.ts";
import { Background } from "../atoms/background.tsx";
import { YextField } from "../../editor/YextField.tsx";
import { VisibilityWrapper } from "../atoms/visibilityWrapper.tsx";
import { AdvancedCoreInfoCategory } from "../categories/AdvancedCoreInfoCategory.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";

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
          allow={[...AdvancedCoreInfoCategory, "Flex"]}
        />
      </Background>
    );
  }
);

FlexContainer.displayName = "Flex";

const flexContainerFields: YextFields<FlexProps> = {
  direction: {
    label: msg("fields.direction", "Direction"),
    type: "radio",
    options: [
      { label: "Horizontal", value: "flex-row" },
      { label: "Vertical", value: "flex-col" },
    ],
  },
  justifyContent: {
    label: msg("fields.justifyContent", "Justify Content"),
    type: "radio",
    options: ThemeOptions.JUSTIFY_CONTENT,
  },
  alignItems: {
    label: msg("fields.alignItems", "Align Items"),
    type: "radio",
    options: ThemeOptions.JUSTIFY_CONTENT,
  },
  wrap: {
    label: msg("fields.wrap", "Wrap"),
    type: "radio",
    options: [
      { label: "No Wrap", value: "nowrap" },
      { label: "Wrap", value: "wrap" },
    ],
  },
  flexZone: {
    type: "slot",
  },
  ...layoutFields,
  liveVisibility: {
    label: msg("fields.liveVisibility", "Visible on Live Page"),
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  },
};

export const Flex: YextComponentConfig<FlexProps> = {
  label: "Flex",
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
