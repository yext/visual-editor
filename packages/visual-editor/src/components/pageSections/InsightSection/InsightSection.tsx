import {
  ThemeColor,
  backgroundColors,
  ThemeOptions,
} from "../../../utils/themeConfigOptions.ts";
import { PageSection } from "../../atoms/pageSection.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics.ts";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { PuckComponent, Slot, setDeep } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { forwardHeadingLevel } from "../../../utils/cardSlots/forwardHeadingLevel.ts";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import {
  InsightCardsWrapper,
  type InsightCardsWrapperProps,
} from "./InsightCardsWrapper.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import { hasResolvedMappedListSource } from "../../../utils/cardSlots/mappedSource.ts";

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
  hasResolvedSource?: boolean;

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

const InsightSectionComponent: PuckComponent<InsightSectionProps> = (props) => {
  const { slots, styles, hasResolvedSource, puck } = props;

  if (!puck.isEditing && hasResolvedSource === false) {
    return <></>;
  }

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
            ...(InsightCardsWrapper.defaultProps as InsightCardsWrapperProps),
          } satisfies InsightCardsWrapperProps,
        },
      ],
    },
    analytics: {
      scope: "insightsSection",
    },
    liveVisibility: true,
  },
  resolveData: (data, params) => {
    const updatedData = forwardHeadingLevel<InsightCardsWrapperProps>(
      data,
      "TitleSlot"
    );
    const wrapperProps = updatedData.props.slots.CardsWrapperSlot?.[0]
      ?.props as InsightCardsWrapperProps | undefined;

    return setDeep(
      updatedData,
      "props.hasResolvedSource",
      !wrapperProps ||
        hasResolvedMappedListSource({
          streamDocument: params.metadata.streamDocument ?? {},
          constantValueEnabled: wrapperProps.data.constantValueEnabled,
          fieldPath: wrapperProps.data.field,
        })
    );
  },
  render: (props) => {
    return (
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
            <InsightSectionComponent {...props} />
          </VisibilityWrapper>
        </AnalyticsScopeProvider>
      </ComponentErrorBoundary>
    );
  },
};
