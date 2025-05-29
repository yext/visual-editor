import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  YextEntityField,
  useDocument,
  resolveYextEntityField,
  Heading,
  Body,
  Background,
  backgroundColors,
  BackgroundStyle,
  YextCollection,
  resolveYextSubfield,
  handleResolveFieldsForCollections,
  YextField,
  i18n,
} from "@yext/visual-editor";

export type TestimonialCardProps = {
  card?: {
    testimonial: YextEntityField<string>;
    authorName: YextEntityField<string>;
    date: YextEntityField<string>;
  };
  styles: {
    cardBackgroundColor?: BackgroundStyle;
  };
  collection?: YextCollection;
};

const TestimonialCardItemFields: Fields<TestimonialCardProps> = {
  styles: YextField(i18n("Styles"), {
    type: "object",
    objectFields: {
      cardBackgroundColor: YextField(i18n("Card Background Color"), {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
    },
  }),
};

const TestimonialCardItem = ({
  document,
  card,
  cardBackgroundColor,
}: {
  document: any;
  card: TestimonialCardProps["card"];
  cardBackgroundColor?: BackgroundStyle;
}) => {
  const resolvedTestimonial = resolveYextSubfield(document, card?.testimonial);
  const resolvedAuthorName = resolveYextSubfield(document, card?.authorName);
  const resolvedDate = resolveYextSubfield(document, card?.date);

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border h-full">
      <Background
        background={backgroundColors.background1.value}
        className="p-8"
      >
        {resolvedTestimonial && <Body>{resolvedTestimonial}</Body>}
      </Background>
      <Background background={cardBackgroundColor} className="p-8">
        {resolvedAuthorName && (
          <Heading level={3}>{resolvedAuthorName}</Heading>
        )}
        {resolvedDate && <Body variant="sm">{resolvedDate}</Body>}
      </Background>
    </div>
  );
};

const TestimonialCardComponent = (props: TestimonialCardProps) => {
  const { card, styles, collection } = props;
  const document = useDocument();

  // If not in a collection, return single card
  if (!collection || collection.items.constantValueEnabled) {
    return (
      <TestimonialCardItem
        document={document}
        card={card}
        cardBackgroundColor={styles.cardBackgroundColor}
      />
    );
  }

  const { items, limit } = collection;

  // If in a collection, get and resolve the parent
  const resolvedParent = resolveYextEntityField(document, items);

  // Return one card with resolved subfields for each item in the parent
  return (
    <div className="max-w-pageSection-contentWidth mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
      {resolvedParent
        ?.slice(0, typeof limit !== "number" ? undefined : limit)
        ?.map((item, i) => {
          return (
            <TestimonialCardItem
              key={i}
              document={item}
              card={card}
              cardBackgroundColor={styles.cardBackgroundColor}
            />
          );
        })}
    </div>
  );
};

export const TestimonialCard: ComponentConfig<TestimonialCardProps> = {
  label: i18n("Testimonial Card"),
  fields: TestimonialCardItemFields,
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
      card: YextField(i18n("Card"), {
        type: "object",
        objectFields: {
          testimonial: YextField<any, string>(i18n("Testimonial"), {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          authorName: YextField<any, string>(i18n("Author Name"), {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          date: YextField<any, string>(i18n("Date"), {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
        },
      }),
    } as Fields<TestimonialCardProps>;
  },
  defaultProps: {
    card: {
      testimonial: {
        field: "",
        constantValue:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        constantValueEnabled: true,
      },
      authorName: {
        field: "",
        constantValue: "Name",
        constantValueEnabled: true,
      },
      date: {
        field: "",
        constantValue: "July 22, 2022",
        constantValueEnabled: true,
      },
    },
    styles: {
      cardBackgroundColor: backgroundColors.background2.value,
    },
  },
  render: (props) => <TestimonialCardComponent {...props} />,
};
