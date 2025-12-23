import { getRandomPlaceholderImage } from "../../utils/imagePlaceholders";
import { Migration } from "../../utils/migrate";

export const promoVariants: Migration = {
  PromoSection: {
    action: "updated",
    propTransformation: (props) => {
      const newProps = { ...props };
      const orientation = newProps.styles?.orientation;
      delete newProps.styles?.orientation;
      if (!newProps.styles) {
        newProps.styles = {};
      }

      newProps.styles.variant = "classic";
      newProps.styles.desktopImagePosition = orientation;
      newProps.styles.mobileImagePosition = "top";
      newProps.styles.imageHeight = 500;
      newProps.styles.containerAlignment = "left";
      newProps.styles.backgroundImage = {
        field: "",
        constantValue: getRandomPlaceholderImage({ width: 1440, height: 900 }),
        constantValueEnabled: true,
      };

      return newProps;
    },
  },
};
