import * as React from "react";
import { ComponentConfig, Fields, ArrayField } from "@measured/puck";
import {
  YextEntityField,
  YextEntityFieldSelector,
  useDocument,
  resolveYextEntityField,
  BasicSelector,
  ThemeOptions,
  Heading,
  HeadingLevel,
  Body,
  Section,
  backgroundColors,
  BackgroundStyle,
  EntityField,
  CTA,
  CTAProps,
  Image,
  ImageProps,
  ImageWrapperProps,
} from "../../index.js";
import { resolvedImageFields, ImageWrapperFields } from "./Image.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface EventsProps {
  backgroundColor?: BackgroundStyle;
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingLevel;
  };
  events: Array<{
    title: YextEntityField<string>;
    image: ImageWrapperProps;
    dateTime: YextEntityField<string>;
    description: YextEntityField<string>;
    cta: YextEntityField<CTAProps>;
  }>;
}

interface EventCardProps {
  title: YextEntityField<string>;
  image: ImageWrapperProps;
  dateTime: YextEntityField<string>;
  description: YextEntityField<string>;
  cta: YextEntityField<CTAProps>;
  index: number;
}

const eventsFields: Fields<EventsProps> = {
  backgroundColor: BasicSelector(
    "Background Color",
    ThemeOptions.BACKGROUND_COLOR
  ),
  sectionHeading: {
    type: "object",
    label: "Section Heading",
    objectFields: {
      text: YextEntityFieldSelector<any, string>({
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      }),
      level: BasicSelector("Heading Level", ThemeOptions.HEADING_LEVEL),
    },
  },
  events: {
    type: "array",
    label: "Events",
    arrayFields: {
      title: YextEntityFieldSelector<any, string>({
        label: "Title",
        filter: {
          types: ["type.string"],
        },
      }),
      image: {
        type: "object",
        label: "Image",
        objectFields: {
          ...ImageWrapperFields,
        },
      },
      dateTime: YextEntityFieldSelector<any, string>({
        label: "Date/Time",
        filter: {
          types: ["type.string"],
        },
      }),
      description: YextEntityFieldSelector<any, string>({
        label: "Description",
        filter: {
          types: ["type.string"],
        },
      }),
      cta: YextEntityFieldSelector<any, CTAProps>({
        label: "CTA",
        filter: {
          types: ["type.cta"],
        },
      }),
    },
  },
};

const EventCard: React.FC<EventCardProps> = ({
  title,
  image,
  dateTime,
  description,
  cta,
  index,
}) => {
  const document = useDocument();
  const resolvedImage = resolveYextEntityField<ImageProps["image"]>(
    document,
    image?.image
  );
  const resolvedTitle = resolveYextEntityField<string>(document, title);
  const resolvedDateTime = resolveYextEntityField<string>(document, dateTime);
  const resolvedDescription = resolveYextEntityField<string>(
    document,
    description
  );
  const resolvedCTA = resolveYextEntityField<CTAProps>(document, cta);

  return (
    <div
      key={index}
      className="flex flex-col md:flex-row rounded-lg overflow-hidden bg-white text-black h-64"
    >
      <div className="w-full md:w-[45%] h-full">
        {resolvedImage && (
          <EntityField
            displayName="Image"
            fieldId={image?.image?.field}
            constantValueEnabled={image?.image?.constantValueEnabled}
          >
            <div className="h-full">
              <Image image={resolvedImage} layout="auto" aspectRatio={1.77} />
            </div>
          </EntityField>
        )}
      </div>
      <div className="flex flex-col gap-2 p-6 w-full md:w-[55%]">
        {resolvedTitle && (
          <EntityField
            displayName="Title"
            fieldId={title.field}
            constantValueEnabled={title.constantValueEnabled}
          >
            <Heading level={6}>{resolvedTitle}</Heading>
          </EntityField>
        )}
        {resolvedDateTime && (
          <EntityField
            displayName="Date/Time"
            fieldId={dateTime.field}
            constantValueEnabled={dateTime.constantValueEnabled}
          >
            <Body variant="base">{resolvedDateTime}</Body>
          </EntityField>
        )}
        {resolvedDescription && (
          <EntityField
            displayName="Description"
            fieldId={description.field}
            constantValueEnabled={description.constantValueEnabled}
          >
            <Body variant="base" className="line-clamp-5">
              {resolvedDescription}
            </Body>
          </EntityField>
        )}
        {resolvedCTA && (
          <EntityField
            displayName="CTA"
            fieldId={cta.field}
            constantValueEnabled={cta.constantValueEnabled}
          >
            <CTA
              label={resolvedCTA?.label}
              link={resolvedCTA?.link || "#"}
              linkType={resolvedCTA?.linkType}
              variant="link"
              className="text-palette-primary-dark"
            />
          </EntityField>
        )}
      </div>
    </div>
  );
};

const EventsWrapper: React.FC<EventsProps> = (props) => {
  const { backgroundColor, sectionHeading, events } = props;
  const document = useDocument();
  const resolvedHeading = resolveYextEntityField<string>(
    document,
    sectionHeading.text
  );

  return (
    <Section background={backgroundColor} className="components">
      <div className="flex flex-col gap-12 p-8">
        {resolvedHeading && (
          <div className="text-center">
            <Heading level={sectionHeading.level}>{resolvedHeading}</Heading>
          </div>
        )}
        <div className="flex flex-col gap-8">
          {events.map((event, index) => (
            <EventCard key={index} {...event} index={index} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export const Events: ComponentConfig<EventsProps> = {
  label: "Events",
  fields: eventsFields,
  defaultProps: {
    backgroundColor: backgroundColors.background1.value,
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Upcoming Events",
        constantValueEnabled: true,
      },
      level: 3,
    },
    events: [
      {
        title: {
          field: "",
          constantValue: "Event Title",
          constantValueEnabled: true,
        },
        image: {
          image: {
            field: "",
            constantValue: {
              url: PLACEHOLDER_IMAGE_URL,
              height: 360,
              width: 640,
            },
            constantValueEnabled: true,
          },
          layout: "fixed",
          aspectRatio: 1,
        },
        dateTime: {
          field: "",
          constantValue: "12.12.2022  |  2 PM - 3 PM",
          constantValueEnabled: true,
        },
        description: {
          field: "",
          constantValue:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
          constantValueEnabled: true,
        },
        cta: {
          field: "",
          constantValue: {
            label: "Learn More",
            link: "#",
            linkType: "URL",
          },
          constantValueEnabled: true,
        },
      },
      {
        title: {
          field: "",
          constantValue: "Event Title",
          constantValueEnabled: true,
        },
        image: {
          image: {
            field: "",
            constantValue: {
              url: PLACEHOLDER_IMAGE_URL,
              height: 360,
              width: 640,
            },
            constantValueEnabled: true,
          },
          layout: "fixed",
          aspectRatio: 1,
        },
        dateTime: {
          field: "",
          constantValue: "12.12.2022  |  2 PM - 3 PM",
          constantValueEnabled: true,
        },
        description: {
          field: "",
          constantValue:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
          constantValueEnabled: true,
        },
        cta: {
          field: "",
          constantValue: {
            label: "Learn More",
            link: "#",
            linkType: "URL",
          },
          constantValueEnabled: true,
        },
      },
      {
        title: {
          field: "",
          constantValue: "Event Title",
          constantValueEnabled: true,
        },
        image: {
          image: {
            field: "",
            constantValue: {
              url: PLACEHOLDER_IMAGE_URL,
              height: 360,
              width: 640,
            },
            constantValueEnabled: true,
          },
          layout: "fixed",
          aspectRatio: 1,
        },
        dateTime: {
          field: "",
          constantValue: "12.12.2022  |  2 PM - 3 PM",
          constantValueEnabled: true,
        },
        description: {
          field: "",
          constantValue:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
          constantValueEnabled: true,
        },
        cta: {
          field: "",
          constantValue: {
            label: "Learn More",
            link: "#",
            linkType: "URL",
          },
          constantValueEnabled: true,
        },
      },
    ],
  },
  resolveFields() {
    const fields = { ...eventsFields };
    const eventsField = fields.events as ArrayField<
      Omit<EventCardProps, "index">[]
    >;

    // Always include the image fields with default layout
    const existingArrayFields = eventsField.arrayFields;
    eventsField.arrayFields = {
      ...existingArrayFields,
      image: {
        type: "object",
        label: "Image",
        objectFields: resolvedImageFields("fixed"),
      },
    };
    fields.events = eventsField;

    return fields;
  },
  render: (props) => <EventsWrapper {...props} />,
};
