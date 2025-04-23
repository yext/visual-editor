import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  YextEntityField,
  useDocument,
  resolveYextEntityField,
  Heading,
  Body,
  Image,
  YextCollection,
  resolveYextSubfield,
  handleResolveFieldsForCollections,
  CTAProps,
  EntityField,
  CTA,
  YextField,
} from "@yext/visual-editor";
import { ImageType } from "@yext/pages-components";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/360x200";

export type EventCardProps = {
  card?: {
    title: YextEntityField<string>;
    image: YextEntityField<ImageType>;
    dateTime: YextEntityField<string>;
    description: YextEntityField<string>;
    cta: YextEntityField<CTAProps>;
  };
  collection?: YextCollection;
};

const EventCardItemFields: Fields<EventCardProps> = {};

const EventCardItem = ({
  document,
  card,
}: {
  document: any;
  card: EventCardProps["card"];
}) => {
  const resolvedImage = resolveYextSubfield(document, card?.image);
  const resolvedTitle = resolveYextSubfield<string>(document, card?.title);
  const resolvedDateTime = resolveYextSubfield<string>(
    document,
    card?.dateTime
  );
  const resolvedDescription = resolveYextSubfield<string>(
    document,
    card?.description
  );
  const resolvedCTA = resolveYextSubfield<CTAProps>(document, card?.cta);

  return (
    <div className="flex flex-col md:flex-row rounded-lg overflow-hidden bg-white text-black h-fit md:h-64">
      <div className="lg:w-[45%] w-full h-full">
        {resolvedImage && (
          <EntityField
            displayName="Image"
            fieldId={card?.image?.field}
            constantValueEnabled={card?.image?.constantValueEnabled}
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
            fieldId={card?.title?.field}
            constantValueEnabled={card?.title?.constantValueEnabled}
          >
            <Heading level={3}>{resolvedTitle}</Heading>
          </EntityField>
        )}
        {resolvedDateTime && (
          <EntityField
            displayName="Date/Time"
            fieldId={card?.dateTime?.field}
            constantValueEnabled={card?.dateTime?.constantValueEnabled}
          >
            <Body variant="base">{resolvedDateTime}</Body>
          </EntityField>
        )}
        {resolvedDescription && (
          <EntityField
            displayName="Description"
            fieldId={card?.description?.field}
            constantValueEnabled={card?.description?.constantValueEnabled}
          >
            <Body variant="base" className="line-clamp-5">
              {resolvedDescription}
            </Body>
          </EntityField>
        )}
        {resolvedCTA?.link && (
          <EntityField
            displayName="CTA"
            fieldId={card?.cta?.field}
            constantValueEnabled={card?.cta?.constantValueEnabled}
          >
            <CTA
              label={resolvedCTA.label}
              link={resolvedCTA.link}
              linkType={resolvedCTA.linkType}
              variant="link"
              className="text-palette-primary-dark"
            />
          </EntityField>
        )}
      </div>
    </div>
  );
};

const EventCardComponent = (props: EventCardProps) => {
  const { card, collection } = props;
  const document = useDocument();

  // If not in a collection, return single card
  if (!collection || collection.items.constantValueEnabled) {
    return <EventCardItem document={document} card={card} />;
  }

  const { items, limit } = collection;

  // If in a collection, get and resolve the parent
  const resolvedParent = resolveYextEntityField(document, items);

  // Return one card with resolved subfields for each item in the parent
  return (
    <div className="flex flex-col justify-between max-w-pageSection-maxWidth mx-auto gap-8 items-center">
      {resolvedParent
        ?.slice(0, typeof limit !== "number" ? undefined : limit)
        .map((item, i) => {
          return <EventCardItem key={i} document={item} card={card} />;
        })}
    </div>
  );
};

export const EventCard: ComponentConfig<EventCardProps> = {
  label: "Event Card",
  fields: EventCardItemFields,
  resolveFields: (data, params) => {
    // Set the collection prop and determine how to update fields
    const { shouldReturnLastFields, isCollection, directChildrenFilter } =
      handleResolveFieldsForCollections(data, params);

    // Unnecessary field updates can lead to the fields losing focus
    if (shouldReturnLastFields) {
      return params.lastFields;
    }

    // Update each subfield based on isCollection
    return {
      ...params.lastFields,
      card: YextField("Card", {
        type: "object",
        objectFields: {
          title: YextField<any, string>("Title", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          image: YextField<any, ImageType>("Image", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.image"],
            },
          }),
          dateTime: YextField<any, string>("Date Time", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          description: YextField<any, string>("Description", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          cta: YextField<any, CTAProps>("CTA", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.cta"],
            },
          }),
        },
      }),
    };
  },
  defaultProps: {
    card: {
      image: {
        field: "",
        constantValue: { height: 200, width: 360, url: PLACEHOLDER_IMAGE_URL },
        constantValueEnabled: true,
      },
      title: {
        field: "",
        constantValue: "Event Title",
        constantValueEnabled: true,
      },
      dateTime: {
        field: "",
        constantValue: "12.12.2022  |  2 PM - 3 PM",
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue:
          "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters",
        constantValueEnabled: true,
      },
      cta: {
        field: "",
        constantValue: {
          label: "Learn more",
          link: "#",
          linkType: "URL",
        },
        constantValueEnabled: true,
      },
    },
  },
  render: (props) => <EventCardComponent {...props} />,
};
