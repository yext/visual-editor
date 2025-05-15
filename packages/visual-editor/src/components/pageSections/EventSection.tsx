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
  MaybeRTF,
} from "@yext/visual-editor";

export interface EventSectionProps {
  data: {
    heading: YextEntityField<string>;
    events: YextEntityField<EventSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
    headingLevel: HeadingLevel;
  };
  liveVisibility: boolean;
}

const eventSectionFields: Fields<EventSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField<any, string>("Section Heading", {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      events: YextField("Events", {
        type: "entityField",
        filter: {
          types: ["type.events_section"],
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
  event,
  backgroundColor,
  sectionHeadingLevel,
}: {
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
  const { data, styles } = props;
  const document = useDocument();
  const resolvedEvents = resolveYextEntityField(document, data.events);
  const resolvedHeading = resolveYextEntityField(document, data.heading);

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <EntityField
          displayName="Heading Text"
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
          displayName="Events"
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
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <EventSectionWrapper {...props} />
    </VisibilityWrapper>
  ),
};
