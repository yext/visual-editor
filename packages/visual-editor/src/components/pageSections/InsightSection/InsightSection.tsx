import {
  ThemeColor,
  backgroundColors,
  ThemeOptions,
} from "../../../utils/themeConfigOptions.ts";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics.ts";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { Slot } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { forwardHeadingLevel } from "../../../utils/cardSlots/forwardHeadingLevel.ts";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import { defaultInsightCardSlotData } from "./InsightCard.tsx";
import { InsightCardsWrapperProps } from "./InsightCardsWrapper.tsx";
import {
  getMappedCardsSectionConditionalRender,
  MappedCardsSectionConditionalRender,
  MappedCardsSectionContent,
  MappedCardsSectionShell,
} from "../mappedCardsSectionUtils.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";

export interface InsightSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color for the entire section.
     * @defaultValue Background Color 2
     */
    backgroundColor?: ThemeColor;

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

  /** @internal */
  conditionalRender?: MappedCardsSectionConditionalRender;

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const insightSectionFields: YextFields<InsightSectionProps> = {
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      backgroundColor: {
        type: "basicSelector",
        label: msg("fields.backgroundColor", "Background Color"),
        options: "BACKGROUND_COLOR",
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

/**
 * The Insight Section is used to display a curated list of content such as articles, blog posts, or other informational blurbs. It features a main section heading and renders each insight as a distinct card, making it an effective way to showcase valuable content.
 * Available on Location templates.
 */
export const InsightSection: YextComponentConfig<InsightSectionProps> = {
  label: msg("components.insightsSection", "Insights Section"),
  fields: insightSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background2.value,
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
                constantValue: { defaultValue: "Insights" },
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
      CardsWrapperSlot: [
        {
          type: "InsightCardsWrapper",
          props: {
            data: {
              field: "",
              constantValueEnabled: true,
              constantValue: [{}, {}, {}],
            },
            styles: {
              showImage: true,
              showCategory: true,
              showPublishTime: true,
              showDescription: true,
              showCTA: true,
            },
            slots: {
              CardSlot: [
                defaultInsightCardSlotData(undefined, 0),
                defaultInsightCardSlotData(undefined, 1),
                defaultInsightCardSlotData(undefined, 2),
              ],
            },
          } satisfies InsightCardsWrapperProps,
        },
      ],
    },
    analytics: {
      scope: "insightsSection",
    },
    liveVisibility: true,
  },
  resolveData: (data) => {
    const updatedData = forwardHeadingLevel<InsightCardsWrapperProps>(
      data,
      "TitleSlot"
    );

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
        name={`${props.analytics?.scope ?? "insightsSection"}${getAnalyticsScopeHash(props.id)}`}
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
