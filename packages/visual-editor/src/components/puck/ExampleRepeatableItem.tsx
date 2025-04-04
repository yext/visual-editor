import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  Image,
  resolveYextSubfield,
  YextCollectionSubfieldSelector,
  handleResolveFieldsForCollections,
} from "../../index.js";
import { ComplexImageType, ImageType } from "@yext/pages-components";
import { useCollectionContext } from "./contexts/collectionContext.js";

export type ExampleRepeatableItemProps = {
  text: YextEntityField<string>;
  isCollection?: boolean;
  image: YextEntityField<ImageType>;
};

const ExampleRepeatableItemFields: Fields<ExampleRepeatableItemProps> = {
  text: YextCollectionSubfieldSelector<any, string>({
    label: "Text",
    isCollection: false,
    filter: {
      types: ["type.string"],
    },
  }),
  image: YextCollectionSubfieldSelector<any, ImageType>({
    label: "Image",
    isCollection: false,
    filter: {
      types: ["type.image"],
    },
  }),
};

const ExampleRepeatableItem = (props: ExampleRepeatableItemProps) => {
  const { text, image, isCollection } = props;
  const document = useDocument();

  const collectionContext = useCollectionContext();

  // If not in a collection, render a single card with normal entity fields
  if (!isCollection || !collectionContext) {
    const resolvedText = resolveYextEntityField(document, text);
    const resolvedImage = resolveYextEntityField(document, image);

    return (
      <div>
        <ExampleRepeatableItemCard image={resolvedImage} text={resolvedText} />
      </div>
    );
  }

  const { parentEntityField, limit } = collectionContext;
  // If in a collection, get and resolve the parent
  const resolvedParent = resolveYextEntityField(document, parentEntityField);

  // Return one card with resolved subfields for each item in the parent
  return (
    <div className="flex gap-4 max-w-pageSection-maxWidth">
      {resolvedParent?.slice(0, limit).map((item, i) => {
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
  const { text } = props;

  // Handle ImageType or ComplexImageType
  // Should clean up the image handling in a real card
  let image;
  if (
    props.image &&
    typeof props.image === "object" &&
    "image" in props.image
  ) {
    image = props.image.image;
  } else if (props.image) {
    image = props.image;
  }

  return (
    <div className="w-[200px] h-[200px] border-dashed border-black border-4 flex flex-col items-center justify-center">
      {image?.url && (
        <div className="mx-8">
          <Image image={image} layout="fixed" width={100} aspectRatio={1} />
        </div>
      )}
      {text && <p>{text}</p>}
    </div>
  );
};

export const ExampleRepeatableItemComponent: ComponentConfig<ExampleRepeatableItemProps> =
  {
    label: "Repeatable Card",
    fields: ExampleRepeatableItemFields,
    resolveFields: (data, params) => {
      const { parent, lastData, lastFields } = params;
      if (data === lastData) {
        return lastFields;
      }

      // Sets isCollection and clears fields when needed
      handleResolveFieldsForCollections(data, params);

      // If isCollection has not changed, do not update the fields.
      // Updating the fields will cause text fields to lose focus.
      if (lastData?.props.isCollection === data.props.isCollection) {
        return lastFields;
      }

      // Update each subfield based on isCollection
      return {
        ...lastFields,
        text: YextCollectionSubfieldSelector<any, string>({
          label: "Text",
          isCollection: data.props.isCollection,
          filter: {
            directChildrenOf: data.props.isCollection
              ? parent!.props.collection.items.field
              : undefined,
            types: ["type.string"],
          },
        }),
        image: YextCollectionSubfieldSelector<any, ImageType>({
          label: "Image",
          isCollection: data.props.isCollection,
          filter: {
            directChildrenOf: data.props.isCollection
              ? parent!.props.collection.items.field
              : undefined,
            types: ["type.image"],
          },
        }),
      };
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
