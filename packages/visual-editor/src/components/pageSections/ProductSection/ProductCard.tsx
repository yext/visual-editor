import * as React from "react";
import {
  ThemeColor,
  backgroundColors,
} from "../../../utils/themeConfigOptions.ts";
import { YextField } from "../../../editor/YextField.tsx";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { Background } from "../../atoms/background.tsx";
import { CTAWrapperProps } from "../../contentBlocks/CtaWrapper.tsx";
import { BodyTextProps } from "../../contentBlocks/BodyText.tsx";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { ImageWrapperProps } from "../../contentBlocks/image/Image.tsx";
import { ProductStruct } from "../../../types/types.ts";
import { deepMerge } from "../../../utils/themeResolver.ts";
import { getDefaultRTF } from "../../../editor/TranslatableRichTextField.tsx";
import { ImgSizesByBreakpoint } from "../../atoms/image.tsx";
import { themeManagerCn } from "../../../utils/cn.ts";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { PuckComponent, setDeep, Slot, WithId } from "@puckeditor/core";
import { useCardContext } from "../../../hooks/useCardContext.tsx";
import { useGetCardSlots } from "../../../hooks/useGetCardSlots.tsx";
import { getRandomPlaceholderImageObject } from "../../../utils/imagePlaceholders.ts";
import { TextProps } from "../../contentBlocks/Text.tsx";
import { ProductSectionVariant } from "./ProductSection.tsx";
import { syncParentStyles } from "../../../utils/cardSlots/syncParentStyles.ts";
import { shouldRenderToggledField } from "../../../utils/cardSlots/fieldVisibility.ts";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import {
  formatCurrency,
  isCompleteProductPrice,
  isInvalidProductPrice,
} from "../../../utils/productPrice.ts";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";

/**
 * Default product-shaped data used to keep placeholder content aligned with
 * the ProductStruct type.
 */
const defaultProductData = {
  image: {
    url: "https://placehold.co/640x360",
    height: 360,
    width: 640,
  },
  brow: { defaultValue: "Category" },
  name: { defaultValue: "Product Name" },
  price: {
    value: 123,
    currencyCode: "USD",
  },
  description: {
    defaultValue: getDefaultRTF(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    ),
  },
  cta: {
    label: { defaultValue: "Learn More" },
    link: "#",
    linkType: "URL" as const,
    ctaType: "textAndLink" as const,
  },
} satisfies ProductStruct;

const slotDefaultData = {
  priceText: { defaultValue: "$123.00" },
};

export const defaultProductCardSlotData = (
  id?: string,
  index?: number,
  backgroundColor?: ThemeColor,
  sharedSlotStyles?: Record<string, any>
) => {
  const cardData = {
    type: "ProductCard",
    props: {
      ...(id && { id }),
      ...(index !== undefined && { index }),
      styles: {
        backgroundColor: backgroundColor ?? backgroundColors.background1.value,
      } satisfies ProductCardProps["styles"],
      slots: {
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              ...(id && { id: `${id}-image` }),
              data: {
                image: {
                  field: "",
                  constantValue: {
                    ...getRandomPlaceholderImageObject({
                      width: 640,
                      height: 360,
                    }),
                    width: 640,
                    height: 360,
                  },
                  constantValueEnabled: true,
                },
              },
              styles: {
                aspectRatio: 1.78,
                width: 640,
                imageConstrain: "fill",
              },
            } satisfies ImageWrapperProps,
          },
        ],
        BrowSlot: [
          {
            type: "TextSlot",
            props: {
              ...(id && { id: `${id}-brow` }),
              data: {
                text: {
                  field: "",
                  constantValue: defaultProductData.brow,
                  constantValueEnabled: true,
                },
              },
              styles: {
                variant: "sm",
                fontStyle: "bold",
              },
            } satisfies TextProps,
          },
        ],
        TitleSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              ...(id && { id: `${id}-title` }),
              data: {
                text: {
                  field: "",
                  constantValue: defaultProductData.name,
                  constantValueEnabled: true,
                },
              },
              styles: {
                level: 3,
                align: "left",
              },
            } satisfies HeadingTextProps,
          },
        ],
        PriceSlot: [
          {
            type: "TextSlot",
            props: {
              ...(id && { id: `${id}-price` }),
              data: {
                text: {
                  field: "",
                  constantValue: slotDefaultData.priceText,
                  constantValueEnabled: true,
                },
              },
              styles: {
                variant: "base",
                fontStyle: "bold",
              },
            } satisfies TextProps,
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              ...(id && { id: `${id}-description` }),
              data: {
                text: {
                  field: "",
                  constantValue: defaultProductData.description,
                  constantValueEnabled: true,
                },
              },
              styles: {
                variant: "base",
              },
            } satisfies BodyTextProps,
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              ...(id && { id: `${id}-cta` }),
              data: {
                actionType: "link",
                normalizeLink: true,
                buttonText: { defaultValue: "Button" },
                entityField: {
                  field: "",
                  constantValue: defaultProductData.cta,
                  constantValueEnabled: true,
                },
              },
              styles: {
                variant: "secondary",
                presetImage: "app-store",
              },
            } satisfies CTAWrapperProps,
          },
        ],
      },
    } satisfies ProductCardProps,
  };

  Object.entries(cardData.props.slots).forEach(([slotKey, slotArray]) => {
    if (sharedSlotStyles?.[slotKey]) {
      slotArray[0].props.styles = sharedSlotStyles[slotKey];
    }
  });

  return cardData;
};

export type ProductCardProps = {
  styles: {
    /** The background color of each individual card
     * @defaultValue Background Color 1
     */
    backgroundColor?: ThemeColor;
  };

  /** @internal */
  slots: {
    ImageSlot: Slot;
    BrowSlot: Slot;
    TitleSlot: Slot;
    PriceSlot: Slot;
    DescriptionSlot: Slot;
    CTASlot: Slot;
  };

  /** @internal */
  parentData?: {
    field: string;
    product: ProductStruct;
    priceText?: string;
  };

  /** @internal */
  parentStyles?: {
    variant: ProductSectionVariant;
    showImage: boolean;
    showBrow: boolean;
    showTitle: boolean;
    showPrice: boolean;
    showDescription: boolean;
    showCTA: boolean;
  };

  /** @internal */
  conditionalRender?: {
    image?: boolean;
    title?: boolean;
    price?: boolean;
    brow?: boolean;
    description?: boolean;
    cta?: boolean;
  };

  /** @internal */
  imageStyles?: {
    aspectRatio?: number;
    width?: number;
  };

  /** @internal */
  index?: number;
};

const ProductCardFields: YextFields<ProductCardProps> = {
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: {
        type: "basicSelector",
        label: msg("fields.backgroundColor", "Background Color"),
        options: "BACKGROUND_COLOR",
      },
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      ImageSlot: { type: "slot" },
      BrowSlot: { type: "slot" },
      TitleSlot: { type: "slot" },
      PriceSlot: { type: "slot" },
      DescriptionSlot: { type: "slot" },
      CTASlot: { type: "slot" },
    },
    visible: false,
  },
};

const ProductCardComponent: PuckComponent<ProductCardProps> = (props) => {
  const { styles, puck, conditionalRender, slots, parentStyles } = props;
  const { sharedCardProps, setSharedCardProps } = useCardContext<{
    cardBackground: ThemeColor | undefined;
    slotStyles: Record<string, ProductCardProps["styles"]>;
  }>();

  const variant = props.parentStyles?.variant ?? "immersive";

  const { slotStyles, getPuck, slotProps } = useGetCardSlots<ProductCardProps>(
    props.id
  );

  // sharedCardProps useEffect
  // When the context changes, dispatch an update to sync the changes to puck
  React.useEffect(() => {
    if (!puck.isEditing || !sharedCardProps || !getPuck) {
      return;
    }

    if (
      JSON.stringify(sharedCardProps?.cardBackground) ===
        JSON.stringify(styles.backgroundColor) &&
      JSON.stringify(slotStyles) === JSON.stringify(sharedCardProps?.slotStyles)
    ) {
      return;
    }

    const { dispatch, getSelectorForId } = getPuck();
    const selector = getSelectorForId(props.id);
    if (!selector || !slotProps) {
      return;
    }

    const newSlotData: ProductCardProps["slots"] = {
      ImageSlot: [],
      BrowSlot: [],
      TitleSlot: [],
      PriceSlot: [],
      DescriptionSlot: [],
      CTASlot: [],
    };
    Object.entries(slotProps).forEach(([key, value]) => {
      newSlotData[key as keyof ProductCardProps["slots"]] = [
        {
          ...deepMerge(
            { props: { styles: { ...sharedCardProps?.slotStyles?.[key] } } },
            value[0]
          ),
        },
      ];
    });

    // oxlint-disable-next-line no-unused-vars: remove props.puck before dispatching to avoid writing it to the saved data
    const { puck: _, editMode: __, ...otherProps } = props;
    dispatch({
      type: "replace" as const,
      destinationIndex: selector.index,
      destinationZone: selector.zone,
      data: {
        type: "ProductCard",
        props: {
          ...otherProps,
          styles: {
            ...otherProps.styles,
            backgroundColor:
              sharedCardProps?.cardBackground ||
              backgroundColors.background1.value,
          },
          slots: newSlotData,
        } satisfies ProductCardProps,
      },
    });
  }, [sharedCardProps]);

  // styles and slotStyles useEffect
  // When the card's shared props or the card's slots' shared props change, update the context
  React.useEffect(() => {
    if (!puck.isEditing || !slotProps) {
      return;
    }

    if (
      JSON.stringify(sharedCardProps?.cardBackground) ===
        JSON.stringify(styles.backgroundColor) &&
      JSON.stringify(sharedCardProps?.slotStyles) === JSON.stringify(slotStyles)
    ) {
      return;
    }

    setSharedCardProps({
      cardBackground: styles.backgroundColor,
      slotStyles: slotStyles,
    });
  }, [styles, slotStyles]);

  const hasPrice = shouldRenderToggledField({
    isEditing: puck.isEditing,
    isEnabled: parentStyles?.showPrice,
    hasData: !!conditionalRender?.price,
  });
  const hasDescription = shouldRenderToggledField({
    isEditing: puck.isEditing,
    isEnabled: parentStyles?.showDescription,
    hasData: !!conditionalRender?.description,
  });
  const hasCTA = shouldRenderToggledField({
    isEditing: puck.isEditing,
    isEnabled: parentStyles?.showCTA,
    hasData: !!conditionalRender?.cta,
  });
  const hasBrow = shouldRenderToggledField({
    isEditing: puck.isEditing,
    isEnabled: parentStyles?.showBrow,
    hasData: !!conditionalRender?.brow,
  });
  const hasImage = shouldRenderToggledField({
    isEditing: puck.isEditing,
    isEnabled: parentStyles?.showImage,
    hasData: !!conditionalRender?.image,
  });
  const hasTitle = shouldRenderToggledField({
    isEditing: puck.isEditing,
    isEnabled: parentStyles?.showTitle,
    hasData: !!conditionalRender?.title,
  });
  const bottomPadding = hasCTA ? "pb-8" : "pb-4";

  return (
    <Background
      className={themeManagerCn(
        "flex flex-col h-full",
        variant !== "minimal" && "rounded-lg overflow-hidden border"
      )}
      background={variant === "minimal" ? undefined : styles.backgroundColor}
      ref={puck.dragRef}
    >
      {hasImage && (
        <div className={variant === "classic" ? "px-8 pt-8" : ""}>
          <div className={"w-full"}>
            <slots.ImageSlot style={{ height: "fit-content" }} allow={[]} />
          </div>
        </div>
      )}
      <div
        className={themeManagerCn(
          "flex flex-col flex-grow gap-4 pt-4",
          variant !== "minimal" && bottomPadding,
          variant !== "minimal" && "px-8"
        )}
      >
        <div className="gap-4 flex flex-col flex-grow">
          {(hasBrow || hasTitle) && (
            <div className="flex flex-col">
              {hasBrow && (
                <slots.BrowSlot style={{ height: "auto" }} allow={[]} />
              )}

              {hasTitle && (
                <slots.TitleSlot style={{ height: "auto" }} allow={[]} />
              )}
            </div>
          )}
          {hasPrice && (
            <div className="flex gap-4 border-l-2 border-primary-200 pl-4 items-center">
              <slots.PriceSlot style={{ height: "auto" }} allow={[]} />
            </div>
          )}

          {hasDescription && (
            <slots.DescriptionSlot style={{ height: "auto" }} allow={[]} />
          )}
        </div>
        {hasCTA && <slots.CTASlot style={{ height: "auto" }} allow={[]} />}
      </div>
    </Background>
  );
};

export const ProductCard: YextComponentConfig<ProductCardProps> = {
  label: msg("slots.productCard", "Product Card"),
  fields: ProductCardFields,
  inline: true,
  resolveData: (data, params) => {
    const locale = i18nComponentsInstance.language || "en";
    const priceSlotProps = data.props.slots.PriceSlot?.[0]?.props as
      | WithId<TextProps>
      | undefined;
    const priceEntityField = priceSlotProps?.data?.text as
      | YextEntityField<ProductStruct["price"]>
      | undefined;
    const entityPrice =
      data.props.parentData?.product.price ??
      (priceEntityField
        ? resolveYextEntityField<ProductStruct["price"]>(
            params.metadata.streamDocument,
            priceEntityField,
            locale
          )
        : undefined);

    const resolvedPriceFromEntity = formatCurrency(
      entityPrice?.value,
      entityPrice?.currencyCode,
      locale
    );
    const mappedPriceText = data.props.parentData?.priceText;
    const fallbackPriceCandidate = priceSlotProps
      ? resolveYextEntityField(
          params.metadata.streamDocument,
          priceSlotProps?.data?.text,
          locale
        )
      : undefined;
    const resolvedFallbackPrice = !fallbackPriceCandidate
      ? fallbackPriceCandidate
      : isCompleteProductPrice(fallbackPriceCandidate, locale)
        ? formatCurrency(
            fallbackPriceCandidate.value,
            fallbackPriceCandidate.currencyCode,
            locale
          )
        : isInvalidProductPrice(fallbackPriceCandidate, locale)
          ? undefined
          : resolveComponentData(
              fallbackPriceCandidate,
              locale,
              params.metadata.streamDocument,
              { output: "plainText" }
            );
    const resolvedPrice = resolvedPriceFromEntity
      ? resolvedPriceFromEntity
      : mappedPriceText
        ? mappedPriceText
        : resolvedFallbackPrice;
    const showPrice = Boolean(resolvedPrice);

    const imageSlotProps = data.props.slots.ImageSlot?.[0]?.props as
      | (WithId<ImageWrapperProps> & {
          styles?: { aspectRatio?: number; width?: number };
        })
      | undefined;
    const resolvedImage =
      data.props.parentData?.product.image ??
      imageSlotProps?.parentData?.image ??
      (imageSlotProps
        ? resolveYextEntityField(
            params.metadata.streamDocument,
            imageSlotProps?.data?.image,
            locale
          )
        : undefined);
    const showImage = Boolean(resolvedImage);

    const titleSlotProps = data.props.slots.TitleSlot?.[0]?.props as
      | WithId<HeadingTextProps>
      | undefined;
    const resolvedTitle =
      data.props.parentData?.product.name ??
      titleSlotProps?.parentData?.text ??
      (titleSlotProps
        ? resolveYextEntityField(
            params.metadata.streamDocument,
            titleSlotProps?.data?.text,
            locale
          )
        : undefined);
    const showTitle = Boolean(
      resolveComponentData(
        resolvedTitle,
        locale,
        params.metadata.streamDocument,
        { output: "plainText" }
      )
    );

    const browSlotProps = data.props.slots.BrowSlot?.[0]?.props as
      | WithId<TextProps>
      | undefined;

    const resolvedBrow =
      data.props.parentData?.product.brow ??
      browSlotProps?.parentData?.text ??
      (browSlotProps
        ? resolveYextEntityField(
            params.metadata.streamDocument,
            browSlotProps?.data?.text,
            locale
          )
        : undefined);
    const showBrow = Boolean(resolvedBrow);

    const descriptionSlotProps = data.props.slots.DescriptionSlot?.[0]
      ?.props as WithId<BodyTextProps> | undefined;

    const resolvedDescription =
      data.props.parentData?.product.description ??
      descriptionSlotProps?.parentData?.richText ??
      (descriptionSlotProps
        ? resolveYextEntityField(
            params.metadata.streamDocument,
            descriptionSlotProps?.data?.text,
            locale
          )
        : undefined);
    const showDescription = Boolean(resolvedDescription);

    const ctaSlotProps = data.props.slots.CTASlot?.[0]?.props as
      | WithId<CTAWrapperProps>
      | undefined;
    const resolvedCTA = data.props.parentData
      ? (data.props.parentData.product.cta ?? ctaSlotProps?.parentData?.cta)
      : (ctaSlotProps?.parentData?.cta ??
        (ctaSlotProps
          ? resolveYextEntityField(
              params.metadata.streamDocument,
              ctaSlotProps?.data?.entityField,
              locale
            )
          : undefined));
    const showCTA = Boolean(resolvedCTA);

    let updatedData = {
      ...data,
      props: {
        ...data.props,
        conditionalRender: {
          image: showImage,
          title: showTitle,
          price: showPrice,
          brow: showBrow,
          description: showDescription,
          cta: showCTA,
        },
        imageStyles: {
          aspectRatio: imageSlotProps?.styles?.aspectRatio,
          width: imageSlotProps?.styles?.width,
        },
      } satisfies ProductCardProps,
    };

    updatedData = syncParentStyles(params, updatedData, [
      "variant",
      "showImage",
      "showBrow",
      "showTitle",
      "showPrice",
      "showDescription",
      "showCTA",
    ]);

    // Set the image's sizes attribute
    updatedData = setDeep(updatedData, "props.slots.ImageSlot[0].props.sizes", {
      base: "calc(100vw - 32px)",
      md: "calc((maxWidth - 32px) / 2)",
      lg: "calc((maxWidth - 32px) / 3)",
    } satisfies ImgSizesByBreakpoint);

    // Set the CTA's event name
    updatedData = setDeep(
      updatedData,
      "props.slots.CTASlot[0].props.eventName",
      `cta${data.props.index}`
    );

    if (data.props.parentData) {
      const product = data.props.parentData.product;
      const field = data.props.parentData.field;
      const formattedPrice = formatCurrency(
        product.price?.value,
        product.price?.currencyCode,
        locale
      );
      const priceText = formattedPrice ?? data.props.parentData.priceText;

      updatedData = setDeep(
        updatedData,
        "props.slots.ImageSlot[0].props.parentData",
        {
          field: field,
          image: product.image,
        } satisfies ImageWrapperProps["parentData"]
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.TitleSlot[0].props.parentData",
        {
          field: field,
          text: product.name as string, // will already be resolved
        } satisfies HeadingTextProps["parentData"]
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.BrowSlot[0].props.parentData",
        {
          field: field,
          text: product.brow ?? product.category, // will already be resolved
        } satisfies TextProps["parentData"]
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.PriceSlot[0].props.parentData",
        priceText
          ? ({
              field: field,
              text: priceText,
            } satisfies TextProps["parentData"])
          : undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.DescriptionSlot[0].props.parentData",
        {
          field: field,
          richText: product.description,
        } satisfies BodyTextProps["parentData"]
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.CTASlot[0].props.parentData",
        {
          field: field,
          cta: product.cta,
        } satisfies CTAWrapperProps["parentData"]
      );

      return updatedData;
    } else {
      updatedData = setDeep(
        updatedData,
        "props.slots.ImageSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.TitleSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.BrowSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.PriceSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.DescriptionSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.CTASlot[0].props.parentData",
        undefined
      );
    }

    return updatedData;
  },
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    slots: {
      ImageSlot: [],
      BrowSlot: [],
      TitleSlot: [],
      PriceSlot: [],
      DescriptionSlot: [],
      CTASlot: [],
    },
  },
  render: (props) => <ProductCardComponent {...props} />,
};
