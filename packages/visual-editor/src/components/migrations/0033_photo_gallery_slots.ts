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
      const imagesData = props.data.images;
      const imagesStyles = props.styles?.image;

      delete props.data;
      delete props.styles?.heading;
      delete props.styles?.image;

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
          PhotoGalleryWrapper: [
            {
              type: "PhotoGalleryWrapper",
              props: {
                data: {
                  images: imagesData,
                },
                styles: {
                  image: imagesStyles,
                },
              },
            },
          ],
        },
      };
    },
  },
};
