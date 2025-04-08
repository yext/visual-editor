import * as React from "react";
import { Fields, ComponentConfig, DropZone } from "@measured/puck";
import {
  useDocument,
  Heading,
  HeadingProps,
  Section,
  YextEntityFieldSelector,
  YextEntityField,
  BasicSelector,
  ThemeOptions,
  backgroundColors,
  SectionProps,
  resolveYextEntityField,
  OptionalNumberField,
  YextCollection,
} from "../../index.js";

export const COLLECTION_COMPONENTS = ["ExampleRepeatableItemComponent"];

export interface CollectionSectionProps {
  styles: {
    background: SectionProps["background"];
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingProps["level"];
  };
  collection: YextCollection;
}

const collectionSectionFields: Fields<CollectionSectionProps> = {
  styles: {
    type: "object",
    label: "Styles",
    objectFields: {
      background: BasicSelector("Background", ThemeOptions.BACKGROUND_COLOR),
    },
  },
  sectionHeading: {
    type: "object",
    label: "Section Heading",
    objectFields: {
      text: YextEntityFieldSelector<any, string>({
        label: "Section Heading Text",
        filter: { types: ["type.string"] },
      }),
      level: BasicSelector("Heading Level", ThemeOptions.HEADING_LEVEL),
    },
  },
  collection: {
    type: "object",
    label: "Collection",
    objectFields: {
      items: YextEntityFieldSelector<any, Array<any>>({
        label: "Items",
        isCollection: true,
        filter: {
          includeListsOnly: true,
        },
      }),
      limit: OptionalNumberField({
        fieldLabel: "Items Limit",
        hideNumberFieldRadioLabel: "All",
        hideNumberFieldRadioValue: "all",
        showNumberFieldRadioLabel: "Limit",
        defaultCustomValue: 3,
      }),
    },
  },
};

const CollectionSectionWrapper: React.FC<CollectionSectionProps> = (props) => {
  const { styles, sectionHeading } = props;
  const document = useDocument();

  const resolvedHeadingText = resolveYextEntityField<string>(
    document,
    sectionHeading.text
  );

  return (
    <Section background={styles.background}>
      {resolvedHeadingText && (
        <Heading level={sectionHeading.level}>{resolvedHeadingText}</Heading>
      )}
      <DropZone
        zone="collection-dropzone"
        allow={COLLECTION_COMPONENTS}
        className="flex gap-4 flex-wrap"
      />
    </Section>
  );
};

export const CollectionSection: ComponentConfig<CollectionSectionProps> = {
  label: "Collection Section",
  fields: collectionSectionFields,
  resolveFields: (data, { fields }) => {
    // Add or remove the Items limit field based on whether
    // the constant value is enabled
    if (data.props.collection.items.constantValueEnabled) {
      // @ts-expect-error ts(2339)
      delete fields.collection.objectFields.limit;
      return fields;
    }
    return {
      ...fields,
      collection: {
        ...fields.collection,
        objectFields: {
          // @ts-expect-error ts(2339) objectFields exists
          ...fields.collection.objectFields,
          limit: OptionalNumberField({
            fieldLabel: "Items Limit",
            hideNumberFieldRadioLabel: "All",
            hideNumberFieldRadioValue: "all",
            showNumberFieldRadioLabel: "Limit",
            defaultCustomValue: 3,
          }),
        },
      },
    };
  },
  defaultProps: {
    styles: {
      background: backgroundColors.background1.value,
    },
    sectionHeading: {
      level: 3,
      text: {
        field: "",
        constantValueEnabled: true,
        constantValue: "New Section",
      },
    },
    collection: {
      items: {
        field: "",
        constantValue: [],
        constantValueEnabled: true,
      },
      limit: 3,
    },
  },
  render: (props) => <CollectionSectionWrapper {...props} />,
};
