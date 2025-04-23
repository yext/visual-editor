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
  YextCollection,
  CardCategory,
  themeManagerCn,
  YextField,
  VisibilityWrapper,
} from "@yext/visual-editor";

export interface CollectionProps {
  collection: YextCollection;
  shouldClearDropZone?: boolean;
  layout?: "grid" | "flex";
  direction?: "flex-row" | "flex-col";
  liveVisibility: boolean;
}

const collectionFields: Fields<CollectionProps> = {
  collection: YextField("Collection", {
    type: "object",
    objectFields: {
      items: YextField<any, Array<any>>("Items", {
        type: "entityField",
        isCollection: true,
        filter: {
          includeListsOnly: true,
        },
      }),
      limit: YextField("Items Limit", {
        type: "optionalNumber",
        hideNumberFieldRadioLabel: "All",
        showNumberFieldRadioLabel: "Limit",
        defaultCustomValue: 3,
      }),
    },
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const CollectionSectionWrapper: React.FC<
  WithId<WithPuckProps<CollectionProps>>
> = (props) => {
  const { shouldClearDropZone, id, layout, direction } = props;

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
        "max-w-pageSection-contentWidth mx-auto gap-8",
        layout === "grid" && props.collection.items.constantValueEnabled
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "flex flex-wrap justify-center",
        direction
      )}
      allow={CardCategory}
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
      return {
        ...fields,
        layout: YextField("Layout", {
          type: "radio",
          options: [
            { label: "Flex", value: "flex" },
            { label: "Grid", value: "grid" },
          ],
        }),
        ...(data.props.layout === "flex"
          ? {
              direction: YextField("Direction", {
                type: "radio",
                options: [
                  { label: "Horizontal", value: "flex-row" },
                  { label: "Vertical", value: "flex-col" },
                ],
              }),
            }
          : {}),
      };
    }
    return {
      ...fields,
      collection: {
        ...fields.collection,
        objectFields: {
          // @ts-expect-error ts(2339) objectFields exists
          ...fields.collection.objectFields,
          limit: YextField("Items Limit", {
            type: "optionalNumber",
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
    layout: "flex",
    direction: "flex-row",
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
      iconSize="md"
    >
      <CollectionSectionWrapper {...props} />
    </VisibilityWrapper>
  ),
};
