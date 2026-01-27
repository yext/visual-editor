import * as React from "react";
import {
  ProductSectionType,
  ComponentFields,
  msg,
  resolveYextEntityField,
  i18nComponentsInstance,
} from "@yext/visual-editor";
import {
  ComponentConfig,
  ComponentData,
  PuckComponent,
  setDeep,
} from "@puckeditor/core";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import {
  CardWrapperType,
  cardWrapperFields,
} from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import {
  defaultProductCardSlotData,
  ProductCardProps,
} from "./ProductCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";

export type ProductCardsWrapperProps = CardWrapperType<ProductSectionType>;

const productCardsWrapperFields = cardWrapperFields<ProductCardsWrapperProps>(
  msg("components.products", "Products"),
  ComponentFields.ProductSection.type
);

const ProductCardsWrapperComponent: PuckComponent<ProductCardsWrapperProps> = (
  props
) => {
  const { slots } = props;

  return (
    <CardContextProvider>
      <slots.CardSlot
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 align-stretch"
        allow={[]}
      />
    </CardContextProvider>
  );
};

export const ProductCardsWrapper: ComponentConfig<{
  props: ProductCardsWrapperProps;
}> = {
  label: msg("slots.productCards", "Product Cards"),
  fields: productCardsWrapperFields,
  defaultProps: {
    data: {
      field: "",
      constantValueEnabled: true,
      constantValue: [],
    },
    slots: {
      CardSlot: [],
    },
  },
  resolveData: (data, params) => {
    const streamDocument = params.metadata.streamDocument;
    const sharedCardProps =
      data.props.slots.CardSlot.length === 0
        ? undefined
        : {
            backgroundColor:
              data.props.slots.CardSlot[0].props.styles.backgroundColor,
            slotStyles: gatherSlotStyles(
              data.props.slots.CardSlot[0].props.slots
            ),
          };

    if (!data.props.data.constantValueEnabled && data.props.data.field) {
      // ENTITY VALUES
      const resolvedProducts = resolveYextEntityField<
        ProductSectionType | { products: undefined }
      >(
        streamDocument,
        {
          ...data.props.data,
          constantValue: { products: undefined },
        },
        i18nComponentsInstance.language || "en"
      )?.products;

      if (!resolvedProducts?.length) {
        return setDeep(data, "props.slots.CardSlot", []);
      }

      const requiredLength = resolvedProducts.length;
      const currentLength = data.props.slots.CardSlot.length;
      // If CardSlot is shorter, create an array of placeholder cards and append them.
      // If CardSlot is longer or equal, this will just be an empty array.
      const cardsToAdd =
        currentLength < requiredLength
          ? Array(requiredLength - currentLength)
              .fill(null)
              .map(() =>
                defaultProductCardSlotData(
                  `ProductCard-${crypto.randomUUID()}`,
                  undefined,
                  sharedCardProps?.backgroundColor,
                  sharedCardProps?.slotStyles
                )
              )
          : [];
      const updatedCardSlot = [
        ...data.props.slots.CardSlot,
        ...cardsToAdd,
      ].slice(0, requiredLength) as ComponentData<ProductCardProps>[];

      return setDeep(
        data,
        "props.slots.CardSlot",
        updatedCardSlot.map((card, i) => {
          card.props.index = i;
          return setDeep(card, "props.parentData", {
            field: data.props.data.field,
            product: resolvedProducts[i],
          } satisfies ProductCardProps["parentData"]);
        })
      );
    } else {
      // STATIC VALUES
      let updatedData = data;

      // For each id in constantValue, check if there's already an existing card.
      // If not, add a new default card.
      // Also, de-duplicate ids to avoid conflicts.
      // Finally, update the card slot and the constantValue object.
      const inUseIds = new Set<string>();
      const newSlots = data.props.data.constantValue.map(({ id }, i) => {
        const existingCard = id
          ? (data.props.slots.CardSlot.find(
              (slot) => slot.props.id === id
            ) as ComponentData<ProductCardProps>)
          : undefined;

        // Make a deep copy of existingCard to avoid mutating multiple cards
        let newCard = existingCard
          ? (JSON.parse(JSON.stringify(existingCard)) as typeof existingCard)
          : undefined;

        let newId = newCard?.props.id || `ProductCard-${crypto.randomUUID()}`;

        if (newCard && inUseIds.has(newId)) {
          newId = `ProductCard-${crypto.randomUUID()}`;
          // Update the ids of the components in the child slots as well
          Object.entries(newCard.props.slots).forEach(
            ([slotKey, slotArray]) => {
              slotArray[0].props.id = newId + "-" + slotKey;
            }
          );
        }
        inUseIds.add(newId);

        if (!newCard) {
          return defaultProductCardSlotData(
            newId,
            i,
            sharedCardProps?.backgroundColor,
            sharedCardProps?.slotStyles
          );
        }

        newCard = setDeep(newCard, "props.id", newId); // update the id
        newCard = setDeep(newCard, "props.index", i); // update the index
        newCard = setDeep(newCard, "props.parentData", undefined); // set to constant values

        return newCard;
      });

      // update the  cards
      updatedData = setDeep(updatedData, "props.slots.CardSlot", newSlots);
      // update the constantValue for the sidebar
      updatedData = setDeep(
        updatedData,
        "props.data.constantValue",
        newSlots.map((card) => ({ id: card.props.id }))
      );
      return updatedData;
    }
  },
  render: (props) => <ProductCardsWrapperComponent {...props} />,
};
