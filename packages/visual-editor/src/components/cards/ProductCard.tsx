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
  CTA,
  Body,
  Heading,
  Image,
  Background,
} from "@yext/visual-editor";
import { ImageType } from "@yext/pages-components";
import { handleComplexImages } from "../atoms/image.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/360x200";

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
    <Background
      className="flex flex-col justify-between rounded-lg overflow-hidden border"
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
            <Background
              background={backgroundColors.background5.value}
              className="py-2 px-4 rounded-sm w-fit"
            >
              <Body>{resolvedCategory}</Body>
            </Background>
          )}
          {resolvedDescription && (
            <Body className="line-clamp-5 max-w-[290px]">
              {resolvedDescription}
            </Body>
          )}
        </div>
        {resolvedCta && (
          <CTA variant="secondary" label="Learn More" link={resolvedCta} />
        )}
      </div>
    </Background>
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
    <div className="max-w-pageSection-contentWidth mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
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
        constantValue: { height: 200, width: 360, url: PLACEHOLDER_IMAGE_URL },
        constantValueEnabled: true,
      },
      heading: {
        field: "",
        constantValue: "Product Title",
        constantValueEnabled: true,
      },
      category: {
        field: "",
        constantValue: "Category, Pricing, etc",
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
        constantValue: "#",
        constantValueEnabled: true,
      },
    },
    styles: {
      cardBackgroundColor: backgroundColors.background1.value,
    },
  },
  render: (props) => <ProductCardComponent {...props} />,
};
