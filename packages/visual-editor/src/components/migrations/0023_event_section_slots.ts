import { Migration } from "../../utils/migrate.ts";

export const eventSectionSlots: Migration = {
  EventSection: {
    action: "updated",
    propTransformation: (props) => {
      const headingText = props.data.heading;
      const headingStyles = props.styles.heading;

      delete props.data.heading;
      delete props.styles.heading;

      return {
        ...props,
        slots: {
          SectionHeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                data: {
                  text: headingText,
                },
                styles: headingStyles,
              },
            },
          ],
        },
      };
    },
  },
};
