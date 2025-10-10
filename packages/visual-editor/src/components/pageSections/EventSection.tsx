import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import {
  Image,
  HeadingLevel,
  BackgroundStyle,
  YextField,
  YextEntityField,
  useDocument,
  PageSection,
  Heading,
  EntityField,
  Background,
  CTA,
  backgroundColors,
  VisibilityWrapper,
  EventSectionType,
  EventStruct,
  Timestamp,
  TimestampOption,
  ComponentFields,
  msg,
  pt,
  getAnalyticsScopeHash,
  CTAVariant,
  resolveComponentData,
  imgSizesHelper,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultEvent } from "../../internal/puck/constant-value-fields/EventSection.tsx";

export interface EventData {
  /**
   * The source of event data, which can be linked to a Yext field or provided as a constant value.
   * @defaultValue A list of 3 placeholder events.
   */
  events: YextEntityField<EventSectionType>;
}

export interface EventStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 3
   */
  backgroundColor?: BackgroundStyle;

  /** Styling for all the cards. */
  cards: {
    /** The h tag level of each event card's title */
    headingLevel: HeadingLevel;
    /** The background color of each event card */
    backgroundColor?: BackgroundStyle;
    /** The CTA variant to use in each event card */
    ctaVariant: CTAVariant;
    /** Whether to truncate the event description text */
    truncateDescription: boolean;
  };
}

export interface EventSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: EventData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: EventStyles;

  slots: {
    SectionHeadingSlot: Slot;
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
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      events: YextField(msg("fields.events", "Events"), {
        type: "entityField",
        filter: {
          types: [ComponentFields.EventSection.type],
        },
      }),
    },
  }),
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
      cards: YextField(msg("fields.cards", "Cards"), {
        type: "object",
        objectFields: {
          headingLevel: YextField(msg("fields.headingLevel", "Heading Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          backgroundColor: YextField(
            msg("fields.backgroundColor", "Background Color"),
            {
              type: "select",
              options: "BACKGROUND_COLOR",
            }
          ),
          ctaVariant: YextField(msg("fields.ctaVariant", "CTA Variant"), {
            type: "radio",
            options: "CTA_VARIANT",
          }),
          truncateDescription: YextField(
            msg("fields.truncateDescription", "Truncate Description"),
            {
              type: "radio",
              options: [
                {
                  label: msg("fields.options.truncate", "Truncate"),
                  value: true,
                },
                {
                  label: msg("fields.options.showFullText", "Show Full Text"),
                  value: false,
                },
              ],
            }
          ),
        },
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      SectionHeadingSlot: { type: "slot" },
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

const EventCard = ({
  cardNumber,
  event,
  cardStyles,
  sectionHeadingLevel,
  ctaVariant,
}: {
  cardNumber: number;
  event: EventStruct;
  cardStyles: EventSectionProps["styles"]["cards"];
  sectionHeadingLevel: HeadingLevel;
  ctaVariant: CTAVariant;
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  return (
    <Background
      background={cardStyles.backgroundColor}
      className={`flex flex-col md:flex-row rounded-lg overflow-hidden md:items-start`}
    >
      {event.image && (
        <div className="lg:w-[45%] w-full">
          <Image
            image={event.image}
            aspectRatio={
              event.image.width && event.image.height
                ? event.image.width / event.image.height
                : 1.78
            }
            sizes={imgSizesHelper({
              base: "calc(100vw - 32px)",
              lg: "calc(maxWidth * 0.45)",
            })}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-4 p-6 w-full md:w-[55%] justify-between flex-grow">
        <div className="flex flex-col gap-2">
          {event.title && (
            <Heading
              level={cardStyles.headingLevel}
              semanticLevelOverride={
                sectionHeadingLevel < 6
                  ? ((sectionHeadingLevel + 1) as HeadingLevel)
                  : "span"
              }
            >
              {resolveComponentData(event.title, i18n.language, streamDocument)}
            </Heading>
          )}
          {event.dateTime && (
            <Timestamp
              date={event.dateTime}
              option={TimestampOption.DATE_TIME}
              hideTimeZone={true}
            />
          )}
          {event.description && (
            <p
              className={
                cardStyles.truncateDescription ? "md:line-clamp-2" : ""
              }
            >
              {resolveComponentData(event.description, i18n.language)}
            </p>
          )}
        </div>
        {event.cta && (
          <CTA
            eventName={`cta${cardNumber}`}
            label={resolveComponentData(
              event.cta.label,
              i18n.language,
              streamDocument
            )}
            link={resolveComponentData(
              event.cta.link,
              i18n.language,
              streamDocument
            )}
            linkType={event.cta.linkType}
            ctaType={event.cta.ctaType}
            coordinate={event.cta.coordinate}
            presetImageType={event.cta.presetImageType}
            variant={ctaVariant}
          />
        )}
      </div>
    </Background>
  );
};

const EventSectionWrapper: PuckComponent<EventSectionProps> = (props) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const { data, styles, slots } = props;
  const streamDocument = useDocument();
  const resolvedEvents = resolveComponentData(
    data.events,
    locale,
    streamDocument
  );

  return (
    <PageSection
      background={styles?.backgroundColor}
      className="flex flex-col gap-8"
    >
      <slots.SectionHeadingSlot allow={[]} />
      {resolvedEvents?.events && (
        <EntityField
          displayName={pt("fields.events", "Events")}
          fieldId={data.events.field}
          constantValueEnabled={data.events.constantValueEnabled}
        >
          <div className="flex flex-col gap-8">
            {resolvedEvents.events.map((event, index) => (
              <EventCard
                key={index}
                cardNumber={index}
                event={event}
                cardStyles={styles.cards}
                // TODO: think about how to handle section heading <-> card heading levels
                sectionHeadingLevel={2}
                ctaVariant={styles.cards.ctaVariant}
              />
            ))}
          </div>
        </EntityField>
      )}
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
    data: {
      events: {
        field: "",
        constantValue: {
          events: [defaultEvent, defaultEvent, defaultEvent],
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background3.value,
      cards: {
        headingLevel: 3,
        backgroundColor: backgroundColors.background1.value,
        ctaVariant: "primary",
        truncateDescription: true,
      },
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
    },
    analytics: {
      scope: "eventsSection",
    },
    liveVisibility: true,
  },
  render: (props) => (
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
  ),
};
