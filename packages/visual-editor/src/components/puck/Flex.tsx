import * as React from "react";
import { ComponentConfig, DropZone, Fields } from "@measured/puck";
import { layoutFields, layoutProps, layoutVariants } from "./Layout.tsx";
import {
  backgroundColors,
  themeManagerCn,
  ThemeOptions,
  Background,
  CardCategory,
  ContentBlockCategory,
  LayoutBlockCategory,
} from "../../index.js";

export interface FlexProps extends layoutProps {
  justifyContent: "start" | "center" | "end";
  direction: "flex-row" | "flex-col";
  wrap: "wrap" | "nowrap";
}

const FlexContainer = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      direction,
      justifyContent,
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
  direction: {
    label: "Direction",
    type: "radio",
    options: [
      { label: "Horizontal", value: "flex-row" },
      { label: "Vertical", value: "flex-col" },
    ],
  },
  justifyContent: {
    label: "Justify Content",
    type: "radio",
    options: ThemeOptions.JUSTIFY_CONTENT,
  },
  wrap: {
    label: "Wrap",
    type: "radio",
    options: [
      { label: "No Wrap", value: "nowrap" },
      { label: "Wrap", value: "wrap" },
    ],
  },
  ...layoutFields,
};

export const Flex: ComponentConfig<FlexProps> = {
  label: "Flex",
  fields: flexContainerFields,
  defaultProps: {
    direction: "flex-row",
    justifyContent: "start",
    wrap: "nowrap",
    gap: "4",
    verticalPadding: "0",
    horizontalPadding: "0",
    backgroundColor: backgroundColors.background1.value,
  },
  render: (props) => <FlexContainer {...props} />,
};
