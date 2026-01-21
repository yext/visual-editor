import { Migration } from "../../utils/migrate";

export const photoGalleryVariant: Migration = {
  PhotoGallerySection: {
    action: "updated",
    propTransformation: (props) => {
      if (!props.styles?.variant) {
        return {
          ...props,
          styles: {
            ...props.styles,
            variant: "carousel",
          },
          slots: {
            ...props.slots,
            PhotoGalleryWrapper: [
              {
                ...props.slots.PhotoGalleryWrapper[0],
                parentData: {
                  variant: "carousel",
                },
                styles: {
                  ...props.slots.PhotoGalleryWrapper[0]?.styles,
                  carouselImageCount: 1,
                },
              },
            ],
          },
        };
      }

      return props;
    },
  },
};
