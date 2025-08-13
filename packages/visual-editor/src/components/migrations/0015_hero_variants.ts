import { Migration } from "../../utils/migrate.ts";

export const heroVariants: Migration = {
  HeroSection: {
    action: "updated",
    propTransformation: (props) => {
      const { imageOrientation, ...restStyles } = props.styles;
      return {
        ...props,
        styles: {
          ...restStyles,
          variant: "classic",
          desktopContainerPosition: "left",
          mobileContentAlignment: "left",
          showImage: true,
          mobileImagePosition: "bottom",
          desktopImagePosition: imageOrientation,
        },
      };
    },
  },
};
