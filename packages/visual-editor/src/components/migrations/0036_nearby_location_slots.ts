import { Migration } from "../../utils/migrate.ts";

export const nearbyLocationSlots: Migration = {
  NearbyLocationsSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        id: props.id,
        analytics: props.analytics,
        liveVisibility: props.liveVisibility,
        styles: {
          backgroundColor: props.styles.backgroundColor,
        },
        slots: {
          SectionHeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                id: `${props.id}-SectionHeadingSlot`,
                data: {
                  text: {
                    field: props.data.heading.field,
                    constantValueEnabled:
                      props.data.heading.constantValueEnabled,
                    constantValue: props.data.heading.constantValue,
                  },
                },
                styles: props.styles.heading,
              },
            },
          ],
          CardsWrapperSlot: [
            {
              type: "NearbyLocationCardsWrapper",
              props: {
                id: `${props.id}-CardsWrapperSlot`,
                data: {
                  coordinate: props.data.coordinate,
                  radius: props.data.radius,
                  limit: props.data.limit,
                },
                styles: {
                  backgroundColor: props.styles.cards.backgroundColor,
                  headingLevel: props.styles.cards.headingLevel,
                  hours: props.styles.hours,
                  phone: {
                    phoneNumberFormat: props.styles.phoneNumberFormat,
                    phoneNumberLink: props.styles.phoneNumberLink,
                  },
                },
                sectionHeadingLevel: props.styles.heading.level,
              },
            },
          ],
        },
      };
    },
  },
};
