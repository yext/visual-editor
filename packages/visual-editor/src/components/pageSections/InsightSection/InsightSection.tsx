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
import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { forwardHeadingLevel } from "../../../utils/cardSlots/forwardHeadingLevel.ts";
import { defaultInsightCardSlotData } from "./InsightCard.tsx";
import { InsightCardsWrapperProps } from "./InsightCardsWrapper.tsx";

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

const insightSectionFields: Fields<InsightSectionProps> = {
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

const InsightSectionComponent: PuckComponent<InsightSectionProps> = (props) => {
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

/**
 * The Insight Section is used to display a curated list of content such as articles, blog posts, or other informational blurbs. It features a main section heading and renders each insight as a distinct card, making it an effective way to showcase valuable content.
 * Available on Location templates.
 */
export const InsightSection: ComponentConfig<{ props: InsightSectionProps }> = {
  label: msg("components.insightsSection", "Insights Section"),
  fields: insightSectionFields,
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
                  en: "Insights",
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
      CardsWrapperSlot: [
        {
          type: "InsightCardsWrapper",
          props: {
            data: {
              field: "",
              constantValueEnabled: true,
              constantValue: [
                { id: "InsightCard-1" },
                { id: "InsightCard-2" },
                { id: "InsightCard-3" },
              ],
            },
            slots: {
              CardSlot: [
                defaultInsightCardSlotData("InsightCard-1"),
                defaultInsightCardSlotData("InsightCard-2"),
                defaultInsightCardSlotData("InsightCard-3"),
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
    return forwardHeadingLevel<InsightCardsWrapperProps>(data, "TitleSlot");
  },
  render: (props) => {
    return (
      <AnalyticsScopeProvider
        name={`${props.analytics?.scope ?? "insightsSection"}${getAnalyticsScopeHash(props.id)}`}
      >
        <VisibilityWrapper
          liveVisibility={props.liveVisibility}
          isEditing={props.puck.isEditing}
        >
          <InsightSectionComponent {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    );
  },
};
