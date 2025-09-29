import { Migration } from "../../utils/migrate.ts";

export const eventSectionSlots: Migration = {
  EventSection: {
    action: "updated",
    propTransformation: (props) => {
      const headingText = props.data.heading ?? {
        constantValue: {
          en: "",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
        field: "",
      };
      const headingStyles = {
        level: props.styles?.heading?.level ?? 2,
        align: props.styles?.heading?.align ?? "left",
      };

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
