import React from "react";
import { FieldLabel, PuckComponent, Slot } from "@puckeditor/core";
import {
  backgroundColors,
  ThemeColor,
  ThemeOptions,
} from "../../utils/themeConfigOptions.ts";
import { Body } from "../atoms/body.tsx";
import { MaybeLink } from "../atoms/maybeLink.tsx";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { PageSection } from "../atoms/pageSection.tsx";
import { CardContextProvider } from "../../hooks/useCardContext.tsx";
import {
  isDirectoryGrid,
  sortAlphabetically,
} from "../../utils/directory/utils.ts";
import {
  createDefaultLinkOverrideFieldValue,
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
import {
  YextComponentConfig,
  type YextCustomFieldRenderProps,
  type YextFieldDefinition,
  YextFields,
} from "../../fields/fields.ts";
import { createSlottedItemSource } from "../../utils/itemSource/index.ts";
import { syncLinkedSlotMappedCards } from "../../utils/cardSlots/slotMappedCards.ts";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { YextAutoField } from "../../fields/YextAutoField.tsx";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../internal/puck/ui/Tooltip.tsx";
import { FaInfoCircle } from "react-icons/fa";
import { useTemplateMetadata } from "../../internal/hooks/useMessageReceivers.ts";

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

const DirectoryFieldTooltip = ({ content }: { content: string }) => {
  const templateMetadata = useTemplateMetadata();
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="ve-flex ve-h-4 ve-w-4 ve-items-center ve-justify-center ve-text-gray-500 hover:ve-text-gray-700"
          >
            <FaInfoCircle className="ve-h-4 ve-w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="ve-max-w-[260px] ve-text-left">
          {pt(content, { entityType: templateMetadata.entityTypeDisplayName })}
          <TooltipArrow fill="ve-bg-popover" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const linkOverrideField: YextFieldDefinition<
  DirectoryCardProps["data"]["linkOverride"]
> = {
  type: "custom",
  render: ({
    value,
    onChange,
  }: YextCustomFieldRenderProps<
    DirectoryCardProps["data"]["linkOverride"]
  >) => {
    const enabled = value?.enabled ?? false;
    const normalizeLink = value?.normalizeLink ?? false;
    const label = pt("fields.overrideLink", "Override Link");

    return (
      <FieldLabel
        label={label}
        icon={
          <DirectoryFieldTooltip
            content={msg(
              "linkOverrideDirectoryTooltip",
              "Use a custom URL path for each card's title link. If the value is empty, the generated directory URL will be used."
            )}
          />
        }
      >
        <div className="ve-flex ve-flex-col ve-gap-3">
          <YextAutoField
            field={{
              type: "radio",
              options: [
                { label: pt("fields.options.yes", "Yes"), value: true },
                { label: pt("fields.options.no", "No"), value: false },
              ],
            }}
            value={enabled}
            onChange={(nextEnabled) =>
              onChange({
                ...createDefaultLinkOverrideFieldValue(),
                ...value,
                enabled: nextEnabled,
              })
            }
          />
          {enabled && (
            <>
              <YextAutoField
                field={{
                  type: "entityField",
                  label: msg("fields.linkPath", "Link Path"),
                  filter: {
                    types: ["type.string"],
                  },
                  showApplyAllOption: true,
                }}
                value={value}
                onChange={(nextValue) =>
                  onChange({
                    ...nextValue,
                    enabled: true,
                  })
                }
              />
              <FieldLabel label={pt("fields.normalizeLink", "Normalize Link")}>
                <YextAutoField
                  field={{
                    type: "radio",
                    options: [
                      { label: pt("fields.options.yes", "Yes"), value: true },
                      { label: pt("fields.options.no", "No"), value: false },
                    ],
                  }}
                  value={normalizeLink}
                  onChange={(nextNormalizeLink) =>
                    onChange({
                      ...value,
                      normalizeLink: nextNormalizeLink,
                    })
                  }
                />
              </FieldLabel>
            </>
          )}
        </div>
      </FieldLabel>
    );
  },
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
    linkOverride: linkOverrideField,
    showAddress: {
      type: "radio",
      label: msg("fields.showAddress", "Show Address"),
      options: ThemeOptions.SHOW_HIDE,
    },
    showHoursStatus: {
      type: "radio",
      label: msg("fields.showHoursStatus", "Show Hours Status"),
      options: ThemeOptions.SHOW_HIDE,
    },
    showPhoneNumbers: {
      type: "radio",
      label: msg("fields.showPhoneNumber", "Show Phone Number"),
      options: ThemeOptions.SHOW_HIDE,
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
    linkOverride: {
      ...createDefaultLinkOverrideFieldValue(),
      ...value?.mappings?.linkOverride,
    },
    showAddress: value?.mappings?.showAddress ?? true,
    showHoursStatus: value?.mappings?.showHoursStatus ?? true,
    showPhoneNumbers: value?.mappings?.showPhoneNumbers ?? true,
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
    hideRequirementsTooltip: true,
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
    }).map((card, index) => {
      const cardTitle =
        titleItems[index]?.cardTitle !== undefined
          ? resolveComponentData(
              titleItems[index].cardTitle,
              streamDocument.locale || "en",
              streamDocument,
              { output: "plainText" }
            )
          : "[[name]]";
      const cardSlots = card.props.slots ?? {};

      return {
        ...card,
        props: {
          ...card.props,
          field: titleField,
          data: {
            ...card.props.data,
            cardTitle,
            linkOverride: normalizedData.mappings?.linkOverride,
            showAddress: normalizedData.mappings?.showAddress,
            showHoursStatus: normalizedData.mappings?.showHoursStatus,
            showPhoneNumbers: normalizedData.mappings?.showPhoneNumbers,
          },
          slots: {
            ...cardSlots,
            HeadingSlot: (cardSlots.HeadingSlot ?? []).map(
              (headingSlot, headingIndex) =>
                headingIndex === 0
                  ? {
                      ...headingSlot,
                      props: {
                        ...headingSlot.props,
                        parentData: {
                          field: titleField,
                          text: cardTitle,
                        },
                      },
                    }
                  : headingSlot
            ),
          },
        },
      };
    });

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
