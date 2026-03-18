import { getRandomPlaceholderImage } from "../../utils/imagePlaceholders.ts";
import { Migration } from "../../utils/migrate.ts";

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
      newProps.data.backgroundImage = {
        field: "",
        constantValue: {
          en: getRandomPlaceholderImage({ width: 1440, height: 900 }),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      };

      return newProps;
    },
  },
};
