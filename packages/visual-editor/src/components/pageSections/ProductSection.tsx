import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  BackgroundStyle,
  YextField,
  YextEntityField,
  useDocument,
  PageSection,
  backgroundColors,
  VisibilityWrapper,
  ProductSectionType,
  ComponentFields,
  msg,
  getAnalyticsScopeHash,
  Background,
} from "@yext/visual-editor";
import {
  ComponentConfig,
  ComponentData,
  Fields,
  PuckComponent,
  Slot,
  createUsePuck,
  resolveAllData,
  setDeep,
  useGetPuck,
  walkTree,
} from "@measured/puck";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultProduct } from "../../internal/puck/constant-value-fields/ProductSection.tsx";
import { use } from "i18next";

const getDefaultRTF = (text: string) => {
  return {
    json: `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"${text}","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`,
    html: `<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>${text}</span></p>`,
  };
};

const usePuck = createUsePuck();

export interface ProductStyles {
  /**
   * The background color for the entire section.
   * @defaultValue Background Color 2
   */
  backgroundColor?: BackgroundStyle;

  // /** Styling for the individual product cards. */
  // cards: {
  //   /** The h tag level of each product card's title */
  //   headingLevel: HeadingLevel;
  //   /** The background color of each product card */
  //   backgroundColor?: BackgroundStyle;
  //   /** The CTA variant to use in each product card */
  //   ctaVariant: CTAVariant;
  // };
}

export interface ProductSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: ProductStyles;

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
      // cards: YextField(msg("fields.cards", "Cards"), {
      //   type: "object",
      //   objectFields: {
      //     headingLevel: YextField(msg("fields.headingLevel", "Heading Level"), {
      //       type: "select",
      //       hasSearch: true,
      //       options: "HEADING_LEVEL",
      //     }),
      //     backgroundColor: YextField(
      //       msg("fields.backgroundColor", "Background Color"),
      //       {
      //         type: "select",
      //         options: "BACKGROUND_COLOR",
      //       }
      //     ),
      //     ctaVariant: YextField(msg("fields.ctaVariant", "CTA Variant"), {
      //       type: "radio",
      //       options: "CTA_VARIANT",
      //     }),
      //   },
      // }),
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
  data: YextEntityField<ProductSectionType>;
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
  // const { id } = props;
  // const streamDocument = useDocument();
  // const getPuck = useGetPuck();

  // let puckComponentData: ComponentData<ProductCardsWrapperProps> | undefined;
  // try {
  //   puckComponentData = usePuck((s) => {
  //     return s.getItemById(id);
  //   });
  // } catch {
  //   // live page
  // }

  //   React.useEffect(() => {
  //     // This useEffect synchronizes the styling props of all ProductCards
  //     if (!puckComponentData?.props?.id) {
  //       return;
  //     }

  //     const r = async () => {
  //       const { appState, config, dispatch, getSelectorForId } = getPuck();

  //       // const resolvedData = await resolveAllData(appState.data.content[-], config, {
  //       //   streamDocument,
  //       // });

  //       // const { selectedItem, dispatch, getSelectorForId } = getPuck();
  //       // if (!selectedItem) {
  //       //   return;
  //       // }

  //       const sectionSelector = getSelectorForId(id);

  //       if (!sectionSelector) {
  //         return;
  //       }
  //       console.log(resolvedData, appState.data);
  //       if (JSON.stringify(resolvedData) === JSON.stringify(appState.data)) {
  //         return;
  //       }

  //       dispatch({
  //         type: "setData",
  //         data: resolvedData,
  //       });
  //     };
  //     r();

  //     // const cardSelector = getSelectorForId(selectedItem.props.id);
  //     // if (!sectionSelector || !cardSelector) {
  //     //   return;
  //     // }

  //     // // Merge the existing ProductCard props with the new updates
  //     // const oldCardProps = puckComponentData.props.slots
  //     //   .CardSlot as ComponentData<ProductCardProps>[];

  //     // let newCardProps: ComponentData<ProductCardProps>[] | undefined;
  //     // if (selectedItem?.type === "ProductCard") {
  //     //   newCardProps = oldCardProps.map((currentSlot) => {
  //     //     console.log("currentSlot", currentSlot);
  //     //     return {
  //     //       type: "ProductCard",
  //     //       props: {
  //     //         // Keep the unique props and data of each card
  //     //         id: currentSlot.props.id,
  //     //         styles: {
  //     //           backgroundColor: selectedItem.props.styles.backgroundColor,
  //     //         },
  //     //         slots: currentSlot.props.slots,
  //     //       },
  //     //     };
  //     //   });
  //     // }

  //     // console.log("newCardProps", newCardProps);
  //     // console.log("oldCardProps", oldCardProps);

  //     // // else if ((selectedItem?.type as string) === "HeadingTextSlot") {
  //     // //   // When the heading text level changes in the heading text slot,
  //     // //   // update all cards to reflect the new section heading level
  //     // //   newCardProps = oldCardProps.map((currentSlot) => {
  //     // //     return {
  //     // //       type: "EventCard",
  //     // //       props: {
  //     // //         ...currentSlot.props,
  //     // //         sectionHeadingLevel:
  //     // //           puckComponentData.props.slots.SectionHeadingSlot?.[0]?.props
  //     // //             .styles.level || 2,
  //     // //       },
  //     // //     };
  //     // //   });
  //     // // }

  //     // // Only dispatch update if the card props have changed
  //     // if (
  //     //   !newCardProps?.length ||
  //     //   JSON.stringify(oldCardProps) === JSON.stringify(newCardProps)
  //     // ) {
  //     //   return;
  //     // }

  //     // // Update the cards
  //     // const updatedData = setDeep(
  //     //   puckComponentData,
  //     //   "props.slots.CardSlot",
  //     //   newCardProps
  //     // );

  //     // console.log("dispatch 1", updatedData);
  //     // dispatch({
  //     //   type: "replace",
  //     //   destinationZone: sectionSelector.zone,
  //     //   destinationIndex: sectionSelector.index,
  //     //   data: updatedData,
  //     // });
  //   }, [puckComponentData?.props.slots]);

  return (
    <div ref={props.puck.dragRef}>
      <props.slots.CardSlot className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 align-stretch" />
    </div>
  );
};

export const ProductCardsWrapper: ComponentConfig<{
  props: ProductCardsWrapperProps;
}> = {
  label: msg("slots.productCards", "Product Cards"),
  fields: ProductCardsWrapperFields,
  inline: true,
  defaultProps: {
    data: {
      field: "",
      constantValue: {
        products: [defaultProduct, defaultProduct, defaultProduct],
      },
      constantValueEnabled: true,
    },
    slots: {
      CardSlot: [],
    },
  },
  resolveFields: (data, params) => {
    console.log("ProductCardsWrapper resolve fields", data, params);
    return ProductCardsWrapperFields;
  },
  resolveData: (data, params) => {
    console.log("ProductCardsWrapper resolve data", data, params);
    return data;
  },
  render: (props) => <ProductCardsWrapperComponent {...props} />,
};

export type ProductCardProps = {
  styles: {
    backgroundColor?: BackgroundStyle;
  };
  slots: {
    ImageSlot: Slot;
    TitleSlot: Slot;
    CategorySlot: Slot;
    DescriptionSlot: Slot;
    CTASlot: Slot;
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
  const {
    styles,
    puck: { dragRef },
  } = props;
  return (
    <div ref={dragRef}>
      <Background
        className="flex flex-col rounded-lg overflow-hidden border h-full"
        background={styles.backgroundColor}
      >
        <props.slots.ImageSlot />
        <div className="p-8 gap-8 flex flex-col">
          <div className="gap-4 flex flex-col flex-grow">
            <props.slots.TitleSlot />
            <Background
              background={backgroundColors.background5.value}
              className="py-2 px-4 rounded w-fit"
            >
              <props.slots.CategorySlot />
            </Background>
          </div>
          <props.slots.DescriptionSlot />
          <props.slots.CTASlot />
        </div>
      </Background>
    </div>
  );
};

export const ProductCard: ComponentConfig<{ props: ProductCardProps }> = {
  label: msg("slots.productCard", "Product Card"),
  fields: ProductCardFields,
  inline: true,
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

// const ProductCard = ({
//   cardNumber,
//   product,
//   cardStyles,
//   sectionHeadingLevel,
//   ctaVariant,
// }: {
//   cardNumber: number;
//   product: ProductStruct;
//   cardStyles: ProductSectionProps["styles"]["cards"];
//   sectionHeadingLevel: HeadingLevel;
//   ctaVariant: CTAVariant;
// }) => {
//   const { i18n } = useTranslation();
//   const streamDocument = useDocument();
//   return (
//     <Background
//       className="flex flex-col rounded-lg overflow-hidden border h-full"
//       background={cardStyles.backgroundColor}
//     >
//       {product.image ? (
//         <Image
//           image={product.image}
//           aspectRatio={1.778} // 16:9
//           className="h-[200px]"
//           sizes={imgSizesHelper({
//             base: "calc(100vw - 32px)",
//             md: "calc((maxWidth - 32px) / 2)",
//             lg: "calc((maxWidth - 32px) / 3)",
//           })}
//         />
//       ) : (
//         <div className="sm:h-[200px]" />
//       )}
//       <div className="p-8 gap-8 flex flex-col flex-grow">
//         <div className="gap-4 flex flex-col">
//           {product.name && (
//             <Heading
//               level={cardStyles.headingLevel}
//               semanticLevelOverride={
//                 sectionHeadingLevel < 6
//                   ? ((sectionHeadingLevel + 1) as HeadingLevel)
//                   : "span"
//               }
//               className="mb-2"
//             >
//               {resolveComponentData(
//                 product.name,
//                 i18n.language,
//                 streamDocument
//               )}
//             </Heading>
//           )}
//           {product.category && (
//             <Background
//               background={backgroundColors.background5.value}
//               className="py-2 px-4 rounded w-fit"
//             >
//               <Body>
//                 {resolveComponentData(
//                   product.category,
//                   i18n.language,
//                   streamDocument
//                 )}
//               </Body>
//             </Background>
//           )}
//           {product?.description &&
//             resolveComponentData(product.description, i18n.language)}
//         </div>
//         {product.cta && (
//           <CTA
//             eventName={`cta${cardNumber}`}
//             variant={ctaVariant}
//             label={
//               product.cta.label
//                 ? resolveComponentData(
//                     product.cta.label,
//                     i18n.language,
//                     streamDocument
//                   )
//                 : undefined
//             }
//             link={resolveComponentData(
//               product.cta.link,
//               i18n.language,
//               streamDocument
//             )}
//             linkType={product.cta.linkType}
//             ctaType={product.cta.ctaType}
//             coordinate={product.cta.coordinate}
//             presetImageType={product.cta.presetImageType}
//             className="mt-auto"
//           />
//         )}
//       </div>
//     </Background>
//   );
// };

const ProductSectionComponent: PuckComponent<ProductSectionProps> = (props) => {
  const { i18n } = useTranslation();
  const { slots, styles, id } = props;
  const locale = i18n.language;
  const streamDocument = useDocument();
  // const resolvedProducts = resolveComponentData(
  //   data.products,
  //   locale,
  //   streamDocument
  // );
  // console.log("ProductSectionComponent props", props);

  const getPuck = useGetPuck();

  let puckComponentData: ComponentData<ProductCardsWrapperProps> | undefined;
  try {
    puckComponentData = usePuck((s) => {
      return s.getItemById(id);
    });
  } catch {
    // live page
  }

  React.useEffect(() => {
    const { appState, config, selectedItem } = getPuck();
    console.log("selectedItem", selectedItem);

    let parent;
    const newData = walkTree(appState.data, config, (content, options) => {
      if (content[0].props.id === selectedItem?.props.id) {
        console.log("this one", content, options);
        parent = options.parentId;
      } else {
        console.log("no", content, options);
      }
    });
    console.log("parent", parent);
  }, [puckComponentData?.props.slots]);

  return (
    <PageSection
      background={styles?.backgroundColor}
      className="flex flex-col gap-8"
    >
      <slots.SectionHeadingSlot />
      <slots.CardsWrapperSlot />
      {/* {resolvedProducts?.products && (
        <EntityField
          displayName={pt("fields.products", "Products")}
          fieldId={data.products.field}
          constantValueEnabled={data.products.constantValueEnabled}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 align-stretch">
            {resolvedProducts.products.map((product, index) => (
              <ProductCard
                key={index}
                cardNumber={index}
                product={product}
                cardStyles={styles.cards}
                sectionHeadingLevel={styles.heading.level}
                ctaVariant={styles.cards.ctaVariant}
              />
            ))}
          </div>
        </EntityField>
      )} */}
    </PageSection>
  );
};

const defaultProductCardSlotData = {
  type: "ProductCard",
  props: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    slots: {
      ImageSlot: [
        {
          type: "ImageWrapperSlot",
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
          },
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
                  en: "Product Name",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              level: 3,
              align: "left",
            },
          },
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
                  en: getDefaultRTF("Category"),
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              variant: "base",
            },
          },
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
                    "Description of the product. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                  ),
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              variant: "base",
            },
          },
        },
      ],
      CTASlot: [
        {
          type: "CTAWrapperSlot",
          props: {
            entityField: {
              field: "",
              constantValue: {
                label: "Learn More",
                link: "#",
                linkType: "URL",
                ctaType: "textAndLink",
              },
            },
            variant: "primary",
          },
        },
      ],
    },
  },
};

/**
 * The Product Section is used to display a curated list of products in a dedicated section. It features a main heading and renders each product as an individual card, making it ideal for showcasing featured items, new arrivals, or bestsellers.
 * Available on Location templates.
 */
export const ProductSection: ComponentConfig<{ props: ProductSectionProps }> = {
  label: msg("components.productsSection", "Products Section"),
  fields: productSectionFields,
  inline: true,
  defaultProps: {
    // data: {
    //   heading: {
    //     field: "",
    //     constantValue: { en: "Featured Products", hasLocalizedValue: "true" },
    //     constantValueEnabled: true,
    //   },
    //   products: {
    //     field: "",
    //     constantValue: {
    //       products: [defaultProduct, defaultProduct, defaultProduct],
    //     },
    //     constantValueEnabled: true,
    //   },
    // },
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
          },
        },
      ],
      CardsWrapperSlot: [
        {
          type: "ProductCardsWrapper",
          props: {
            data: {
              field: "",
              constantValue: {
                products: [defaultProduct, defaultProduct, defaultProduct],
              },
              constantValueEnabled: true,
            },
            slots: {
              CardSlot: [
                defaultProductCardSlotData,
                defaultProductCardSlotData,
                defaultProductCardSlotData,
              ],
            },
          },
        },
      ],
    },
    analytics: {
      scope: "productsSection",
    },
    liveVisibility: true,
  },
  resolveFields: (data, params) => {
    console.log("ProductSection resolve fields", data, params);
    return productSectionFields;
  },
  resolveData: (data, params) => {
    console.log("ProductSection resolve data", data, params);
    return data;
  },
  render: (props) => {
    return (
      <div ref={props.puck.dragRef}>
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
      </div>
    );
  },
};
