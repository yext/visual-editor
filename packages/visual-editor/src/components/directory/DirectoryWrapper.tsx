import React from "react";
import { PuckComponent, Slot } from "@puckeditor/core";
import {
  backgroundColors,
  ThemeColor,
} from "../../utils/themeConfigOptions.ts";
import { Body } from "../atoms/body.tsx";
import { MaybeLink } from "../atoms/maybeLink.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import { PageSection } from "../atoms/pageSection.tsx";
import { CardContextProvider } from "../../hooks/useCardContext.tsx";
import {
  isDirectoryGrid,
  sortAlphabetically,
} from "../../utils/directory/utils.ts";
import {
  defaultDirectoryCardSlotData,
  DirectoryCardProps,
} from "./DirectoryCard.tsx";
import { StreamDocument } from "../../utils/types/StreamDocument.ts";
import { resolveDirectoryListChildren } from "../../utils/urls/resolveDirectoryListChildren.ts";
import { getThemeValue } from "../../utils/getThemeValue.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import {
  createDirectoryChildReference,
  DirectoryChildrenProvider,
  getSortedDirectoryChildren,
} from "./directoryChildReference.tsx";
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";
import { createSlottedItemSource } from "../../utils/itemSource/index.ts";
import { syncLinkedSlotMappedCards } from "../../utils/cardSlots/slotMappedCards.ts";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";

export type DirectoryGridProps = {
  data: typeof directoryCardsSource.value;
  styles: {
    backgroundColor?: ThemeColor;
  };
  /** @internal */
  manualSlots?: {
    CardSlot: Slot;
  };
  slots: {
    CardSlot: Slot;
  };
};

const directoryCardsSource = createSlottedItemSource<
  DirectoryCardProps["data"],
  DirectoryCardProps
>({
  label: msg("components.directoryChildren", "Directory Children"),
  itemLabel: "Directory Card",
  cardName: "DirectoryCard",
  defaultItemProps: () =>
    defaultDirectoryCardSlotData("DirectoryCard", 0).props,
  mappingFields: {
    cardTitle: {
      type: "entityField",
      label: msg("fields.name", "Name"),
      filter: {
        types: ["type.string"],
      },
    },
  },
});

// The linked entity slot helper allows field selection and constant values
// however the directory should be locked to the dm_directoryChildren field.
const getNormalizedDirectoryGridData = (
  value: typeof directoryCardsSource.value | undefined
): typeof directoryCardsSource.value => ({
  ...directoryCardsSource.defaultValue,
  ...value,
  field: "dm_directoryChildren",
  constantValueEnabled: false,
  constantValue: [],
  mappings: {
    ...directoryCardsSource.defaultValue.mappings!,
    ...value?.mappings,
    cardTitle: {
      ...directoryCardsSource.defaultValue.mappings!.cardTitle,
      ...value?.mappings?.cardTitle,
      field: value?.mappings?.cardTitle?.field || "name",
    },
  },
});

export const DirectoryList = ({
  streamDocument,
  directoryChildren,
  relativePrefixToRoot,
  backgroundColor,
  linkColor,
}: {
  streamDocument: StreamDocument;
  directoryChildren: {
    id: string;
    name: string;
    slug: string;
    meta?: {
      entityType?: {
        id: "dm_country" | "dm_region" | "dm_city";
      };
    };
    dm_addressCountryDisplayName?: string;
    dm_addressRegionDisplayName?: string;
  }[];
  relativePrefixToRoot: string;
  backgroundColor: ThemeColor;
  linkColor?: ThemeColor;
}) => {
  const sortedDirectoryChildren = sortAlphabetically(
    [...directoryChildren],
    "name"
  );
  const linkTextTransformValue = (
    getThemeValue("--textTransform-link-textTransform", streamDocument) ?? ""
  ).toLowerCase();
  const shouldTitleCase =
    linkTextTransformValue === "none" || linkTextTransformValue === "normal";

  return (
    <PageSection verticalPadding="sm" background={backgroundColor}>
      <ul className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
        {sortedDirectoryChildren.map((child, idx) => {
          const childSlug = resolveDirectoryListChildren(streamDocument, child);
          let label;
          switch (child?.meta?.entityType?.id) {
            case "dm_country":
              label = child.dm_addressCountryDisplayName ?? child.name;
              break;
            case "dm_region":
              label = child.dm_addressRegionDisplayName ?? child.name;
              break;
            case "dm_city":
              label = child.name;
              break;
            default:
              label = child.name;
          }

          return (
            <li key={idx}>
              <MaybeLink
                eventName={`child${idx}`}
                variant="directoryLink"
                color={linkColor}
                href={
                  relativePrefixToRoot
                    ? relativePrefixToRoot + childSlug
                    : childSlug
                }
              >
                <Body
                  style={{
                    textTransform: shouldTitleCase
                      ? ("capitalize" as React.CSSProperties["textTransform"])
                      : ("var(--textTransform-link-textTransform)" as React.CSSProperties["textTransform"]),
                  }}
                >
                  {label}
                </Body>
              </MaybeLink>
            </li>
          );
        })}
      </ul>
    </PageSection>
  );
};

const directoryGridFields: YextFields<DirectoryGridProps> = {
  data: {
    ...directoryCardsSource.field,
    disableConstantValueToggle: true,
    fixedRepeatedField: "dm_directoryChildren",
  },
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      backgroundColor: {
        type: "basicSelector",
        label: msg("fields.backgroundColor", "Background Color"),
        options: "BACKGROUND_COLOR",
      },
    },
  },
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
  manualSlots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
};

const DirectoryGridWrapper: PuckComponent<DirectoryGridProps> = (props) => {
  const { styles, slots } = props;
  const streamDocument = useDocument<StreamDocument>();
  const sortedDirectoryChildren = React.useMemo(
    () => getSortedDirectoryChildren(streamDocument.dm_directoryChildren),
    [streamDocument.dm_directoryChildren]
  );

  return (
    <DirectoryChildrenProvider directoryChildren={sortedDirectoryChildren}>
      <CardContextProvider>
        <PageSection
          verticalPadding="sm"
          background={styles.backgroundColor}
          className={"flex min-h-0 min-w-0 mx-auto"}
        >
          <slots.CardSlot
            className="flex min-h-0 min-w-0 mx-auto flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
            allow={[]}
            style={{ height: "auto" }}
          />
        </PageSection>
      </CardContextProvider>
    </DirectoryChildrenProvider>
  );
};

export const DirectoryGrid: YextComponentConfig<DirectoryGridProps> = {
  label: msg("components.directoryGrid", "Directory Grid"),
  fields: directoryGridFields,
  defaultProps: {
    ...directoryCardsSource.defaultWrapperProps,
    data: getNormalizedDirectoryGridData(directoryCardsSource.defaultValue),
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
  },
  resolveData: (data, params) => {
    const streamDocument = params.metadata.streamDocument;

    if (
      !streamDocument?.dm_directoryChildren ||
      !isDirectoryGrid(streamDocument.dm_directoryChildren)
    ) {
      return data;
    }

    const sortedDirectoryChildren = getSortedDirectoryChildren(
      streamDocument.dm_directoryChildren
    );
    const normalizedData = getNormalizedDirectoryGridData(data.props.data);
    const titleField = normalizedData.mappings?.cardTitle.constantValueEnabled
      ? ""
      : normalizedData.mappings?.cardTitle.field || "name";
    const titleItems = directoryCardsSource.resolveItems(normalizedData, {
      ...streamDocument,
      dm_directoryChildren: sortedDirectoryChildren,
    });
    const firstCardProps = data.props.slots?.CardSlot?.[0]?.props;
    const updatedCards = syncLinkedSlotMappedCards({
      items: sortedDirectoryChildren.map((child, index) => ({
        child,
        childIndex: index,
      })),
      currentCards: data.props.slots.CardSlot,
      createCard: (id, index) =>
        defaultDirectoryCardSlotData(
          id,
          index,
          createDirectoryChildReference(sortedDirectoryChildren[index], index),
          firstCardProps?.styles,
          firstCardProps?.slots
        ),
      toParentData: ({ child, childIndex }) => ({
        childRef: createDirectoryChildReference(child, childIndex),
      }),
      normalizeId: (id) => `DirectoryCard-${id}`,
    }).map((card, index) => ({
      ...card,
      props: {
        ...card.props,
        field: titleField,
        data: {
          cardTitle:
            titleItems[index]?.cardTitle !== undefined
              ? resolveComponentData(
                  titleItems[index].cardTitle,
                  streamDocument.locale || "en",
                  streamDocument,
                  { output: "plainText" }
                )
              : "[[name]]",
        },
      },
    }));

    return {
      ...data,
      props: {
        ...data.props,
        data: normalizedData,
        slots: {
          ...data.props.slots,
          CardSlot: updatedCards,
        },
      },
    };
  },
  render: (props) => <DirectoryGridWrapper {...props} />,
};
