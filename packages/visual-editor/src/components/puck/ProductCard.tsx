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
} from "../../index.js";
import { ImageType } from "@yext/pages-components";
import { ProductCard } from "./ProductsSection.js";
import { handleComplexImages } from "./ExampleRepeatableItem.js";

export type ProductCardProps = {
  card?: {
    image?: YextEntityField<ImageType>;
    heading?: YextEntityField<string>;
    category: YextEntityField<string>;
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

const ProductCardItem = (props: ProductCardProps) => {
  const { card, styles, collection } = props;
  const document = useDocument();

  // If not in a collection, nothing (TODO remove this once Card allow/disallow is set up)
  if (!collection || collection.items.constantValueEnabled) {
    return <></>;
  }

  const { items, limit } = collection;

  // If in a collection, get and resolve the parent
  const resolvedParent = resolveYextEntityField(document, items);

  // Return one card with resolved subfields for each item in the parent
  return (
    <div className="flex gap-4 max-w-pageSection-maxWidth">
      {resolvedParent
        ?.slice(0, typeof limit !== "number" ? undefined : limit)
        .map((item, i) => {
          const resolvedImage = resolveYextSubfield(item, card?.image);
          const image = handleComplexImages(resolvedImage);
          const resolvedHeading = resolveYextSubfield(item, card?.heading);
          const resolvedCategory = resolveYextSubfield(item, card?.category);
          const resolvedDescription = resolveYextSubfield(
            item,
            card?.description
          );
          const resolvedCta = resolveYextSubfield(item, card?.cta);

          return (
            <ProductCard
              key={i}
              card={{
                imageUrl: image?.url ?? "",
                heading: resolvedHeading ?? "",
                category: resolvedCategory ?? "",
                description: resolvedDescription ?? "",
                cta: resolvedCta ?? "",
              }}
              cardBackgroundColor={styles.cardBackgroundColor}
            />
          );
        })}
    </div>
  );
};

export const ProductCardComponent: ComponentConfig<ProductCardProps> = {
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
  render: (props) => <ProductCardItem {...props} />,
};
