import { Migration } from "../../utils/migrate";

export const productVariants: Migration = {
  ProductSection: {
    action: "updated",
    propTransformation: (props) => {
      const newProps = { ...props };
      if (!newProps.styles) {
        newProps.styles = {};
      }

      newProps.styles.cardVariant = "immersive";
      newProps.styles.showBrow = false;

      return newProps;
    },
  },
};
