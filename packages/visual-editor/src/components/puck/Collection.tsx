import * as React from "react";
import {
  Fields,
  ComponentConfig,
  DropZone,
  usePuck,
  resolveAllData,
  WithPuckProps,
  WithId,
} from "@measured/puck";
import {
  YextEntityFieldSelector,
  OptionalNumberField,
  YextCollection,
  themeManagerCn,
} from "../../index.js";

export const COLLECTION_COMPONENTS = [
  "ExampleRepeatableItemComponent",
  "InsightCard",
  "ProductCard",
];

export interface CollectionProps {
  collection: YextCollection;
  shouldClearDropZone?: boolean;
}

export const collectionWrapperClassName =
  "flex flex-wrap gap-4 flex-col sm:flex-row items-center";

const collectionFields: Fields<CollectionProps> = {
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
        showNumberFieldRadioLabel: "Limit",
        defaultCustomValue: 3,
      }),
    },
  },
};

const CollectionSectionWrapper: React.FC<
  WithId<WithPuckProps<CollectionProps>>
> = (props) => {
  const { shouldClearDropZone, id } = props;

  try {
    const puck = usePuck();

    if (puck && shouldClearDropZone) {
      delete puck.appState.data.zones?.[id + ":collection-dropzone"];
      resolveAllData(puck.appState.data, puck.config).then((newData) => {
        puck.history.setHistories([
          ...puck.history.histories,
          {
            id: puck.history.histories[puck.history.index].id + "-cleared",
            state: { ...puck.appState, data: newData },
          },
        ]);
        puck.history.setHistoryIndex(puck.history.histories.length);
      });
    }
  } catch (e) {
    // usePuck will throw an error outside of the editor
    if (
      !(
        e instanceof Error &&
        e.message.includes("usePuck was used outside of the <Puck> component")
      )
    ) {
      console.warn(e);
    }
  }

  return (
    <DropZone
      zone="collection-dropzone"
      className={themeManagerCn(
        "max-w-pageSection-contentWidth mx-auto flex flex-wrap justify-center sm:flex-row items-center"
      )}
      allow={COLLECTION_COMPONENTS}
    />
  );
};

export const Collection: ComponentConfig<CollectionProps> = {
  label: "Collection",
  fields: collectionFields,
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
            showNumberFieldRadioLabel: "Limit",
            defaultCustomValue: 3,
          }),
        },
      },
    };
  },
  resolveData: (data, { lastData }) => {
    if (
      lastData &&
      data.props.collection.items.constantValueEnabled !==
        lastData?.props.collection.items.constantValueEnabled
    ) {
      data.props.shouldClearDropZone = true;
    } else {
      data.props.shouldClearDropZone = false;
    }

    return data;
  },
  defaultProps: {
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
