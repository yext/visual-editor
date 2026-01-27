import * as React from "react";
import {
  BackgroundStyle,
  YextField,
  PageSection,
  backgroundColors,
  VisibilityWrapper,
  msg,
  getAnalyticsScopeHash,
  HeadingTextProps,
} from "@yext/visual-editor";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  Slot,
  setDeep,
} from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultProductCardSlotData } from "./ProductCard.tsx";
import { ProductCardsWrapperProps } from "./ProductCardsWrapper.tsx";
import { forwardHeadingLevel } from "../../../utils/cardSlots/forwardHeadingLevel.ts";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary";
import {
  ProductSectionProvider,
  ProductSectionVariant,
} from "./ProductSectionContext.tsx";

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

    /**
     * The variant of the product cards.
     * @defaultValue Immersive
     */
    cardVariant?: ProductSectionVariant;

    /**
     * Whether to show the product image.
     * @defaultValue true
     */
    showImage?: boolean;

    /**
     * Whether to show the product brow text.
     * @defaultValue true
     */
    showBrow?: boolean;

    /**
     * Whether to show the product title.
     * @defaultValue true
     */
    showTitle?: boolean;

    /**
     * Whether to show the product price.
     * @defaultValue true
     */
    showPrice?: boolean;

    /**
     * Whether to show the product description.
     * @defaultValue true
     */
    showDescription?: boolean;

    /**
     * Whether to show the product CTA.
     * @defaultValue true
     */
    showCTA?: boolean;
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
      cardVariant: YextField(msg("fields.cardVariant", "Card Variant"), {
        type: "select",
        options: [
          {
            label: msg("fields.options.immersive", "Immersive"),
            value: "immersive",
          },
          { label: msg("fields.options.classic", "Classic"), value: "classic" },
          { label: msg("fields.options.minimal", "Minimal"), value: "minimal" },
        ],
      }),
      showImage: YextField(msg("fields.showImage", "Show Image"), {
        type: "radio",
        options: [
          { label: msg("fields.options.show", "Show"), value: true },
          { label: msg("fields.options.hide", "Hide"), value: false },
        ],
      }),
      showBrow: YextField(msg("fields.showBrow", "Show Brow Text"), {
        type: "radio",
        options: [
          { label: msg("fields.options.show", "Show"), value: true },
          { label: msg("fields.options.hide", "Hide"), value: false },
        ],
      }),
      showTitle: YextField(msg("fields.showTitle", "Show Title"), {
        type: "radio",
        options: [
          { label: msg("fields.options.show", "Show"), value: true },
          { label: msg("fields.options.hide", "Hide"), value: false },
        ],
      }),
      showPrice: YextField(msg("fields.showPrice", "Show Price"), {
        type: "radio",
        options: [
          { label: msg("fields.options.show", "Show"), value: true },
          { label: msg("fields.options.hide", "Hide"), value: false },
        ],
      }),
      showDescription: YextField(
        msg("fields.showDescription", "Show Description"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.show", "Show"), value: true },
            { label: msg("fields.options.hide", "Hide"), value: false },
          ],
        }
      ),
      showCTA: YextField(msg("fields.showCTA", "Show CTA"), {
        type: "radio",
        options: [
          { label: msg("fields.options.show", "Show"), value: true },
          { label: msg("fields.options.hide", "Hide"), value: false },
        ],
      }),
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

const ProductSectionComponent: PuckComponent<ProductSectionProps> = (props) => {
  const { slots, styles } = props;

  return (
    <ProductSectionProvider
      value={{
        variant: styles.cardVariant ?? "immersive",
        showImage: styles.showImage ?? true,
        showBrow: styles.showBrow ?? true,
        showTitle: styles.showTitle ?? true,
        showPrice: styles.showPrice ?? true,
        showDescription: styles.showDescription ?? true,
        showCTA: styles.showCTA ?? true,
      }}
    >
      <PageSection
        background={styles?.backgroundColor}
        className="flex flex-col gap-8"
      >
        <slots.SectionHeadingSlot style={{ height: "auto" }} allow={[]} />
        <slots.CardsWrapperSlot style={{ height: "auto" }} allow={[]} />
      </PageSection>
    </ProductSectionProvider>
  );
};

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
      cardVariant: "immersive",
      showImage: true,
      showBrow: true,
      showTitle: true,
      showPrice: true,
      showDescription: true,
      showCTA: true,
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
              constantValue: [{}, {}, {}], // leave ids blank to auto-generate
            },
            slots: {
              CardSlot: [
                defaultProductCardSlotData(),
                defaultProductCardSlotData(),
                defaultProductCardSlotData(),
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
    let updatedData = forwardHeadingLevel(data, "TitleSlot");

    const isImmersive = updatedData.props.styles.cardVariant === "immersive";
    const showImageConstrain = !isImmersive;

    const cards =
      updatedData.props.slots.CardsWrapperSlot?.[0]?.props?.slots?.CardSlot;

    if (cards) {
      cards.forEach((_: any, i: number) => {
        updatedData = setDeep(
          updatedData,
          `props.slots.CardsWrapperSlot[0].props.slots.CardSlot[${i}].props.slots.ImageSlot[0].props.showImageConstrain`,
          showImageConstrain
        );

        if (isImmersive) {
          updatedData = setDeep(
            updatedData,
            `props.slots.CardsWrapperSlot[0].props.slots.CardSlot[${i}].props.slots.ImageSlot[0].props.hideWidthProp`,
            true
          );
        } else {
          updatedData = setDeep(
            updatedData,
            `props.slots.CardsWrapperSlot[0].props.slots.CardSlot[${i}].props.slots.ImageSlot[0].props.hideWidthProp`,
            false
          );
        }
      });
    }

    return updatedData;
  },
  render: (props) => {
    return (
      <ComponentErrorBoundary
        isEditing={props.puck.isEditing}
        resetKeys={[props]}
      >
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
      </ComponentErrorBoundary>
    );
  },
};
