import * as React from "react";
import {
  BackgroundStyle,
  YextField,
  YextEntityField,
  PageSection,
  backgroundColors,
  VisibilityWrapper,
  ProductSectionType,
  ComponentFields,
  msg,
  getAnalyticsScopeHash,
  Background,
  CTAWrapperProps,
  BodyTextProps,
  HeadingTextProps,
  ImageWrapperProps,
  resolveYextEntityField,
  ProductStruct,
  i18nComponentsInstance,
  deepMerge,
} from "@yext/visual-editor";
import {
  ComponentConfig,
  ComponentData,
  createUsePuck,
  Fields,
  PuckComponent,
  setDeep,
  Slot,
  useGetPuck,
} from "@measured/puck";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  CardContextProvider,
  useCardContext,
} from "../../hooks/useCardContext.tsx";

const usePuck = createUsePuck();

const getDefaultRTF = (text: string) => {
  return {
    json: `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"${text}","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`,
    html: `<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>${text}</span></p>`,
  };
};

export interface ProductSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color for the entire section.
     * @defaultValue Background Color 2
     */
    backgroundColor?: BackgroundStyle;
  };

  slots: {
    SectionHeadingSlot: Slot;
    CardsWrapperSlot: Slot;
  };

  /** @internal  */
  analytics: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const productSectionFields: Fields<ProductSectionProps> = {
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
      SectionHeadingSlot: { type: "slot" },
      CardsWrapperSlot: { type: "slot" },
    },
    visible: false,
  },
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

export type ProductCardsWrapperProps = {
  data: Omit<YextEntityField<ProductSectionType>, "constantValue"> & {
    constantValue: {
      id: string;
    }[];
  };
  slots: {
    CardSlot: Slot;
  };
};

const ProductCardsWrapperFields: Fields<ProductCardsWrapperProps> = {
  data: YextField(msg("fields.products", "Products"), {
    type: "entityField",
    filter: {
      types: [ComponentFields.ProductSection.type],
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot" },
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

export const ProductCardsWrapper: ComponentConfig<{
  props: ProductCardsWrapperProps;
}> = {
  label: msg("slots.productCards", "Product Cards"),
  fields: ProductCardsWrapperFields,
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

      return setDeep(
        data,
        "props.slots.CardSlot",
        data.props.slots.CardSlot.slice(0, resolvedProducts.length).map(
          (card, i) => {
            return setDeep(card, "props.parentData", {
              field: data.props.data.field,
              product: resolvedProducts[i],
            } satisfies ProductCardProps["parentData"]);
          }
        )
      );
    } else {
      // STATIC VALUES
      let updatedData = data;

      // For each id in constantValue, check if there's already an existing card.
      // If not, add a new default card.
      // Also, de-duplicate ids to avoid conflicts.
      // Finally, update the card slot and the constantValue object.
      const inUseIds = new Set<string>();
      const newSlots = data.props.data.constantValue.map(({ id }) => {
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
          return defaultProductCardSlotData(newId);
        }

        newCard = setDeep(newCard, "props.id", newId); // update the id
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

  // In editor, use puck hooks to get the slot props
  let slotsData: ProductCardProps["slots"] | undefined = undefined;
  let getPuck: ReturnType<typeof useGetPuck>;
  try {
    slotsData = usePuck((s) => s.getItemById(props.id)?.props.slots);
    getPuck = useGetPuck();
  } catch {
    // live page, do nothing
  }

  // Process the slot props into just the shared styles
  const slotStyles = React.useMemo(() => {
    const slotNameToStyles = {} as Record<string, any>;
    Object.entries(slotsData || {}).forEach(([key, value]) => {
      slotNameToStyles[key] = value[0].props.styles || {};
    });
    return slotNameToStyles;
  }, [slotsData]);

  // sharedCardProps useEffect
  // When the context changes, dispatch an update to sync the changes to puck
  React.useEffect(() => {
    if (!puck.isEditing || !sharedCardProps) {
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
    if (!selector || !slotsData) {
      return;
    }

    const newSlotData: ProductCardProps["slots"] = {
      ImageSlot: [],
      TitleSlot: [],
      CategorySlot: [],
      DescriptionSlot: [],
      CTASlot: [],
    };
    Object.entries(slotsData).forEach(([key, value]) => {
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
    if (!puck.isEditing || !slotsData) {
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
    >
      <slots.ImageSlot className="h-auto sm:h-[200px]" allow={[]} />
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
  resolveData: (data) => {
    const categorySlotProps = data.props.slots.CategorySlot?.[0]
      ?.props as unknown as BodyTextProps | undefined;
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

    if (data.props.parentData) {
      const product = data.props.parentData.product;
      const field = data.props.parentData.field;

      updatedData = setDeep(
        updatedData,
        "props.slots.ImageSlot.0.props.parentData",
        {
          field: field,
          image: product.image,
        } satisfies ImageWrapperProps["parentData"]
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.TitleSlot.0.props.parentData",
        {
          field: field,
          text: product.name as string, // will already be resolved
        } satisfies HeadingTextProps["parentData"]
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.CategorySlot.0.props.parentData",
        {
          field: field,
          richText: product.category,
        } satisfies BodyTextProps["parentData"]
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.DescriptionSlot.0.props.parentData",
        {
          field: field,
          richText: product.description,
        } satisfies BodyTextProps["parentData"]
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.CTASlot.0.props.parentData",
        {
          field: field,
          cta: product.cta,
        } satisfies CTAWrapperProps["parentData"]
      );

      return updatedData;
    } else {
      updatedData = setDeep(
        updatedData,
        "props.slots.ImageSlot.0.props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.TitleSlot.0.props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.CategorySlot.0.props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.DescriptionSlot.0.props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.CTASlot.0.props.parentData",
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

const ProductSectionComponent: PuckComponent<ProductSectionProps> = (props) => {
  const { slots, styles } = props;

  return (
    <PageSection
      background={styles?.backgroundColor}
      className="flex flex-col gap-8"
    >
      <slots.SectionHeadingSlot style={{ height: "auto" }} allow={[]} />
      <slots.CardsWrapperSlot style={{ height: "auto" }} allow={[]} />
    </PageSection>
  );
};

const defaultProductCardSlotData = (id: string) => ({
  type: "ProductCard",
  props: {
    id,
    styles: {
      backgroundColor: backgroundColors.background1.value,
    } satisfies ProductCardProps["styles"],
    slots: {
      ImageSlot: [
        {
          type: "ImageSlot",
          props: {
            data: {
              image: {
                field: "",
                constantValue: {
                  url: "https://placehold.co/640x360",
                  height: 360,
                  width: 640,
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
            data: {
              text: {
                field: "",
                constantValue: {
                  en: "Product Title",
                  hasLocalizedValue: "true",
                },
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
            data: {
              text: {
                field: "",
                constantValue: {
                  en: getDefaultRTF("Category, Pricing, etc"),
                  hasLocalizedValue: "true",
                },
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
            data: {
              text: {
                field: "",
                constantValue: {
                  en: getDefaultRTF(
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                  ),
                  hasLocalizedValue: "true",
                },
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
            data: {
              entityField: {
                field: "",
                constantValue: {
                  label: "Learn More",
                  link: "#",
                  linkType: "URL",
                  ctaType: "textAndLink",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              variant: "primary",
            },
          } satisfies CTAWrapperProps,
        },
      ],
    },
  },
});

/**
 * The Product Section is used to display a curated list of products in a dedicated section. It features a main heading and renders each product as an individual card, making it ideal for showcasing featured items, new arrivals, or bestsellers.
 * Available on Location templates.
 */
export const ProductSection: ComponentConfig<{ props: ProductSectionProps }> = {
  label: msg("components.productsSection", "Products Section"),
  fields: productSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background2.value,
    },
    slots: {
      SectionHeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                field: "",
                constantValue: {
                  en: "Featured Products",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              level: 2,
              align: "left",
            },
          } satisfies HeadingTextProps,
        },
      ],
      CardsWrapperSlot: [
        {
          type: "ProductCardsWrapper",
          props: {
            data: {
              field: "",
              constantValueEnabled: true,
              constantValue: [
                { id: "ProductCard-default-1" },
                { id: "ProductCard-default-2" },
                { id: "ProductCard-default-3" },
              ],
            },
            slots: {
              CardSlot: [
                defaultProductCardSlotData("ProductCard-default-1"),
                defaultProductCardSlotData("ProductCard-default-2"),
                defaultProductCardSlotData("ProductCard-default-3"),
              ],
            },
          } satisfies ProductCardsWrapperProps,
        },
      ],
    },
    analytics: {
      scope: "productsSection",
    },
    liveVisibility: true,
  },
  resolveData: (data) => {
    // Get the section heading level from the SectionHeadingSlot
    // and pass a semanticLevelOverride into each card's TitleSlot

    const sectionHeadingLevel =
      data.props.slots.SectionHeadingSlot?.[0]?.props?.styles?.level;
    const cards: ProductCardsWrapperProps["slots"]["CardSlot"] =
      data.props.slots.CardsWrapperSlot?.[0]?.props?.slots?.CardSlot;
    const semanticOverride =
      sectionHeadingLevel < 6 ? sectionHeadingLevel + 1 : "span";

    if (cards) {
      data.props.slots.CardsWrapperSlot[0].props.slots.CardSlot = cards.map(
        (card) => {
          return setDeep(
            card,
            "props.slots.TitleSlot[0].props.styles.semanticLevelOverride",
            semanticOverride
          );
        }
      );
    }

    return data;
  },
  render: (props) => {
    return (
      <AnalyticsScopeProvider
        name={`${props.analytics?.scope ?? "productsSection"}${getAnalyticsScopeHash(props.id)}`}
      >
        <VisibilityWrapper
          liveVisibility={props.liveVisibility}
          isEditing={props.puck.isEditing}
        >
          <ProductSectionComponent {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    );
  },
};
