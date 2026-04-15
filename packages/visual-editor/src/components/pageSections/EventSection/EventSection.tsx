import * as React from "react";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import {
  ThemeColor,
  backgroundColors,
} from "../../../utils/themeConfigOptions.ts";
import { YextField } from "../../../editor/YextField.tsx";
import { PageSection } from "../../atoms/pageSection.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics.ts";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultEventCardSlotData } from "./EventCard.tsx";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import { EventCardsWrapperProps } from "./EventCardsWrapper.tsx";
import { forwardHeadingLevel } from "../../../utils/cardSlots/forwardHeadingLevel.ts";
import { EntityFieldSectionEmptyState } from "../EntityFieldSectionEmptyState.tsx";
import {
  getEditorItemId,
  isMappedCardWrapperSelected,
} from "../entityFieldSectionUtils.ts";
import { useMappedEntitySectionEmptyState } from "../useMappedEntitySectionEmptyState.ts";

export interface EventSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color of the section.
     * @defaultValue Background Color 3
     */
    backgroundColor?: ThemeColor;

    /**
     * Whether to show the section heading.
     * @defaultValue true
     */
    showSectionHeading: boolean;
  };

  /** @internal */
  slots: {
    SectionHeadingSlot: Slot;
    CardsWrapperSlot: Slot;
  };

  /** @internal */
  analytics: {
    scope?: string;
  };

  /** @internal */
  conditionalRender?: {
    watchForMappedContentEmptyState: boolean;
    mappedFieldOwnerId?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const eventSectionFields: Fields<EventSectionProps> = {
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

const EventSectionWrapper: PuckComponent<
  EventSectionProps & {
    setCardsWrapperRef?: (element: HTMLDivElement | null) => void;
  }
> = (props) => {
  const { styles, slots } = props;
  const { setCardsWrapperRef } = props;

  return (
    <PageSection
      background={styles?.backgroundColor}
      className="flex flex-col gap-8"
    >
      {styles.showSectionHeading && (
        <slots.SectionHeadingSlot style={{ height: "auto" }} allow={[]} />
      )}
      <div ref={setCardsWrapperRef}>
        <slots.CardsWrapperSlot style={{ height: "auto" }} allow={[]} />
      </div>
    </PageSection>
  );
};

/**
 * The Events Section component is designed to display a curated list of events. It features a prominent section heading and renders each event as an individual card, making it ideal for showcasing upcoming activities, workshops, or promotions.
 * Available on Location templates.
 */
export const EventSection: ComponentConfig<{ props: EventSectionProps }> = {
  label: msg("components.eventsSection", "Events Section"),
  fields: eventSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background3.value,
      showSectionHeading: true,
    },
    slots: {
      SectionHeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: { defaultValue: "Upcoming Events" },
                constantValueEnabled: true,
                field: "",
              },
            },
            styles: { level: 2, align: "left" },
          },
        },
      ],
      CardsWrapperSlot: [
        {
          type: "EventCardsWrapper",
          props: {
            data: {
              field: "",
              constantValueEnabled: true,
              constantValue: [{}, {}, {}], // leave ids blank to auto-generate
            },
            styles: {
              showImage: true,
              showDateTime: true,
              showDescription: true,
              showCTA: true,
            },
            slots: {
              CardSlot: [
                defaultEventCardSlotData(undefined, 0),
                defaultEventCardSlotData(undefined, 1),
                defaultEventCardSlotData(undefined, 2),
              ],
            },
          } satisfies EventCardsWrapperProps,
        },
      ],
    },
    analytics: {
      scope: "eventsSection",
    },
    liveVisibility: true,
  },
  resolveData: (data) => {
    const updatedData = forwardHeadingLevel(data, "TitleSlot");

    return {
      ...updatedData,
      props: {
        ...updatedData.props,
        conditionalRender: {
          mappedFieldOwnerId: getEditorItemId(
            updatedData.props.slots.CardsWrapperSlot?.[0]
          ),
          watchForMappedContentEmptyState: isMappedCardWrapperSelected(
            updatedData.props.slots.CardsWrapperSlot?.[0]
          ),
        },
      },
    };
  },
  render: (props) => {
    const watchForMappedContentEmptyState =
      props.conditionalRender?.watchForMappedContentEmptyState ?? false;
    const { setWrapperRef, isMappedContentEmpty } =
      useMappedEntitySectionEmptyState({
        enabled: watchForMappedContentEmptyState,
      });
    const cardsWrapperSlot = (
      <props.slots.CardsWrapperSlot style={{ height: "auto" }} allow={[]} />
    );

    return (
      <ComponentErrorBoundary
        isEditing={props.puck.isEditing}
        resetKeys={[props]}
      >
        <AnalyticsScopeProvider
          name={`${props.analytics?.scope ?? "eventsSection"}${getAnalyticsScopeHash(props.id)}`}
        >
          <VisibilityWrapper
            liveVisibility={props.liveVisibility}
            isEditing={props.puck.isEditing}
          >
            {watchForMappedContentEmptyState && isMappedContentEmpty ? (
              props.puck.isEditing ? (
                <>
                  <EntityFieldSectionEmptyState
                    backgroundColor={props.styles.backgroundColor}
                    targetItemId={props.conditionalRender?.mappedFieldOwnerId}
                  />
                  <div
                    ref={setWrapperRef}
                    className="hidden"
                    aria-hidden="true"
                  >
                    {cardsWrapperSlot}
                  </div>
                </>
              ) : (
                <></>
              )
            ) : (
              <EventSectionWrapper
                {...props}
                setCardsWrapperRef={setWrapperRef}
              />
            )}
          </VisibilityWrapper>
        </AnalyticsScopeProvider>
      </ComponentErrorBoundary>
    );
  },
};
