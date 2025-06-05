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
  MaybeRTF,
  TranslatableString,
  resolveTranslatableString,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";

export interface EventSectionProps {
  data: {
    heading: YextEntityField<TranslatableString>;
    events: YextEntityField<EventSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
    headingLevel: HeadingLevel;
  };
  analytics?: {
    scope?: string;
  };
  liveVisibility: boolean;
}

const eventSectionFields: Fields<EventSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField<any, TranslatableString>("Section Heading", {
        type: "entityField",
        filter: { types: ["type.string"] },
        isTranslatable: true,
      }),
      events: YextField("Events", {
        type: "entityField",
        filter: {
          types: [ComponentFields.EventSection.type],
        },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundColor: YextField("Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      cardBackgroundColor: YextField("Card Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      headingLevel: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
    },
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const EventCard = ({
  key,
  event,
  backgroundColor,
  sectionHeadingLevel,
}: {
  key: number;
  event: EventStruct;
  backgroundColor?: BackgroundStyle;
  sectionHeadingLevel: HeadingLevel;
}) => {
  return (
    <Background
      background={backgroundColor}
      className={`flex flex-col md:flex-row rounded-lg overflow-hidden h-fit md:h-64`}
    >
      <div className="lg:w-[45%] w-full h-full">
        {event.image && (
          <div className="h-full">
            <Image
              image={event.image}
              layout="auto"
              aspectRatio={event.image.width / event.image.height}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-6 w-full md:w-[55%]">
        {event.title && (
          <Heading
            level={6}
            semanticLevelOverride={
              sectionHeadingLevel < 6
                ? ((sectionHeadingLevel + 1) as HeadingLevel)
                : "span"
            }
          >
            {event.title}
          </Heading>
        )}
        {event.dateTime && (
          <Timestamp
            date={event.dateTime}
            option={TimestampOption.DATE_TIME}
            hideTimeZone={true}
          />
        )}
        <MaybeRTF data={event.description} />
        {event.cta && (
          <CTA
            eventName={`cta${key}`}
            label={event.cta.label}
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
  const { t } = useTranslation();
  const { data, styles } = props;
  const document = useDocument();
  const resolvedEvents = resolveYextEntityField(document, data.events);
  const resolvedHeading = resolveTranslatableString(
    resolveYextEntityField(document, data.heading)
  );

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <EntityField
          displayName={t("headingText", "Heading Text")}
          fieldId={data.heading.field}
          constantValueEnabled={data.heading.constantValueEnabled}
        >
          <div className="text-center">
            <Heading level={styles.headingLevel}>{resolvedHeading}</Heading>
          </div>
        </EntityField>
      )}
      {resolvedEvents?.events && (
        <EntityField
          displayName={t("events", "Events")}
          fieldId={data.events.field}
          constantValueEnabled={data.events.constantValueEnabled}
        >
          <div className="flex flex-col gap-8">
            {resolvedEvents.events.map((event, index) => (
              <EventCard
                key={index}
                event={event}
                backgroundColor={styles.cardBackgroundColor}
                sectionHeadingLevel={styles.headingLevel}
              />
            ))}
          </div>
        </EntityField>
      )}
    </PageSection>
  );
};

export const EventSection: ComponentConfig<EventSectionProps> = {
  label: "Events Section",
  fields: eventSectionFields,
  defaultProps: {
    data: {
      heading: {
        field: "",
        constantValue: "Upcoming Events",
        constantValueEnabled: true,
      },
      events: {
        field: "",
        constantValue: {
          events: [],
        },
      },
    },
    styles: {
      backgroundColor: backgroundColors.background3.value,
      cardBackgroundColor: backgroundColors.background1.value,
      headingLevel: 2,
    },
    analytics: {
      scope: "eventSection",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "eventSection"}>
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <EventSectionWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
