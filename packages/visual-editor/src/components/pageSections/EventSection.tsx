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
} from "@yext/visual-editor";
import { ComplexImageType, CTA as CTAType } from "@yext/pages-components";
import { Timestamp, TimestampOption } from "../atoms/timestamp.tsx";

/** TODO remove types when spruce is ready */
type Events = Array<EventStruct>;

type EventStruct = {
  image?: ComplexImageType;
  title?: string; // single line text
  dateTime?: dateTime; // lexon's dateTime
  description?: RTF2;
  CTA?: CTAType;
};

type dateTime = {
  start: string; // ISO 8601
  end: string; //  ISO 8601
};

type RTF2 = {
  html?: string;
  json?: Record<string, any>;
};
/** end of hardcoded types */

export interface EventSectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingLevel;
  };
  events: YextEntityField<Events>;
  liveVisibility: boolean;
}

const eventSectionFields: Fields<EventSectionProps> = {
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
    },
  }),
  sectionHeading: YextField("Section Heading", {
    type: "object",
    objectFields: {
      text: YextField<any, string>("Heading Text", {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      level: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
    },
  }),
  events: YextField("Events", {
    type: "entityField",
    filter: {
      types: ["type.events"],
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
}: {
  event: EventStruct;
  backgroundColor?: BackgroundStyle;
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
              aspectRatio={event.image.image.width / event.image.image.height}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-6 w-full md:w-[55%]">
        {event.title && <Heading level={6}>{event.title}</Heading>}
        {event.dateTime?.start && (
          <Timestamp
            date={event.dateTime.start}
            endDate={event.dateTime.end}
            option={
              event.dateTime.end
                ? TimestampOption.DATE_TIME_RANGE
                : TimestampOption.DATE_TIME
            }
            hideTimeZone={true}
          />
        )}
        {event.description?.html && (
          <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
            <div dangerouslySetInnerHTML={{ __html: event.description.html }} />
          </div>
        )}
        {event.CTA && (
          <CTA
            label={event.CTA.label}
            link={event.CTA.link}
            linkType={event.CTA.linkType}
            variant="link"
          />
        )}
      </div>
    </Background>
  );
};

const EventSectionWrapper: React.FC<EventSectionProps> = (props) => {
  const { styles, sectionHeading, events } = props;
  const document = useDocument();
  const resolvedEvents = resolveYextEntityField(document, events);
  const resolvedHeading = resolveYextEntityField(document, sectionHeading.text);

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <EntityField
          displayName="Heading Text"
          fieldId={sectionHeading.text.field}
          constantValueEnabled={sectionHeading.text.constantValueEnabled}
        >
          <div className="text-center">
            <Heading level={sectionHeading.level}>{resolvedHeading}</Heading>
          </div>
        </EntityField>
      )}
      {resolvedEvents && (
        <EntityField
          displayName="Events"
          fieldId={events.field}
          constantValueEnabled={events.constantValueEnabled}
        >
          <div className="flex flex-col gap-8">
            {resolvedEvents.map((event, index) => (
              <EventCard
                key={index}
                event={event}
                backgroundColor={styles.cardBackgroundColor}
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
    styles: {
      backgroundColor: backgroundColors.background3.value,
      cardBackgroundColor: backgroundColors.background1.value,
    },
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Upcoming Events",
        constantValueEnabled: true,
      },
      level: 2,
    },
    events: {
      field: "", // TODO set to default
      constantValue: [],
      constantValueEnabled: false,
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
