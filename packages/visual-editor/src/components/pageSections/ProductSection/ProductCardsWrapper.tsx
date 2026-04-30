import * as React from "react";
import { ProductSectionType } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
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
import { YextField } from "../../../editor/YextField.tsx";
import { ProductSectionVariant } from "./ProductSection.tsx";
import { YextComponentConfig } from "../../../fields/fields.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { buildListSectionCards } from "../../../utils/cardSlots/listSectionData.ts";
import { syncManualListCards } from "../../../utils/cardSlots/mappedListWrapper.ts";

export type ProductCardsWrapperProps = CardWrapperType<ProductSectionType> & {
  styles: {
    showImage: boolean;
    showBrow: boolean;
    showTitle: boolean;
    showPrice: boolean;
    showDescription: boolean;
    showCTA: boolean;

    variant?: ProductSectionVariant;
  };
};

const productCardsWrapperFields = {
  ...cardWrapperFields<ProductCardsWrapperProps>(
    msg("components.products", "Products"),
    ComponentFields.ProductSection.type
  ),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      showImage: {
        label: msg("fields.showImage", "Show Image"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showBrow: {
        label: msg("fields.showBrow", "Show Brow Text"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showTitle: {
        label: msg("fields.showTitle", "Show Title"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showPrice: {
        label: msg("fields.showPrice", "Show Price"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showDescription: {
        label: msg("fields.showDescription", "Show Description"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showCTA: {
        label: msg("fields.showCTA", "Show CTA"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
    },
  }),
};

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

export const ProductCardsWrapper: YextComponentConfig<ProductCardsWrapperProps> =
  {
    label: msg("slots.productCards", "Product Cards"),
    fields: productCardsWrapperFields,
    defaultProps: {
      data: {
        field: "",
        constantValueEnabled: true,
        constantValue: [],
      },
      styles: {
        showImage: true,
        showBrow: true,
        showTitle: true,
        showPrice: true,
        showDescription: true,
        showCTA: true,
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

        return setDeep(
          data,
          "props.slots.CardSlot",
          buildListSectionCards<
            ProductCardProps,
            ProductSectionType["products"][number]
          >({
            currentCards: data.props.slots
              .CardSlot as ComponentData<ProductCardProps>[],
            createCard: () =>
              defaultProductCardSlotData(
                `ProductCard-${crypto.randomUUID()}`,
                undefined,
                sharedCardProps?.backgroundColor,
                sharedCardProps?.slotStyles
              ) as ComponentData<ProductCardProps>,
            decorateCard: (card, product, index) =>
              setDeep(setDeep(card, "props.index", index), "props.parentData", {
                field: data.props.data.field,
                product,
              } satisfies ProductCardProps["parentData"]),
            items: resolvedProducts,
          })
        );
      } else {
        const syncedCards = syncManualListCards<ProductCardProps>({
          currentCards: data.props.slots
            .CardSlot as ComponentData<ProductCardProps>[],
          constantValue: data.props.data.constantValue,
          createId: () => `ProductCard-${crypto.randomUUID()}`,
          createCard: (id, index) =>
            defaultProductCardSlotData(
              id,
              index,
              sharedCardProps?.backgroundColor,
              sharedCardProps?.slotStyles
            ) as ComponentData<ProductCardProps>,
          rewriteChildSlotIds: (card, newId) => {
            Object.entries(card.props.slots).forEach(([slotKey, slotArray]) => {
              slotArray[0].props.id = `${newId}-${slotKey}`;
            });
          },
        });
        return setDeep(
          setDeep(data, "props.slots.CardSlot", syncedCards.slots),
          "props.data.constantValue",
          syncedCards.constantValue
        );
      }
    },
    render: (props) => <ProductCardsWrapperComponent {...props} />,
  };
