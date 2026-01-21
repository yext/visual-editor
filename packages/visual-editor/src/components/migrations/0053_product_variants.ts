import { Migration } from "../../utils/migrate";

export const productVariants: Migration = {
  ProductSection: {
    action: "updated",
    propTransformation: (props) => {
      const newProps = {
        ...props,
        styles: { ...props.styles },
        slots: { ...props.slots },
      };

      if (newProps.styles.cardVariant == null) {
        newProps.styles.cardVariant = "immersive";
      }

      newProps.styles.showImage = newProps.styles.showImage ?? true;
      newProps.styles.showBrow = newProps.styles.showBrow ?? false;
      newProps.styles.showTitle = newProps.styles.showTitle ?? true;
      newProps.styles.showPrice = newProps.styles.showPrice ?? true;
      newProps.styles.showDescription = newProps.styles.showDescription ?? true;
      newProps.styles.showCTA = newProps.styles.showCTA ?? true;

      // Migrate CategorySlot to PriceSlot
      if (newProps.slots?.CardsWrapperSlot) {
        newProps.slots.CardsWrapperSlot.forEach((wrapper: any) => {
          if (wrapper.props?.slots?.CardSlot) {
            wrapper.props.slots.CardSlot.forEach((card: any) => {
              if (card.props?.slots?.CategorySlot) {
                card.props.slots.PriceSlot = card.props.slots.CategorySlot;
                delete card.props.slots.CategorySlot;
              }
            });
          }
        });
      }

      return newProps;
    },
  },
};
