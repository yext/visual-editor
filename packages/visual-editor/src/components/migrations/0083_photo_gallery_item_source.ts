import { type Migration } from "../../utils/migrate.ts";

/**
 * Gallery item-source migration.
 *
 * 1. Moves each saved manual image into an image and link item.
 * 2. Keeps the linked list field and maps each image item to itself.
 * 3. Leaves Gallery styles and section slots unchanged.
 */
export const photoGalleryItemSource: Migration = {
  PhotoGalleryWrapper: {
    action: "updated",
    propTransformation: (props) => {
      const images = props.data?.images;
      if (!images || images.mappings) {
        return props;
      }

      return {
        ...props,
        data: {
          ...props.data,
          images: {
            ...images,
            constantValue: Array.isArray(images.constantValue)
              ? images.constantValue.map((item: unknown) => {
                  const image = item as Record<string, unknown> | null;
                  const imageValue =
                    image && "url" in image
                      ? image
                      : (image?.assetImage ?? image?.image ?? item);
                  return {
                    image: {
                      field: "",
                      constantValueEnabled: true,
                      constantValue: imageValue,
                    },
                    link: {
                      field: "",
                      constantValueEnabled: true,
                      constantValue: {
                        defaultValue:
                          typeof image?.clickthroughUrl === "string"
                            ? image.clickthroughUrl
                            : "",
                      },
                    },
                  };
                })
              : [],
            mappings: {
              image: {
                field: images.field ? "$item" : "",
                constantValueEnabled: false,
                constantValue: undefined,
              },
              link: {
                field: "",
                constantValueEnabled: false,
                constantValue: undefined,
              },
            },
          },
        },
      };
    },
  },
};
