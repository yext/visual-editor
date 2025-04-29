import * as React from "react";
import { ComponentConfig, Field, Fields } from "@measured/puck";
import {
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  resolveYextSubfield,
  handleResolveFieldsForCollections,
  YextCollection,
  BackgroundStyle,
  backgroundColors,
  CTA,
  Body,
  Heading,
  Image,
  Background,
  YextField,
  CTAProps,
  ImageWrapperProps,
} from "@yext/visual-editor";
import { ImageWrapperFields } from "../contentBlocks/Image.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/360x200";

export type ProductCardProps = {
  card?: {
    image?: ImageWrapperProps;
    heading?: YextEntityField<string>;
    category?: YextEntityField<string>;
    description?: YextEntityField<string>;
    cta?: YextEntityField<CTAProps>;
  };
  styles: {
    cardBackgroundColor?: BackgroundStyle;
  };
  collection?: YextCollection;
};

const ProductCardItemFields: Fields<ProductCardProps> = {
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      cardBackgroundColor: YextField("Card Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
    },
  }),
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
  const resolvedImage = resolveYextSubfield(document, card?.image?.image);
  const resolvedHeading = resolveYextSubfield(document, card?.heading);
  const resolvedCategory = resolveYextSubfield(document, card?.category);
  const resolvedDescription = resolveYextSubfield(document, card?.description);
  const resolvedCta = resolveYextSubfield(document, card?.cta);

  return (
    <Background
      className="flex flex-col justify-between rounded-lg overflow-hidden border h-full"
      background={cardBackgroundColor}
    >
      {resolvedImage && card?.image && (
        <Image
          image={resolvedImage}
          layout={card.image.layout}
          width={card.image.width}
          height={card.image.height}
          aspectRatio={card.image.aspectRatio}
        />
      )}
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
            <Body className="max-w-[290px]">{resolvedDescription}</Body>
          )}
        </div>
        {resolvedCta?.link && (
          <CTA
            variant="secondary"
            label={resolvedCta.label}
            link={resolvedCta.link}
            linkType={resolvedCta.linkType}
          />
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
        ?.map((item, i) => {
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

    // Unnecessary field updates can lead to the fields losing focus, but it should update if image layout changes
    if (
      shouldReturnLastFields &&
      data.props.card?.image?.layout ===
        params.lastData?.props?.card?.image?.layout
    ) {
      return params.lastFields;
    }

    // Update each subfield based on isCollection
    return {
      ...params.lastFields,
      card: YextField("Card", {
        type: "object",
        objectFields: {
          image: YextField("Image", {
            type: "object",
            objectFields: {
              image: YextField<any, ImageWrapperProps>("Image", {
                type: "entityField",
                isCollection: isCollection,
                filter: {
                  directChildrenOf: directChildrenFilter,
                  types: ["type.image"],
                },
              }),
              layout: ImageWrapperFields["layout"],
              ...(data.props.card?.image?.layout === "auto"
                ? {
                    aspectRatio: ImageWrapperFields[
                      "aspectRatio"
                    ] as Field<number>,
                  }
                : {
                    height: ImageWrapperFields["height"] as Field<number>,
                    width: ImageWrapperFields["width"] as Field<number>,
                  }),
            },
          }),
          heading: YextField<any, string>("Heading", {
            type: "entityField",
            isCollection: isCollection,
            filter: {
              directChildrenOf: directChildrenFilter,
              types: ["type.string"],
            },
          }),
          category: YextField<any, string>("Category", {
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
    } as Fields<ProductCardProps>;
  },
  defaultProps: {
    card: {
      image: {
        image: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            url: PLACEHOLDER_IMAGE_URL,
            width: 360,
            height: 200,
          },
        },
        layout: "auto",
        aspectRatio: 2,
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
        constantValue: {
          label: "Learn More",
          link: "#",
          linkType: "URL",
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      cardBackgroundColor: backgroundColors.background1.value,
    },
  },
  render: (props) => <ProductCardComponent {...props} />,
};
