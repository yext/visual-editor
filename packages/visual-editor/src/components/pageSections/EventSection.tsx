import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
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
  TranslatableString,
  msg,
  pt,
  ThemeOptions,
  getAnalyticsScopeHash,
  CTAProps,
  resolveComponentData,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultEvent } from "../../internal/puck/constant-value-fields/EventSection.tsx";

export interface EventData {
  /**
   * The main heading for the entire events section.
   * @defaultValue "Upcoming Events" (constant)
   */
  heading: YextEntityField<TranslatableString>;

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

  /** Styling for the heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };

  /** Styling for all the cards. */
  cards: {
    headingLevel: HeadingLevel;
    backgroundColor?: BackgroundStyle;
    ctaVariant: CTAProps["variant"];
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
      heading: YextField<any, TranslatableString>(
        msg("fields.sectionHeading", "Section Heading"),
        {
          type: "entityField",
          filter: { types: ["type.string"] },
        }
      ),
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
      heading: YextField(msg("fields.heading", "Heading"), {
        type: "object",
        objectFields: {
          level: YextField(msg("fields.level", "Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          align: YextField(msg("fields.headingAlign", "Heading Align"), {
            type: "radio",
            options: ThemeOptions.ALIGNMENT,
          }),
        },
      }),
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
        },
      }),
    },
  }),
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
  ctaVariant: CTAProps["variant"];
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  return (
    <Background
      background={cardStyles.backgroundColor}
      className={`flex flex-col md:flex-row rounded-lg overflow-hidden h-fit md:h-64`}
    >
      <div className="lg:w-[45%] w-full h-full">
        {event.image && (
          <div className="h-full">
            <Image
              image={event.image}
              aspectRatio={
                event.image.width && event.image.height
                  ? event.image.width / event.image.height
                  : 1.78
              }
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-6 w-full md:w-[55%]">
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
        {event.description &&
          resolveComponentData(event.description, i18n.language)}
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

const EventSectionWrapper: React.FC<EventSectionProps> = (props) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const { data, styles } = props;
  const streamDocument = useDocument();
  const resolvedEvents = resolveComponentData(
    data.events,
    locale,
    streamDocument
  );
  const resolvedHeading = resolveComponentData(
    data.heading,
    locale,
    streamDocument
  );

  const justifyClass = styles?.heading?.align
    ? {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      }[styles.heading.align]
    : "justify-start";

  return (
    <PageSection
      background={styles?.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <EntityField
          displayName={pt("fields.heading", "Heading")}
          fieldId={data.heading.field}
          constantValueEnabled={data.heading.constantValueEnabled}
        >
          <div className={`flex ${justifyClass}`}>
            <Heading level={styles?.heading?.level ?? 2}>
              {resolvedHeading}
            </Heading>
          </div>
        </EntityField>
      )}
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
                sectionHeadingLevel={styles.heading.level}
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
      heading: {
        field: "",
        constantValue: { en: "Upcoming Events", hasLocalizedValue: "true" },
        constantValueEnabled: true,
      },
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
      heading: {
        level: 2,
        align: "left",
      },
      cards: {
        headingLevel: 3,
        backgroundColor: backgroundColors.background1.value,
        ctaVariant: "primary",
      },
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
