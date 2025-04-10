import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  YextEntityField,
  useDocument,
  resolveYextEntityField,
  BasicSelector,
  ThemeOptions,
  Heading,
  Body,
  Section,
  backgroundColors,
  BackgroundStyle,
  YextCollection,
  resolveYextSubfield,
  handleResolveFieldsForCollections,
  YextCollectionSubfieldSelector,
} from "../../index.js";

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
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      cardBackgroundColor: BasicSelector(
        "Card Background Color",
        ThemeOptions.BACKGROUND_COLOR
      ),
    },
  },
};

const TestimonialCardWrapper = ({
  card,
  cardBackgroundColor,
}: {
  card: {
    testimonial: string;
    authorName: string;
    date: string;
  };
  cardBackgroundColor?: BackgroundStyle;
}) => {
  return (
    <div className={`flex flex-col rounded-lg overflow-hidden border`}>
      <Section background={backgroundColors.background1.value} className="p-8">
        {card.testimonial && (
          <Body className="line-clamp-5">{card.testimonial}</Body>
        )}
      </Section>
      <Section background={cardBackgroundColor} className="p-8">
        {card.authorName && <Heading level={3}>{card.authorName}</Heading>}
        {card.date && <Body variant="sm">{card.date}</Body>}
      </Section>
    </div>
  );
};

const TestimonialCardItem = (props: TestimonialCardProps) => {
  const { card, styles, collection } = props;
  const document = useDocument();

  // If not in a collection, return single card
  if (!collection || collection.items.constantValueEnabled) {
    const resolvedTestimonial = resolveYextSubfield(
      document,
      card?.testimonial
    );
    const resolvedAuthorName = resolveYextSubfield(document, card?.authorName);
    const resolvedDate = resolveYextSubfield(document, card?.date);

    return (
      <TestimonialCardWrapper
        card={{
          testimonial: resolvedTestimonial ?? "",
          authorName: resolvedAuthorName ?? "",
          date: resolvedDate ?? "",
        }}
        cardBackgroundColor={styles.cardBackgroundColor}
      />
    );
  }

  const { items, limit } = collection;

  // If in a collection, get and resolve the parent
  const resolvedParent = resolveYextEntityField(document, items);

  // Return one card with resolved subfields for each item in the parent
  return (
    <div className="flex justify-between max-w-pageSection-maxWidth">
      {resolvedParent
        ?.slice(0, typeof limit !== "number" ? undefined : limit)
        .map((item, i) => {
          const resolvedTestimonial = resolveYextSubfield(
            item,
            card?.testimonial
          );
          const resolvedAuthorName = resolveYextSubfield(
            item,
            card?.authorName
          );
          const resolvedDate = resolveYextSubfield(item, card?.date);

          return (
            <TestimonialCardWrapper
              key={i}
              card={{
                testimonial: resolvedTestimonial ?? "",
                authorName: resolvedAuthorName ?? "",
                date: resolvedDate ?? "",
              }}
              cardBackgroundColor={styles.cardBackgroundColor}
            />
          );
        })}
    </div>
  );
};

export const TestimonialCard: ComponentConfig<TestimonialCardProps> = {
  label: "Testimonial Card",
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
      card: {
        label: "Card",
        type: "object",
        objectFields: {
          testimonial: YextCollectionSubfieldSelector<any, string>({
            label: "Testimonial",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          authorName: YextCollectionSubfieldSelector<any, string>({
            label: "Author Name",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          date: YextCollectionSubfieldSelector<any, string>({
            label: "Date",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
        },
      },
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
  render: (props) => <TestimonialCardItem {...props} />,
};
