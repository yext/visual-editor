import { Migration } from "../../utils/migrate.ts";

export const updateImageStylingMigration: Migration = {
  // Update ImageWrapper component
  ImageWrapper: {
    action: "updated",
    propTransformation: ({ ...props }) => ({
      ...props,
      // Remove layout and height, keep aspectRatio and width
    }),
  },

  // Update PhotoGallerySection - move data above styles, update imageStyle to image
  PhotoGallerySection: {
    action: "updated",
    propTransformation: ({ styles, data, ...props }) => {
      const { imageStyle, ...otherStyles } = styles || {};
      return {
        ...props,
        data,
        styles: {
          ...otherStyles,
          image: {
            aspectRatio: imageStyle?.aspectRatio,
            width: imageStyle?.width,
          },
        },
      };
    },
  },

  // Update HeroSection - add image styling
  HeroSection: {
    action: "updated",
    propTransformation: ({ styles, ...props }) => ({
      ...props,
      styles: {
        ...styles,
        image: {
          aspectRatio: 1.78, // Default 16:9
        },
      },
    }),
  },

  // Update PromoSection - add image styling
  PromoSection: {
    action: "updated",
    propTransformation: ({ styles, ...props }) => ({
      ...props,
      styles: {
        ...styles,
        image: {
          aspectRatio: 1.78, // Default 16:9
        },
      },
    }),
  },
};
