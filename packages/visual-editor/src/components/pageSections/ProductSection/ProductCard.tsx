import * as React from "react";
import {
  BackgroundStyle,
  YextField,
  backgroundColors,
  msg,
  Background,
  CTAWrapperProps,
  BodyTextProps,
  HeadingTextProps,
  ImageWrapperProps,
  ProductStruct,
  deepMerge,
  getDefaultRTF,
  ImgSizesByBreakpoint,
} from "@yext/visual-editor";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
  Slot,
  WithId,
} from "@measured/puck";
import { useCardContext } from "../../../hooks/useCardContext.tsx";
import { useGetCardSlots } from "../../../hooks/useGetCardSlots.tsx";
import { getRandomPlaceholderImageObject } from "../../../utils/imagePlaceholders";

const defaultProduct = {
  image: {
    url: "https://placehold.co/640x360",
    height: 360,
    width: 640,
  },
  name: { en: "Product Name", hasLocalizedValue: "true" },
  category: {
    en: getDefaultRTF("Category, Pricing, etc"),
    hasLocalizedValue: "true",
  },
  description: {
    en: getDefaultRTF(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    ),
    hasLocalizedValue: "true",
  },
  cta: {
    label: { en: "Learn More", hasLocalizedValue: "true" },
    link: "#",
    linkType: "URL",
    ctaType: "textAndLink",
  },
} satisfies ProductStruct;

export const defaultProductCardSlotData = (id?: string, index?: number) => {
  return {
    type: "ProductCard",
    props: {
      ...(id && { id }),
      ...(index !== undefined && { index }),
      styles: {
        backgroundColor: backgroundColors.background1.value,
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
                    ...getRandomPlaceholderImageObject(),
                    width: 640,
                    height: 360,
                  },
                  constantValueEnabled: true,
                },
              },
              styles: {
                aspectRatio: 1.78,
                width: 640,
              },
            } satisfies ImageWrapperProps,
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
                  constantValue: defaultProduct.name,
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
        CategorySlot: [
          {
            type: "BodyTextSlot",
            props: {
              ...(id && { id: `${id}-category` }),
              data: {
                text: {
                  field: "",
                  constantValue: defaultProduct.category,
                  constantValueEnabled: true,
                },
              },
              styles: {
                variant: "base",
              },
            } satisfies BodyTextProps,
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
                  constantValue: defaultProduct.description,
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
                entityField: {
                  field: "",
                  constantValue: defaultProduct.cta,
                  constantValueEnabled: true,
                },
              },
              styles: {
                variant: "primary",
                presetImage: "app-store",
              },
            } satisfies CTAWrapperProps,
          },
        ],
      },
    } satisfies ProductCardProps,
  };
};

export type ProductCardProps = {
  styles: {
    /** The background color of each individual card
     * @defaultValue Background Color 1
     */
    backgroundColor?: BackgroundStyle;
  };

  /** @internal */
  slots: {
    ImageSlot: Slot;
    TitleSlot: Slot;
    CategorySlot: Slot;
    DescriptionSlot: Slot;
    CTASlot: Slot;
  };

  /** @internal */
  parentData?: {
    field: string;
    product: ProductStruct;
  };

  /** @internal */
  conditionalRender?: {
    category?: boolean;
  };

  /** @internal */
  index?: number;
};

const ProductCardFields: Fields<ProductCardProps> = {
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        }
      ),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      ImageSlot: { type: "slot" },
      TitleSlot: { type: "slot" },
      CategorySlot: { type: "slot" },
      DescriptionSlot: { type: "slot" },
      CTASlot: { type: "slot" },
    },
    visible: false,
  },
};

const ProductCardComponent: PuckComponent<ProductCardProps> = (props) => {
  const { styles, puck, conditionalRender, slots } = props;
  const { sharedCardProps, setSharedCardProps } = useCardContext<{
    cardBackground: BackgroundStyle | undefined;
    slotStyles: Record<string, ProductCardProps["styles"]>;
  }>();

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
      TitleSlot: [],
      CategorySlot: [],
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

  return (
    <Background
      className="flex flex-col rounded-lg overflow-hidden border h-full"
      background={styles.backgroundColor}
      ref={puck.dragRef}
    >
      <slots.ImageSlot className="h-auto sm:min-h-[200px]" allow={[]} />
      <div className="p-8 gap-8 flex flex-col">
        <div className="gap-4 flex flex-col flex-grow">
          <slots.TitleSlot style={{ height: "auto" }} allow={[]} />
          {conditionalRender?.category && (
            <Background
              background={backgroundColors.background5.value}
              className="py-2 px-4 rounded w-fit"
            >
              <slots.CategorySlot style={{ height: "auto" }} allow={[]} />
            </Background>
          )}
          <slots.DescriptionSlot style={{ height: "auto" }} allow={[]} />
        </div>
        <slots.CTASlot style={{ height: "auto" }} allow={[]} />
      </div>
    </Background>
  );
};

export const ProductCard: ComponentConfig<{ props: ProductCardProps }> = {
  label: msg("slots.productCard", "Product Card"),
  fields: ProductCardFields,
  inline: true,
  resolveData: (data) => {
    const categorySlotProps = data.props.slots.CategorySlot?.[0]?.props as
      | WithId<BodyTextProps>
      | undefined;
    const showCategory = Boolean(
      categorySlotProps?.parentData
        ? categorySlotProps.parentData.richText
        : categorySlotProps?.data.text
    );

    let updatedData = {
      ...data,
      props: {
        ...data.props,
        conditionalRender: {
          category: showCategory,
        },
      } satisfies ProductCardProps,
    };

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
        "props.slots.CategorySlot[0].props.parentData",
        {
          field: field,
          richText: product.category,
        } satisfies BodyTextProps["parentData"]
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
        "props.slots.CategorySlot[0].props.parentData",
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
      TitleSlot: [],
      CategorySlot: [],
      DescriptionSlot: [],
      CTASlot: [],
    },
  },
  render: (props) => <ProductCardComponent {...props} />,
};
