import { Slot, setDeep } from "@puckeditor/core";
import {
  ThemeColor,
  backgroundColors,
  ThemeOptions,
} from "../../../utils/themeConfigOptions.ts";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics.ts";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  ProductCardsWrapper,
  type ProductCardsWrapperProps,
} from "./ProductCardsWrapper.tsx";
import { forwardHeadingLevel } from "../../../utils/cardSlots/forwardHeadingLevel.ts";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import {
  getMappedCardsSectionConditionalRender,
  MappedCardsSectionConditionalRender,
  MappedCardsSectionContent,
  MappedCardsSectionShell,
} from "../mappedCardsSectionUtils.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";

export type ProductSectionVariant = "immersive" | "classic" | "minimal";
export type ProductSectionImageConstrain = "fill" | "fixed";

export interface ProductSectionProps {
  styles: {
    backgroundColor?: ThemeColor;
    cardVariant?: ProductSectionVariant;
    showSectionHeading: boolean;
  };
  slots: {
    SectionHeadingSlot: Slot;
    CardsWrapperSlot: Slot;
  };
  analytics: {
    scope?: string;
  };
  conditionalRender?: MappedCardsSectionConditionalRender;
  liveVisibility: boolean;
}

const productSectionFields: YextFields<ProductSectionProps> = {
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      backgroundColor: {
        type: "basicSelector",
        label: msg("fields.backgroundColor", "Background Color"),
        options: "BACKGROUND_COLOR",
      },
      cardVariant: {
        type: "basicSelector",
        label: msg("fields.cardVariant", "Card Variant"),
        options: [
          {
            label: msg("fields.options.immersive", "Immersive"),
            value: "immersive",
          },
          { label: msg("fields.options.classic", "Classic"), value: "classic" },
          { label: msg("fields.options.minimal", "Minimal"), value: "minimal" },
        ],
      },
      showSectionHeading: {
        label: msg("fields.showSectionHeading", "Show Section Heading"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
    },
  },
  slots: {
    type: "object",
    objectFields: {
      SectionHeadingSlot: { type: "slot" },
      CardsWrapperSlot: { type: "slot" },
    },
    visible: false,
  },
  analytics: {
    type: "object",
    label: msg("fields.analytics", "Analytics"),
    visible: false,
    objectFields: {
      scope: {
        label: msg("fields.scope", "Scope"),
        type: "text",
      },
    },
  },
  liveVisibility: {
    label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
    type: "radio",
    options: [
      { label: msg("fields.options.show", "Show"), value: true },
      { label: msg("fields.options.hide", "Hide"), value: false },
    ],
  },
};

export const ProductSection: YextComponentConfig<ProductSectionProps> = {
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
                constantValue: { defaultValue: "Featured Products" },
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
            ...(ProductCardsWrapper.defaultProps as ProductCardsWrapperProps),
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
    const cards =
      updatedData.props.slots.CardsWrapperSlot?.[0]?.props?.slots?.CardSlot;

    if (cards) {
      cards.forEach((_: unknown, i: number) => {
        updatedData = setDeep(
          updatedData,
          `props.slots.CardsWrapperSlot[0].props.slots.CardSlot[${i}].props.slots.ImageSlot[0].props.showImageConstrain`,
          !isImmersive
        );
        updatedData = setDeep(
          updatedData,
          `props.slots.CardsWrapperSlot[0].props.slots.CardSlot[${i}].props.slots.ImageSlot[0].props.hideWidthProp`,
          isImmersive
        );
      });
    }

    return {
      ...updatedData,
      props: {
        ...updatedData.props,
        conditionalRender: getMappedCardsSectionConditionalRender(
          updatedData.props.slots.CardsWrapperSlot?.[0]
        ),
      },
    };
  },
  render: (props) => (
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
          <MappedCardsSectionShell
            conditionalRender={props.conditionalRender}
            isEditing={props.puck.isEditing}
            CardsWrapperSlot={props.slots.CardsWrapperSlot}
          >
            {(setCardsWrapperRef) => (
              <MappedCardsSectionContent
                backgroundColor={props.styles?.backgroundColor}
                showSectionHeading={props.styles.showSectionHeading}
                SectionHeadingSlot={props.slots.SectionHeadingSlot}
                CardsWrapperSlot={props.slots.CardsWrapperSlot}
                setCardsWrapperRef={setCardsWrapperRef}
              />
            )}
          </MappedCardsSectionShell>
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    </ComponentErrorBoundary>
  ),
};
