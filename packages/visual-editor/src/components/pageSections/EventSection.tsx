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
  Body,
  Heading,
  EntityField,
  Background,
  CTA,
  backgroundColors,
} from "@yext/visual-editor";
import {
  ComplexImageType,
  CTA as CTAType,
  LexicalRichText,
} from "@yext/pages-components";

/** TODO remove types when spruce is ready */
type Events = Array<EventStruct>;

type EventStruct = {
  image?: ComplexImageType;
  title?: string; // single line text
  dateTime?: string; // lexon's dateTime
  description?: RTF2;
  CTA?: CTAType;
};

type RTF2 = {
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
  events: YextField("Event Section", {
    type: "entityField",
    filter: {
      types: ["type.events"],
    },
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
            <Image image={event.image} layout="auto" aspectRatio={1.77} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-6 w-full md:w-[55%]">
        {event.title && <Heading level={6}>{event.title}</Heading>}
        {event.dateTime && <Body variant="base">{event.dateTime}</Body>}
        {event.description && (
          <Body variant="base" className="line-clamp-5">
            <LexicalRichText
              serializedAST={JSON.stringify(event.description.json) ?? ""}
            />
          </Body>
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
        <div className="flex flex-col gap-8">
          {resolvedEvents.map((event, index) => (
            <EventCard
              key={index}
              event={event}
              backgroundColor={styles.cardBackgroundColor}
            />
          ))}
        </div>
      )}
    </PageSection>
  );
};

export const EventSection: ComponentConfig<EventSectionProps> = {
  label: "Events Section",
  fields: eventSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
      cardBackgroundColor: backgroundColors.background2.value,
    },
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Upcoming Events",
        constantValueEnabled: true,
      },
      level: 3,
    },
    events: {
      field: "",
      constantValue: [],
      constantValueEnabled: false,
    },
  },
  render: (props) => <EventSectionWrapper {...props} />,
};
