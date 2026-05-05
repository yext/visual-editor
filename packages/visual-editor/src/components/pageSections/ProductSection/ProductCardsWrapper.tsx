import { ProductSectionType, ProductStruct } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import {
  CardWrapperType,
  cardWrapperFields,
  createScopedMappingFields,
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
import {
  resolveMappedListFields,
  resolveMappedListWrapperData,
} from "../../../utils/cardSlots/mappedListWrapper.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { resolveMappedSourceField } from "../../../utils/cardSlots/mappedSource.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";

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

const createProductCardsMappingFields = (sourceFieldPath?: string) =>
  createScopedMappingFields(msg("fields.cards", "Cards"), sourceFieldPath, {
    image: {
      label: msg("fields.image", "Image"),
      types: ["type.image"],
      disableConstantValueToggle: true,
    },
    brow: {
      label: msg("fields.browText", "Brow Text"),
      types: ["type.string", "type.rich_text_v2"],
    },
    name: {
      label: msg("fields.name", "Name"),
      types: ["type.string"],
    },
    price: {
      label: msg("fields.price", "Price"),
      types: ["type.string"],
    },
    description: {
      label: msg("fields.description", "Description"),
      types: ["type.string", "type.rich_text_v2"],
    },
    cta: {
      label: msg("fields.cta", "CTA"),
      types: ["type.cta"],
    },
  });

const createProductCardsWrapperFields = (sourceFieldPath?: string) => ({
  ...cardWrapperFields<ProductCardsWrapperProps>({
    label: msg("components.products", "Products"),
    constantValueType: ComponentFields.ProductSection.type,
    listFieldName: "products",
    sourceRootKinds: ["linkedEntityRoot", "baseListRoot"],
    sourceRootsOnly: true,
    requiredDescendantTypes: [["type.string"]],
  }),
  cards: createProductCardsMappingFields(sourceFieldPath) as any,
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
});

const productCardsWrapperFields = createProductCardsWrapperFields();

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
      cards: {
        image: {
          field: "",
          constantValue: undefined,
          constantValueEnabled: false,
        },
        brow: {
          field: "",
          constantValue: { defaultValue: "" },
          constantValueEnabled: false,
        },
        name: {
          field: "",
          constantValue: { defaultValue: "" },
          constantValueEnabled: false,
        },
        price: {
          field: "",
          constantValue: "",
          constantValueEnabled: false,
        },
        description: {
          field: "",
          constantValue: { defaultValue: "" },
          constantValueEnabled: false,
        },
        cta: {
          field: "",
          constantValue: defaultProductCta,
          constantValueEnabled: false,
        },
      },
      slots: {
        CardSlot: [],
      },
    },
    resolveFields: (data) =>
      resolveMappedListFields({
        data: data as ComponentData<ProductCardsWrapperProps>,
        createFields: createProductCardsWrapperFields,
        mappingFieldName: "cards",
        createMappingFields: createProductCardsMappingFields,
      }),
    resolveData: (data, params) => {
      const locale = i18nComponentsInstance.language || "en";

      return resolveMappedListWrapperData<
        ProductCardsWrapperProps,
        ProductCardProps,
        Record<string, unknown>,
        {
          backgroundColor?: ProductCardProps["styles"]["backgroundColor"];
          slotStyles?: Record<string, any>;
        }
      >({
        data: data as ComponentData<ProductCardsWrapperProps>,
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
            field: data.props.data.field,
            product: {
              image: resolveMappedSourceField<ProductStruct["image"]>(
                item,
                data.props.cards?.image,
                locale
              ),
              brow: resolveMappedSourceField<ProductStruct["brow"]>(
                item,
                data.props.cards?.brow,
                locale
              ),
              name: resolveMappedSourceField<ProductStruct["name"]>(
                item,
                data.props.cards?.name,
                locale
              ),
              description: resolveMappedSourceField<
                ProductStruct["description"]
              >(item, data.props.cards?.description, locale),
              cta:
                resolveMappedSourceField<ProductStruct["cta"]>(
                  item,
                  data.props.cards?.cta,
                  locale
                ) ?? defaultProductCta,
            },
            priceText: resolveMappedSourceField<string>(
              item,
              data.props.cards?.price,
              locale
            ),
          } satisfies ProductCardProps["parentData"]),
      });
    },
    render: (props) => <ProductCardsWrapperComponent {...props} />,
  };
