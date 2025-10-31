import { Migration } from "../../utils/migrate.ts";

export const videoSectionSlots: Migration = {
  VideoSection: {
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
      const assetVideo = props.data.assetVideo;

      delete props.data.heading;
      delete props.styles.heading;
      delete props.data.assetVideo;

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
          VideoSlot: [
            {
              type: "VideoSlot",
              props: {
                data: {
                  assetVideo,
                },
              },
            },
          ],
        },
      };
    },
  },
};
