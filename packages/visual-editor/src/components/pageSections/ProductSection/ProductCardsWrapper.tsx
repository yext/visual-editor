import * as React from "react";
import { ProductSectionType, ProductStruct } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { CardWrapperType } from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import {
  defaultProductCardSlotData,
  ProductCardProps,
} from "./ProductCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { ProductSectionVariant } from "./ProductSection.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import {
  createListSourceField,
  type ListSourceFieldValue,
} from "../../../editor/ListSourceField.tsx";
import { PRODUCT_SECTION_CONSTANT_CONFIG } from "../../../internal/puck/constant-value-fields/ProductSection.tsx";
import {
  buildListSectionCards,
  resolveListSectionItems,
} from "../../../utils/cardSlots/listSectionData.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";

export type ProductCardsWrapperProps = Omit<
  CardWrapperType<ProductSectionType>,
  "data"
> & {
  data: ListSourceFieldValue;
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

const productCardsWrapperFields: YextFields<ProductCardsWrapperProps> = {
  data: createListSourceField({
    label: msg("components.products", "Products"),
    legacySourceFilter: {
      types: [ComponentFields.ProductSection.type],
    },
    constantField: PRODUCT_SECTION_CONSTANT_CONFIG,
    mappingConfigs: [
      {
        key: "image",
        label: msg("fields.options.image", "Image"),
        preferredFieldNames: ["image", "c_coverPhoto"],
        required: false,
        types: ["type.image"],
      },
      {
        key: "brow",
        label: msg("fields.showBrow", "Brow"),
        preferredFieldNames: ["brow", "category", "c_productPromo"],
        required: false,
        types: ["type.string", "type.rich_text_v2"],
      },
      {
        key: "name",
        label: msg("fields.showTitle", "Title"),
        preferredFieldNames: ["name"],
        types: ["type.string"],
      },
      {
        key: "price",
        label: msg("fields.showPrice", "Price"),
        preferredFieldNames: ["price"],
        required: false,
        types: ["type.string", "type.rich_text_v2"],
      },
      {
        key: "description",
        label: msg("fields.showDescription", "Description"),
        preferredFieldNames: ["description", "c_description"],
        required: false,
        types: ["type.rich_text_v2"],
      },
      {
        key: "cta",
        label: msg("fields.showCTA", "CTA"),
        preferredFieldNames: ["cta", "c_productCTA"],
        required: false,
        types: ["type.cta"],
      },
      {
        key: "category",
        label: msg("fields.showCategory", "Category"),
        preferredFieldNames: ["category"],
        required: false,
        types: ["type.string", "type.rich_text_v2"],
      },
    ],
  }),
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
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
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
      if (!streamDocument) {
        return data;
      }
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
        const { items: resolvedProducts, requiredLength } =
          resolveListSectionItems<ProductStruct>({
            buildMappedItem: (resolvedItemFields) => ({
              image: resolvedItemFields.image as ProductStruct["image"],
              brow: resolvedItemFields.brow as ProductStruct["brow"],
              name:
                typeof resolvedItemFields.name === "string"
                  ? resolvedItemFields.name
                  : undefined,
              price: resolvedItemFields.price as ProductStruct["price"],
              description:
                resolvedItemFields.description as ProductStruct["description"],
              cta: resolvedItemFields.cta as ProductStruct["cta"],
              category:
                resolvedItemFields.category as ProductStruct["category"],
            }),
            data: data.props.data,
            isValidItem: (product) => Boolean(product.name),
            resolveLegacyItems: () =>
              resolveYextEntityField<Partial<ProductSectionType>>(
                streamDocument,
                {
                  ...data.props.data,
                  constantValue: { products: undefined },
                },
                i18nComponentsInstance.language || "en"
              )?.products,
            streamDocument,
          });

        if (!requiredLength || !resolvedProducts) {
          return setDeep(data, "props.slots.CardSlot", []);
        }

        return setDeep(
          data,
          "props.slots.CardSlot",
          buildListSectionCards<ProductCardProps, ProductStruct>({
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
                product: product,
              } satisfies ProductCardProps["parentData"]) as ComponentData<ProductCardProps>,
            items: resolvedProducts,
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
