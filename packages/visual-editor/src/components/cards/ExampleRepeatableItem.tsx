import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  Image,
  resolveYextSubfield,
  handleResolveFieldsForCollections,
  Body,
  YextCollection,
  YextField,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType } from "@yext/pages-components";

export type ExampleRepeatableItemProps = {
  text?: YextEntityField<string>;
  image?: YextEntityField<ImageType>;
  collection?: YextCollection;
};

const ExampleRepeatableItemFields: Fields<ExampleRepeatableItemProps> = {
  // non-collection fields here
  // collection fields are defined in resolveFields
};

const ExampleRepeatableItem = (props: ExampleRepeatableItemProps) => {
  const { text, image, collection } = props;
  const document = useDocument();

  // If not in a collection, render a single card with normal entity fields
  if (!collection || collection.items.constantValueEnabled) {
    const resolvedText = text
      ? resolveYextEntityField(document, text)
      : undefined;
    const resolvedImage = image
      ? resolveYextEntityField(document, image)
      : undefined;

    return (
      <ExampleRepeatableItemCard image={resolvedImage} text={resolvedText} />
    );
  }

  const { items, limit } = collection;

  // If in a collection, get and resolve the parent
  const resolvedParent = resolveYextEntityField(document, items);

  // Return one card with resolved subfields for each item in the parent
  return (
    <div className="flex flex-col justify-between max-w-pageSection-maxWidth mx-auto gap-8 items-center">
      {resolvedParent
        ?.slice(0, typeof limit !== "number" ? undefined : limit)
        ?.map((item, i) => {
          const resolvedImage = resolveYextSubfield(item, image);
          const resolvedText = resolveYextSubfield(item, text);
          return (
            <ExampleRepeatableItemCard
              key={i}
              image={resolvedImage}
              text={resolvedText}
            />
          );
        })}
    </div>
  );
};

type ExampleRepeatableItemCardProps = {
  image?: ImageType | ComplexImageType;
  text?: string;
};

// Example Card -- would replace with a nice React component
const ExampleRepeatableItemCard = (props: ExampleRepeatableItemCardProps) => {
  const { image, text } = props;

  return (
    <div className="w-[200px] h-[200px] border-dashed border-black border-4 flex flex-col items-center justify-center">
      {image && (
        <div className="mx-8">
          <Image image={image} layout="fixed" width={100} aspectRatio={1} />
        </div>
      )}
      {text && <Body>{text}</Body>}
    </div>
  );
};

export const ExampleRepeatableItemComponent: ComponentConfig<ExampleRepeatableItemProps> =
  {
    label: "Repeatable Card",
    fields: ExampleRepeatableItemFields,
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
        text: YextField<any, string>("Text", {
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
      } as Fields<ExampleRepeatableItemProps>;
    },
    defaultProps: {
      text: {
        field: "",
        constantValue: "",
        constantValueEnabled: false,
      },
      image: {
        field: "",
        constantValue: { height: 150, width: 150, url: "" },
        constantValueEnabled: false,
      },
    },
    render: (props) => <ExampleRepeatableItem {...props} />,
  };
