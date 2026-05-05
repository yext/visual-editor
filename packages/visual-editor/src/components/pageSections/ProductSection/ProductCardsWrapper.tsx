import { ProductSectionType, ProductStruct } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
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
import { toPuckFields, YextComponentConfig } from "../../../fields/fields.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { resolveMappedListWrapperData } from "../../../utils/cardSlots/mappedListWrapper.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { createMappedItemsConfig } from "../../../utils/cardSlots/createMappedItemsConfig.ts";

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

const productCards = createMappedItemsConfig<ProductCardsWrapperProps>({
  sourceFieldPath: "data.field",
  mappingGroupPath: "cards",
  sourceLabel: msg("components.products", "Products"),
  mappingGroupLabel: msg("fields.cards", "Cards"),
  constantValueType: ComponentFields.ProductSection.type,
  listFieldName: "products",
  sourceRootKinds: ["linkedEntityRoot", "baseListRoot"],
  sourceRootsOnly: true,
  requiredDescendantTypes: [["type.string"]],
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
    fields: productCardsWrapperFields as any,
    defaultProps: {
      ...(productCards.defaultProps as Pick<
        ProductCardsWrapperProps,
        "data" | "cards"
      >),
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
        ...(productCards.resolveFields(
          data as ComponentData<ProductCardsWrapperProps>
        ) as any),
      }),
    resolveData: (data, params) => {
      const locale = i18nComponentsInstance.language || "en";
      const { data: nextData } = productCards.resolve(
        data as ComponentData<ProductCardsWrapperProps>,
        params
      );

      return resolveMappedListWrapperData<
        ProductCardsWrapperProps,
        ProductCardProps,
        Record<string, unknown>,
        {
          backgroundColor?: ProductCardProps["styles"]["backgroundColor"];
          slotStyles?: Record<string, any>;
        }
      >({
        data: nextData,
        streamDocument: params.metadata.streamDocument ?? {},
        cardIdPrefix: "ProductCard",
        getSharedCardProps: (card) =>
          !card
            ? undefined
            : {
                backgroundColor: card.props.styles.backgroundColor,
                slotStyles: gatherSlotStyles(card.props.slots),
              },
        createCard: (id, index, sharedCardProps) =>
          defaultProductCardSlotData(
            id,
            index,
            sharedCardProps?.backgroundColor,
            sharedCardProps?.slotStyles
          ) as ComponentData<ProductCardProps>,
        decorateMappedItemCard: (card, item, index) =>
          setDeep(setDeep(card, "props.index", index), "props.parentData", {
            field: nextData.props.data.field,
            product: {
              image: productCards.resolveMapping<ProductStruct["image"]>(
                nextData.props.cards?.image,
                item,
                locale
              ),
              brow: productCards.resolveMapping<ProductStruct["brow"]>(
                nextData.props.cards?.brow,
                item,
                locale
              ),
              name: productCards.resolveMapping<ProductStruct["name"]>(
                nextData.props.cards?.name,
                item,
                locale
              ),
              description: productCards.resolveMapping<
                ProductStruct["description"]
              >(nextData.props.cards?.description, item, locale),
              cta:
                productCards.resolveMapping<ProductStruct["cta"]>(
                  nextData.props.cards?.cta,
                  item,
                  locale
                ) ?? defaultProductCta,
            },
            priceText: productCards.resolveMapping<string>(
              nextData.props.cards?.price,
              item,
              locale
            ),
          } satisfies ProductCardProps["parentData"]),
      });
    },
    render: (props) => <ProductCardsWrapperComponent {...props} />,
  };
