import { Migration } from "../../utils/migrate";
import { HeadingTextProps } from "../contentBlocks";

export const photoGallerySlots: Migration = {
  PhotoGallerySection: {
    action: "updated",
    propTransformation: (props) => {
      const headingText = props.data.heading ?? {
        constantValue: {
          en: "Gallery",
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
      delete props.styles?.heading;

      return {
        ...props,
        slots: {
          HeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                data: {
                  text: headingText,
                },
                styles: headingStyles,
              } satisfies HeadingTextProps,
            },
          ],
        },
      };
    },
  },
};
