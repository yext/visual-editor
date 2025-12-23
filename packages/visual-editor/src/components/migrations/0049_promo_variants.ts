import { getRandomPlaceholderImage } from "../../utils/imagePlaceholders";
import { Migration } from "../../utils/migrate";

export const promoVariants: Migration = {
  PromoSection: {
    action: "updated",
    propTransformation: (props) => {
      const orientation = props.styles?.orientation;
      delete props.styles?.orientation;

      const newProps = { ...props };

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
