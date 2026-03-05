// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import { YextField } from "../ve.ts";
import { YetiSectionShell } from "../atoms/YetiSectionShell.tsx";
import { defaultYetiSectionHeadingSlotProps } from "./YetiSectionHeadingSlot.tsx";
import { defaultYetiExploreCardsSlotProps } from "./YetiExploreCardsSlot.tsx";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiExploreCarouselSectionProps {
  styles: {
    backgroundClassName: "bg-white" | "bg-neutral-100";
    showHeading: boolean;
    showCards: boolean;
  };
  slots: {
    HeadingSlot: Slot;
    CardsSlot: Slot;
  };
  liveVisibility: boolean;
}

const fields: Fields<YetiExploreCarouselSectionProps> = {
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundClassName: YextField("Background", {
        type: "select",
        options: [
          { label: "White", value: "bg-white" },
          { label: "Soft Gray", value: "bg-neutral-100" },
        ],
      }),
      showHeading: YextField("Show Heading", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showCards: YextField("Show Cards", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      HeadingSlot: { type: "slot" },
      CardsSlot: { type: "slot" },
    },
    visible: false,
  },
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const YetiExploreCarouselSectionComponent: PuckComponent<
  YetiExploreCarouselSectionProps
> = ({ styles, slots }) => {
  return (
    <YetiSectionShell
      backgroundClassName={styles.backgroundClassName}
      className="py-10 md:py-14"
    >
      <div className="flex w-full flex-col gap-8">
        {styles.showHeading ? (
          <slots.HeadingSlot style={{ height: "auto" }} allow={[]} />
        ) : null}
        {styles.showCards ? (
          <slots.CardsSlot style={{ height: "auto" }} allow={[]} />
        ) : null}
      </div>
    </YetiSectionShell>
  );
};

export const YetiExploreCarouselSection: ComponentConfig<{
  props: YetiExploreCarouselSectionProps;
}> = {
  label: "Yeti Explore Carousel Section",
  fields,
  defaultProps: {
    styles: {
      backgroundClassName: "bg-white",
      showHeading: true,
      showCards: true,
    },
    slots: {
      HeadingSlot: [
        {
          type: "YetiSectionHeadingSlot",
          props: {
            ...defaultYetiSectionHeadingSlotProps,
            data: {
              text: toTranslatableString("EXPLORE OUR STORE"),
            },
            styles: {
              level: 3,
              align: "left",
            },
          },
        },
      ],
      CardsSlot: [
        {
          type: "YetiExploreCardsSlot",
          props: defaultYetiExploreCardsSlotProps,
        },
      ],
    },
    liveVisibility: true,
  },
  render: (props) => {
    if (!props.liveVisibility && !props.puck.isEditing) {
      return null;
    }
    return <YetiExploreCarouselSectionComponent {...props} />;
  },
};
