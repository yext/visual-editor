import {
  type ComponentData,
  PuckComponent,
  type Slot,
  setDeep,
} from "@puckeditor/core";
import { type ProductStruct } from "../../../types/types.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import {
  ProductCard,
  defaultProductCardItemData,
  defaultProductCardSlotData,
  type ProductCardProps,
} from "./ProductCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import {
  toPuckFields,
  type YextComponentConfig,
  type YextFields,
} from "../../../fields/fields.ts";
import { type ItemSourceValue } from "../../../fields/ItemSourceField.tsx";
import { ProductSectionVariant } from "./ProductSection.tsx";
import { renderMappedEntityFieldEmptyState } from "../EntityFieldSectionEmptyState.tsx";
import {
  MappedEntityFieldConditionalRender,
  withMappedEntityFieldConditionalRender,
} from "../entityFieldSectionUtils.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { type YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { type StreamDocument, createItemSource } from "../../../utils/index.ts";
import { buildListSectionCards } from "../../../utils/cardSlots/listSectionData.ts";

type ProductCardItem = {
  image: YextEntityField<ProductStruct["image"]>;
  brow: YextEntityField<ProductStruct["brow"]>;
  name: YextEntityField<ProductStruct["name"]>;
  price: YextEntityField<ProductStruct["price"] | string>;
  description: YextEntityField<ProductStruct["description"]>;
  cta: YextEntityField<ProductStruct["cta"]>;
};

export type ProductCardsWrapperProps = {
  data: ItemSourceValue<ProductCardItem>;
  cards?: ProductCardItem;
  styles: {
    showImage: boolean;
    showBrow: boolean;
    showTitle: boolean;
    showPrice: boolean;
    showDescription: boolean;
    showCTA: boolean;
    variant?: ProductSectionVariant;
  };
  slots: {
    CardSlot: Slot;
  };
  conditionalRender?: MappedEntityFieldConditionalRender;
};

const defaultProductCta = {
  label: { defaultValue: "" },
  link: "",
  linkType: "URL",
  ctaType: "textAndLink",
} satisfies ProductStruct["cta"];

const productCards = createItemSource<
  ProductCardsWrapperProps,
  ProductCardItem
>({
  itemSourcePath: "data",
  itemMappingsPath: "cards",
  itemSourceLabel: msg("components.products", "Products"),
  itemMappingsLabel: msg("fields.cards", "Cards"),
  itemFields: {
    image: {
      type: "entityField",
      label: msg("fields.image", "Image"),
      disableConstantValueToggle: true,
      filter: {
        types: ["type.image"],
      },
    },
    brow: {
      type: "entityField",
      label: msg("fields.browText", "Brow Text"),
      filter: {
        types: ["type.string", "type.rich_text_v2"],
      },
    },
    name: {
      type: "entityField",
      label: msg("fields.name", "Name"),
      filter: {
        types: ["type.string"],
      },
    },
    price: {
      type: "entityField",
      label: msg("fields.price", "Price"),
      filter: {
        types: ["type.price"],
      },
    },
    description: {
      type: "entityField",
      label: msg("fields.description", "Description"),
      filter: {
        types: ["type.string", "type.rich_text_v2"],
      },
    },
    cta: {
      type: "entityField",
      label: msg("fields.cta", "CTA"),
      filter: {
        types: ["type.cta"],
      },
    },
  },
});

const productCardsWrapperFields: YextFields<ProductCardsWrapperProps> = {
  ...productCards.fields,
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
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
};

const createProductCard = (
  currentCards: ComponentData<ProductCardProps>[]
): ComponentData<ProductCardProps> => {
  const existingCard = currentCards[0];

  return defaultProductCardSlotData(
    `ProductCard-${crypto.randomUUID()}`,
    undefined,
    existingCard?.props.styles.backgroundColor,
    existingCard ? gatherSlotStyles(existingCard.props.slots) : undefined
  ) as unknown as ComponentData<ProductCardProps>;
};

const syncCards = <TData extends { props: ProductCardsWrapperProps }>(
  data: TData,
  items: Record<string, unknown>[],
  resolveCard: (
    card: ComponentData<ProductCardProps>
  ) => ComponentData<ProductCardProps>
): TData => {
  const currentCards =
    (data.props.slots
      .CardSlot as unknown as ComponentData<ProductCardProps>[]) ?? [];

  return setDeep(
    data,
    "props.slots.CardSlot",
    buildListSectionCards<ProductCardProps, Record<string, unknown>>({
      currentCards,
      items,
      createCard: () => createProductCard(currentCards),
      decorateCard: (card, item, index) => ({
        ...card,
        props: {
          ...card.props,
          index,
          itemData: {
            field: data.props.data.field,
            image: item.image as ProductStruct["image"],
            brow: item.brow as ProductStruct["brow"],
            name: item.name as ProductStruct["name"],
            description: item.description as ProductStruct["description"],
            cta:
              (item.cta as ProductStruct["cta"] | undefined) ??
              defaultProductCta,
            price:
              typeof item.price === "object"
                ? (item.price as ProductStruct["price"])
                : undefined,
            priceText: typeof item.price === "string" ? item.price : undefined,
          },
        },
      }),
      finalizeCard: resolveCard,
    })
  ) as TData;
};

const ProductCardsWrapperComponent: PuckComponent<ProductCardsWrapperProps> = ({
  slots,
}) => (
  <CardContextProvider>
    <slots.CardSlot
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 align-stretch"
      allow={[]}
    />
  </CardContextProvider>
);

export const ProductCardsWrapper: YextComponentConfig<ProductCardsWrapperProps> =
  {
    label: msg("slots.productCards", "Product Cards"),
    fields: productCardsWrapperFields,
    defaultProps: {
      ...productCards.defaultProps,
      data: {
        ...productCards.defaultProps.data!,
        constantValue: Array.from(
          { length: 3 },
          () =>
            JSON.parse(
              JSON.stringify(defaultProductCardItemData)
            ) as ProductCardItem
        ),
      },
      cards: {
        ...(productCards.defaultProps.cards as ProductCardItem),
        cta: {
          field: "",
          constantValueEnabled: false,
          constantValue: defaultProductCta,
        },
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
    resolveFields: (data) =>
      toPuckFields({
        ...productCardsWrapperFields,
        ...productCards.resolveFields(data),
      }),
    resolveData: (data, params) => {
      const normalizedData = productCards.normalizeData(data, params);
      const items = productCards.resolveItems(
        normalizedData.props.data,
        normalizedData.props.cards,
        (params.metadata?.streamDocument ?? {}) as StreamDocument
      );

      return withMappedEntityFieldConditionalRender(
        syncCards(
          normalizedData,
          items,
          (card) =>
            (ProductCard.resolveData?.(card as any, params as any) ??
              card) as ComponentData<ProductCardProps>
        ),
        !normalizedData.props.data.constantValueEnabled &&
          Boolean(normalizedData.props.data.field) &&
          items.length === 0
      );
    },
    render: (props) =>
      props.conditionalRender?.isMappedContentEmpty ? (
        renderMappedEntityFieldEmptyState(props.puck.isEditing)
      ) : (
        <ProductCardsWrapperComponent {...props} />
      ),
  };
