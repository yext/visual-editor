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
  resolveYextEntityField,
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
  resolveTranslatableRichText,
  resolveTranslatableString,
  TranslatableString,
  msg,
  pt,
  ThemeOptions,
  getAnalyticsScopeHash,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultEvent } from "../../internal/puck/constant-value-fields/EventSection.tsx";

export interface EventSectionProps {
  data: {
    heading: YextEntityField<TranslatableString>;
    events: YextEntityField<EventSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    heading: {
      level: HeadingLevel;
      align: "left" | "center" | "right";
    };
    cards: {
      headingLevel: HeadingLevel;
      backgroundColor?: BackgroundStyle;
    };
  };
  analytics?: {
    scope?: string;
  };
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
        },
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
}: {
  cardNumber: number;
  event: EventStruct;
  cardStyles: EventSectionProps["styles"]["cards"];
}) => {
  const { i18n } = useTranslation();
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
          <Heading level={cardStyles.headingLevel}>
            {resolveTranslatableString(event.title, i18n.language)}
          </Heading>
        )}
        {event.dateTime && (
          <Timestamp
            date={event.dateTime}
            option={TimestampOption.DATE_TIME}
            hideTimeZone={true}
          />
        )}
        {resolveTranslatableRichText(event.description, i18n.language)}
        {event.cta && (
          <CTA
            eventName={`cta${cardNumber}`}
            label={resolveTranslatableString(event.cta.label, i18n.language)}
            link={event.cta.link}
            linkType={event.cta.linkType}
            variant="link"
          />
        )}
      </div>
    </Background>
  );
};

const EventSectionWrapper: React.FC<EventSectionProps> = (props) => {
  const { i18n } = useTranslation();
  const { data, styles } = props;
  const document = useDocument();
  const resolvedEvents = resolveYextEntityField(document, data.events);
  const resolvedHeading = resolveTranslatableString(
    resolveYextEntityField(document, data.heading),
    i18n.language
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
              />
            ))}
          </div>
        </EntityField>
      )}
    </PageSection>
  );
};

export const EventSection: ComponentConfig<EventSectionProps> = {
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
