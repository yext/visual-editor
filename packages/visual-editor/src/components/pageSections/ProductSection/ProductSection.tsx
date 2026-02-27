import {
  BackgroundStyle,
  backgroundColors,
} from "../../../utils/themeConfigOptions.ts";
import { YextField } from "../../../editor/YextField.tsx";
import { PageSection } from "../../atoms/pageSection.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics.ts";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
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
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import { defaultText } from "../../../utils/i18n/defaultContent.ts";

export type ProductSectionVariant = "immersive" | "classic" | "minimal";
export type ProductSectionImageConstrain = "fill" | "fixed";

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
     * Whether to show the section heading.
     * @defaultValue true
     */
    showSectionHeading: boolean;
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
      showSectionHeading: YextField(
        msg("fields.showSectionHeading", "Show Section Heading"),
        {
          type: "radio",
          options: "SHOW_HIDE",
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

const ProductSectionComponent: PuckComponent<ProductSectionProps> = (props) => {
  const { slots, styles } = props;

  return (
    <PageSection
      background={styles?.backgroundColor}
      className="flex flex-col gap-8"
    >
      {styles.showSectionHeading && (
        <slots.SectionHeadingSlot style={{ height: "auto" }} allow={[]} />
      )}
      <slots.CardsWrapperSlot style={{ height: "auto" }} allow={[]} />
    </PageSection>
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
      showSectionHeading: true,
    },
    slots: {
      SectionHeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                field: "",
                constantValue: defaultText(
                  "componentDefaults.featuredProducts",
                  "Featured Products"
                ),
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
            styles: {
              showImage: true,
              showBrow: true,
              showTitle: true,
              showPrice: true,
              showDescription: true,
              showCTA: true,
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

    if (
      data.props.slots.CardsWrapperSlot?.[0]?.props.styles?.variant !==
      data.props.styles.cardVariant
    ) {
      updatedData = setDeep(
        updatedData,
        "props.slots.CardsWrapperSlot[0].props.styles.variant",
        updatedData.props.styles.cardVariant
      );
    }

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
