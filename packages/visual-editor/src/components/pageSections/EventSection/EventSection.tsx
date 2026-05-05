import { PuckComponent, setDeep, Slot } from "@puckeditor/core";
import {
  ThemeColor,
  backgroundColors,
  ThemeOptions,
} from "../../../utils/themeConfigOptions.ts";
import { YextField } from "../../../editor/YextField.tsx";
import { PageSection } from "../../atoms/pageSection.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics.ts";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import {
  EventCardsWrapper,
  type EventCardsWrapperProps,
} from "./EventCardsWrapper.tsx";
import { forwardHeadingLevel } from "../../../utils/cardSlots/forwardHeadingLevel.ts";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import { hasResolvedMappedListSource } from "../../../utils/cardSlots/mappedSource.ts";

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
  hasResolvedSource?: boolean;

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const eventSectionFields: YextFields<EventSectionProps> = {
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
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
      scope: {
        label: msg("fields.scope", "Scope"),
        type: "text",
      },
    },
  }),
  liveVisibility: {
    label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
    type: "radio",
    options: [
      { label: msg("fields.options.show", "Show"), value: true },
      { label: msg("fields.options.hide", "Hide"), value: false },
    ],
  },
};

const EventSectionWrapper: PuckComponent<EventSectionProps> = (props) => {
  const { styles, slots, hasResolvedSource, puck } = props;

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
 * The Events Section component is designed to display a curated list of events. It features a prominent section heading and renders each event as an individual card, making it ideal for showcasing upcoming activities, workshops, or promotions.
 * Available on Location templates.
 */
export const EventSection: YextComponentConfig<EventSectionProps> = {
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
            ...(EventCardsWrapper.defaultProps as EventCardsWrapperProps),
          } satisfies EventCardsWrapperProps,
        },
      ],
    },
    analytics: {
      scope: "eventsSection",
    },
    liveVisibility: true,
  },
  resolveData: (data, params) => {
    const wrapperProps = data.props.slots.CardsWrapperSlot?.[0]
      ?.props as unknown as EventCardsWrapperProps | undefined;
    const hasResolvedSource =
      !wrapperProps ||
      hasResolvedMappedListSource({
        streamDocument: params.metadata.streamDocument ?? {},
        constantValueEnabled: wrapperProps.data.constantValueEnabled,
        fieldPath: wrapperProps.data.field,
      });

    return setDeep(
      forwardHeadingLevel(data, "TitleSlot"),
      "props.hasResolvedSource",
      hasResolvedSource
    );
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
