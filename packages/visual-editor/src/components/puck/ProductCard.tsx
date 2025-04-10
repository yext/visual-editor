import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  resolveYextSubfield,
  YextCollectionSubfieldSelector,
  handleResolveFieldsForCollections,
  YextCollection,
  BackgroundStyle,
  BasicSelector,
  ThemeOptions,
  backgroundColors,
  Section,
  CTA,
  Body,
  Heading,
  Image,
  themeManagerCn,
} from "../../index.js";
import { ImageType } from "@yext/pages-components";
import { handleComplexImages } from "./atoms/image.js";

export type ProductCardProps = {
  card?: {
    image?: YextEntityField<ImageType>;
    heading?: YextEntityField<string>;
    category?: YextEntityField<string>;
    description?: YextEntityField<string>;
    cta?: YextEntityField<string>;
  };
  styles: {
    cardBackgroundColor?: BackgroundStyle;
  };
  collection?: YextCollection;
};

const ProductCardItemFields: Fields<ProductCardProps> = {
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

const ProductCardItem = ({
  document,
  card,
  cardBackgroundColor,
}: {
  document: any;
  card: ProductCardProps["card"];
  cardBackgroundColor?: BackgroundStyle;
}) => {
  const resolvedImage = resolveYextSubfield(document, card?.image);
  const image = handleComplexImages(resolvedImage);
  const resolvedHeading = resolveYextSubfield(document, card?.heading);
  const resolvedCategory = resolveYextSubfield(document, card?.category);
  const resolvedDescription = resolveYextSubfield(document, card?.description);
  const resolvedCta = resolveYextSubfield(document, card?.cta);

  return (
    <Section
      className="flex flex-col rounded-lg overflow-hidden border"
      background={cardBackgroundColor}
    >
      {image && <Image image={image} layout={"auto"} />}
      <div className="p-8 gap-8 flex flex-col">
        <div className="gap-4 flex flex-col">
          {resolvedHeading && (
            <Heading level={3} className="mb-2">
              {resolvedHeading}
            </Heading>
          )}
          {resolvedCategory && (
            <div
              className={themeManagerCn(
                "components py-2 px-4 rounded-sm w-fit",
                backgroundColors.background5.value.bgColor,
                backgroundColors.background5.value.textColor
              )}
            >
              <Body>{resolvedCategory}</Body>
            </div>
          )}
          {resolvedDescription && (
            <Body className="line-clamp-5">{resolvedDescription}</Body>
          )}
        </div>
        {resolvedCta && (
          <CTA variant="secondary" label="Learn More" link={resolvedCta} />
        )}
      </div>
    </Section>
  );
};

const ProductCardComponent = (props: ProductCardProps) => {
  const { card, styles, collection } = props;
  const document = useDocument();

  // If not in a collection, return single card
  if (!collection || collection.items.constantValueEnabled) {
    return (
      <ProductCardItem
        document={document}
        card={{
          image: card?.image,
          heading: card?.heading,
          category: card?.category,
          description: card?.description,
          cta: card?.cta,
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
          return (
            <ProductCardItem
              key={i}
              document={item}
              card={{
                image: card?.image,
                heading: card?.heading,
                category: card?.category,
                description: card?.description,
                cta: card?.cta,
              }}
              cardBackgroundColor={styles.cardBackgroundColor}
            />
          );
        })}
    </div>
  );
};

export const ProductCard: ComponentConfig<ProductCardProps> = {
  label: "Product Card",
  fields: ProductCardItemFields,
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
          image: YextCollectionSubfieldSelector<any, ImageType>({
            label: "Image",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.image"],
            },
          }),
          heading: YextCollectionSubfieldSelector<any, string>({
            label: "Heading",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          category: YextCollectionSubfieldSelector<any, string>({
            label: "Category",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          description: YextCollectionSubfieldSelector<any, string>({
            label: "Description",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          cta: YextCollectionSubfieldSelector<any, string>({
            label: "CTA",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
        },
      },
    } as Fields<ProductCardProps>;
  },
  defaultProps: {
    card: {
      image: {
        field: "",
        constantValue: { height: 150, width: 150, url: "" },
        constantValueEnabled: false,
      },
      heading: {
        field: "",
        constantValue: "",
        constantValueEnabled: false,
      },
      category: {
        field: "",
        constantValue: "",
        constantValueEnabled: false,
      },
      description: {
        field: "",
        constantValue: "",
        constantValueEnabled: false,
      },
      cta: {
        field: "",
        constantValue: "",
        constantValueEnabled: false,
      },
    },
    styles: {
      cardBackgroundColor: backgroundColors.background1.value,
    },
  },
  render: (props) => <ProductCardComponent {...props} />,
};
