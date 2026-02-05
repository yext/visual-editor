import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import {
  BackgroundStyle,
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
    backgroundColor?: BackgroundStyle;

    /**
     * Whether or not to show the section heading.
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

const EventSectionWrapper: PuckComponent<EventSectionProps> = (props) => {
  const { styles, slots } = props;

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
                constantValue: {
                  en: "Upcoming Events",
                  hasLocalizedValue: "true",
                },
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
    return forwardHeadingLevel(data, "TitleSlot");
  },
  render: (props) => (
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
          <EventSectionWrapper {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    </ComponentErrorBoundary>
  ),
};
