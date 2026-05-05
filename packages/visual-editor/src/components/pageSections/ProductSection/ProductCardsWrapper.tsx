import { ProductSectionType, ProductStruct } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { ComponentData, PuckComponent } from "@puckeditor/core";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { CardWrapperType } from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import {
  defaultProductCardSlotData,
  ProductCardProps,
} from "./ProductCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { ProductSectionVariant } from "./ProductSection.tsx";
import { toPuckFields, YextComponentConfig } from "../../../fields/fields.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { createMappedItems } from "../../../utils/cardSlots/createMappedItems.ts";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";

export type ProductCardsWrapperProps = CardWrapperType<ProductSectionType> & {
  cards?: {
    image: YextEntityField<ProductStruct["image"]>;
    brow: YextEntityField<ProductStruct["brow"]>;
    name: YextEntityField<ProductStruct["name"]>;
    price: YextEntityField<string>;
    description: YextEntityField<ProductStruct["description"]>;
    cta: YextEntityField<ProductStruct["cta"]>;
  };
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

const defaultProductCta = {
  label: { defaultValue: "" },
  link: "",
  linkType: "URL",
  ctaType: "textAndLink",
} satisfies ProductStruct["cta"];

const productCardsBase = createMappedItems<ProductCardsWrapperProps>({
  sourceFieldPath: "data.field",
  mappingGroupPath: "cards",
  sourceLabel: msg("components.products", "Products"),
  mappingGroupLabel: msg("fields.cards", "Cards"),
  mappings: {
    image: {
      label: msg("fields.image", "Image"),
      types: ["type.image"],
      defaultValue: undefined,
      disableConstantValueToggle: true,
    },
    brow: {
      label: msg("fields.browText", "Brow Text"),
      types: ["type.string", "type.rich_text_v2"],
      defaultValue: { defaultValue: "" },
    },
    name: {
      label: msg("fields.name", "Name"),
      types: ["type.string"],
      defaultValue: { defaultValue: "" },
    },
    price: {
      label: msg("fields.price", "Price"),
      types: ["type.string"],
      defaultValue: "",
    },
    description: {
      label: msg("fields.description", "Description"),
      types: ["type.string", "type.rich_text_v2"],
      defaultValue: { defaultValue: "" },
    },
    cta: {
      label: msg("fields.cta", "CTA"),
      types: ["type.cta"],
      defaultValue: defaultProductCta,
    },
  },
}).withConstantValueMode({
  constantValueType: ComponentFields.ProductSection.type,
});

const productCards = productCardsBase.withRepeatedSlot({
  slotPath: "slots.CardSlot",
  createItem: (id, index, existingItem) =>
    defaultProductCardSlotData(
      id,
      index,
      existingItem?.props.styles.backgroundColor,
      existingItem ? gatherSlotStyles(existingItem.props.slots) : undefined
    ) as unknown as ComponentData<ProductCardProps>,
  getItemData: (item, resolvedData) => {
    const locale = i18nComponentsInstance.language || "en";
    const name = productCardsBase.resolveMapping<ProductStruct["name"]>(
      resolvedData.props.cards?.name,
      item,
      locale
    );

    return {
      field: resolvedData.props.data.field,
      image: productCardsBase.resolveMapping<ProductStruct["image"]>(
        resolvedData.props.cards?.image,
        item,
        locale
      ),
      brow: productCardsBase.resolveMapping<ProductStruct["brow"]>(
        resolvedData.props.cards?.brow,
        item,
        locale
      ),
      name: name ? resolveComponentData(name, locale, item) : undefined,
      description: productCardsBase.resolveMapping<
        ProductStruct["description"]
      >(resolvedData.props.cards?.description, item, locale),
      cta:
        productCardsBase.resolveMapping<ProductStruct["cta"]>(
          resolvedData.props.cards?.cta,
          item,
          locale
        ) ?? defaultProductCta,
      priceText: productCardsBase.resolveMapping<string>(
        resolvedData.props.cards?.price,
        item,
        locale
      ),
    };
  },
});

const productCardsWrapperFields = {
  ...productCards.fields,
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

const ProductCardsWrapperComponent: PuckComponent<ProductCardsWrapperProps> = ({
  slots,
}) => {
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
      ...productCards.defaultProps,
      data: productCards.defaultProps.data!,
      cards: productCards.defaultProps.cards!,
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
    resolveFields: (data) =>
      toPuckFields({
        ...productCardsWrapperFields,
        ...productCards.resolveFields(data),
      }),
    resolveData: (data, params) => productCards.resolveItems(data, params).data,
    render: (props) => <ProductCardsWrapperComponent {...props} />,
  };
