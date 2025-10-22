import { WithId } from "@measured/puck";
import { Migration } from "../../utils/migrate";
import { ReviewsSectionProps } from "../pageSections/ReviewsSection/ReviewsSection";
import { HeadingTextProps } from "../contentBlocks/HeadingText";

export const reviewsSectionSlots: Migration = {
  ReviewsSection: {
    action: "updated",
    propTransformation: (props) => {
      // Old structure had backgroundColor at the top level
      // Now it's nested under styles
      const backgroundColor =
        props.backgroundColor || props.styles?.backgroundColor;

      return {
        id: props.id,
        analytics: props.analytics || {
          scope: "reviewsSection",
        },
        liveVisibility: props.liveVisibility ?? true,
        styles: {
          backgroundColor,
        },
        slots: {
          SectionHeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                data: {
                  text: {
                    field: "",
                    constantValueEnabled: true,
                    constantValue: {
                      en: "Recent Reviews",
                      hasLocalizedValue: "true",
                    },
                  },
                },
                styles: { level: 3, align: "center" },
              } satisfies HeadingTextProps,
            },
          ],
        },
      } satisfies WithId<ReviewsSectionProps>;
    },
  },
};
