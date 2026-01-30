import { Migration } from "../../utils/migrate";
import { getDefaultRTF } from "../../editor/TranslatableRichTextField";

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
      newProps.styles.showBrow = newProps.styles.showBrow ?? true;
      newProps.styles.showTitle = newProps.styles.showTitle ?? true;
      newProps.styles.showPrice = newProps.styles.showPrice ?? false;
      newProps.styles.showDescription = newProps.styles.showDescription ?? true;
      newProps.styles.showCTA = newProps.styles.showCTA ?? true;

      // Migrate CategorySlot to BrowSlot
      if (newProps.slots?.CardsWrapperSlot) {
        newProps.slots.CardsWrapperSlot = newProps.slots.CardsWrapperSlot.map(
          (wrapper: any) => {
            if (wrapper.props?.slots?.CardSlot) {
              const newWrapper = {
                ...wrapper,
                props: {
                  ...wrapper.props,
                  slots: {
                    ...wrapper.props.slots,
                    CardSlot: wrapper.props.slots.CardSlot.map((card: any) => {
                      if (card.props?.slots?.CategorySlot) {
                        const newCard = {
                          ...card,
                          props: {
                            ...card.props,
                            slots: {
                              ...card.props.slots,
                              BrowSlot: card.props.slots.CategorySlot,
                              PriceSlot: [
                                {
                                  type: "BodyTextSlot",
                                  props: {
                                    data: {
                                      text: {
                                        field: "",
                                        constantValue: {
                                          en: getDefaultRTF("$123.00", {
                                            isBold: true,
                                          }),
                                          hasLocalizedValue: "true",
                                        },
                                        constantValueEnabled: true,
                                      },
                                    },
                                    styles: {
                                      variant: "base",
                                    },
                                  },
                                },
                              ],
                            },
                          },
                        };
                        delete newCard.props.slots.CategorySlot;
                        return newCard;
                      }
                      return card;
                    }),
                  },
                },
              };
              return newWrapper;
            }
            return wrapper;
          }
        );
      }

      return newProps;
    },
  },
};
