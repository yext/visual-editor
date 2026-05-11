import { ProductStruct } from "../../../types/types.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { PuckComponent } from "@puckeditor/core";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { SlotMappedCardWrapperType } from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import {
  defaultProductCardSlotData,
  ProductCardProps,
} from "./ProductCard.tsx";
import { ProductSectionVariant } from "./ProductSection.tsx";
import { renderMappedEntityFieldEmptyState } from "../EntityFieldSectionEmptyState.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import { MappedEntityFieldConditionalRender } from "../entityFieldSectionUtils.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { createSlottedItemSource } from "../../../utils/itemSource/index.ts";

type ProductCardMappings = {
  image: ProductStruct["image"];
  brow: ProductStruct["brow"];
  name: ProductStruct["name"];
  price: ProductStruct["price"];
  description: ProductStruct["description"];
  cta: ProductStruct["cta"];
};

export const productCardsSource = createSlottedItemSource<
  ProductCardMappings,
  ProductCardProps
>({
  label: msg("components.products", "Products"),
  itemLabel: "Product",
  cardName: "ProductCard",
  defaultItemProps: defaultProductCardSlotData().props,
  mappingFields: {
    image: {
      type: "entityField",
      label: msg("fields.image", "Image"),
      filter: { types: ["type.image"] },
    },
    brow: {
      type: "entityField",
      label: msg("fields.browText", "Brow Text"),
      filter: { types: ["type.string", "type.rich_text_v2"] },
    },
    name: {
      type: "entityField",
      label: msg("fields.title", "Title"),
      filter: { types: ["type.string"] },
    },
    price: {
      type: "object",
      label: msg("fields.price", "Price"),
      objectFields: {
        value: {
          type: "entityField",
          label: msg("fields.value", "Value"),
          filter: { types: [] },
        },
        currencyCode: {
          type: "entityField",
          label: msg("fields.currencyCode", "Currency Code"),
          filter: { types: ["type.string"] },
        },
      },
    },
    description: {
      type: "entityField",
      label: msg("fields.description", "Description"),
      filter: { types: ["type.rich_text_v2"] },
    },
    cta: {
      type: "entityField",
      label: msg("fields.cta", "CTA"),
      filter: { types: ["type.cta"] },
    },
  },
});

export type ProductCardsWrapperProps =
  SlotMappedCardWrapperType<ProductCardMappings> & {
    styles: {
      showImage: boolean;
      showBrow: boolean;
      showTitle: boolean;
      showPrice: boolean;
      showDescription: boolean;
      showCTA: boolean;
      variant?: ProductSectionVariant;
    };

    /** @internal */
    conditionalRender?: MappedEntityFieldConditionalRender;
  };

const productCardsWrapperFields: YextFields<ProductCardsWrapperProps> = {
  data: productCardsSource.field,
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot" },
    },
    visible: false,
  },
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
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
      ...productCardsSource.defaultWrapperProps,
      styles: {
        showImage: true,
        showBrow: true,
        showTitle: true,
        showPrice: true,
        showDescription: true,
        showCTA: true,
      },
    },
    resolveData: (data, params) =>
      productCardsSource.populateSlots(data, params.metadata.streamDocument),
    render: (props) => {
      if (props.conditionalRender?.isMappedContentEmpty) {
        return renderMappedEntityFieldEmptyState(props.puck.isEditing);
      }

      return <ProductCardsWrapperComponent {...props} />;
    },
  };
