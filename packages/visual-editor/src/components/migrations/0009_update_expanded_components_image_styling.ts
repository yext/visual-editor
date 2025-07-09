import { Migration } from "../../utils/migrate.ts";

export const updateExpandedComponentsImageStylingMigration: Migration = {
  // Update ExpandedFooter - convert logoStyles and utilityImagesStyles to use ImageStylingFields
  ExpandedFooter: {
    action: "updated",
    propTransformation: ({ styles, ...props }) => {
      const { primaryFooter, ...otherStyles } = styles || {};
      const { logoStyles, utilityImagesStyles, ...otherPrimaryFooterStyles } =
        primaryFooter || {};

      return {
        ...props,
        styles: {
          ...otherStyles,
          primaryFooter: {
            ...otherPrimaryFooterStyles,
            logo: {
              width: logoStyles?.logoWidth,
              aspectRatio: logoStyles?.aspectRatioForLogo,
            },
            utilityImages: {
              width: utilityImagesStyles?.utilityImagesWidth,
              aspectRatio: utilityImagesStyles?.aspectRatioForUtilityImages,
            },
          },
        },
      };
    },
  },

  // Update ExpandedHeader - convert logoWidth and aspectRatio to use ImageStylingFields
  ExpandedHeader: {
    action: "updated",
    propTransformation: ({ styles, ...props }) => {
      const { primaryHeader, ...otherStyles } = styles || {};
      const { logoWidth, aspectRatio, ...otherPrimaryHeaderStyles } =
        primaryHeader || {};

      return {
        ...props,
        styles: {
          ...otherStyles,
          primaryHeader: {
            ...otherPrimaryHeaderStyles,
            logo: {
              width: logoWidth,
              aspectRatio: aspectRatio,
            },
          },
        },
      };
    },
  },
};
