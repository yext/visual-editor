import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
  Slot,
} from "@puckeditor/core";
import { backgroundColors } from "../../utils/themeConfigOptions.ts";
import { Body } from "../atoms/body.tsx";
import { MaybeLink } from "../atoms/maybeLink.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import { PageSection } from "../atoms/pageSection.tsx";
import { CardContextProvider } from "../../hooks/useCardContext.tsx";
import { sortAlphabetically } from "../../utils/directory/utils.ts";
import { defaultDirectoryCardSlotData } from "./DirectoryCard.tsx";
import { StreamDocument } from "../../utils/types/StreamDocument.ts";
import { resolveDirectoryListChildren } from "../../utils/urls/resolveDirectoryListChildren.ts";

export type DirectoryGridProps = {
  slots: {
    CardSlot: Slot;
  };
};

export const DirectoryList = ({
  streamDocument,
  directoryChildren,
  relativePrefixToRoot,
}: {
  streamDocument: StreamDocument;
  directoryChildren: any[];
  relativePrefixToRoot: string;
}) => {
  const sortedDirectoryChildren = sortAlphabetically(directoryChildren, "name");

  return (
    <PageSection
      verticalPadding="sm"
      background={backgroundColors.background1.value}
    >
      <ul className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
        {sortedDirectoryChildren.map((child, idx) => {
          const childSlug = resolveDirectoryListChildren(streamDocument, child);
          let label;
          switch (streamDocument?.dm_directoryChildren?.meta?.entityType?.id) {
            case "dm_root":
              label = child.name;
              break;
            case "dm_country":
              label = child.c_addressCountryDisplayName ?? child.name;
              break;
            case "dm_region":
              label = child.c_addressRegionDisplayName ?? child.name;
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
                href={
                  relativePrefixToRoot
                    ? relativePrefixToRoot + childSlug
                    : childSlug
                }
              >
                <Body>{label}</Body>
              </MaybeLink>
            </li>
          );
        })}
      </ul>
    </PageSection>
  );
};

const directoryGridFields: Fields<DirectoryGridProps> = {
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
};

const DirectoryGridWrapper: PuckComponent<DirectoryGridProps> = (props) => {
  const { slots } = props;

  return (
    <CardContextProvider>
      <PageSection
        verticalPadding="sm"
        background={backgroundColors.background1.value}
        className={"flex min-h-0 min-w-0 mx-auto"}
      >
        <slots.CardSlot
          className="flex min-h-0 min-w-0 mx-auto flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
          allow={[]}
          style={{ height: "auto" }}
        />
      </PageSection>
    </CardContextProvider>
  );
};

export const DirectoryGrid: ComponentConfig<{
  props: DirectoryGridProps;
}> = {
  label: msg("components.directoryGrid", "Directory Grid"),
  fields: directoryGridFields,
  defaultProps: {
    slots: {
      CardSlot: [],
    },
  },
  resolveData: (data, params) => {
    const streamDocument = params.metadata.streamDocument;

    if (!streamDocument?.dm_directoryChildren) {
      return data;
    }

    const sortedDirectoryChildren = sortAlphabetically(
      streamDocument.dm_directoryChildren,
      "name"
    );

    const requiredLength = sortedDirectoryChildren?.length ?? 0;

    // If the current CardSlots match the directory children
    // and length is correct, return data with no changes
    if (
      data.props.slots.CardSlot.map(
        (card, i) =>
          card.props.parentData?.profile === sortedDirectoryChildren[i]
      ).every((match) => match) &&
      data.props.slots.CardSlot.length === requiredLength
    ) {
      return data;
    }

    // Update CardSlots data but preserve the existing styles and slot configurations
    const updatedCards = Array(requiredLength)
      .fill(null)
      .map((_, i) =>
        defaultDirectoryCardSlotData(
          `DirectoryCard-${crypto.randomUUID()}`,
          i,
          sortedDirectoryChildren[i],
          data.props.slots?.CardSlot?.[0]?.props.styles,
          data.props.slots?.CardSlot?.[0]?.props.slots
        )
      );

    data = setDeep(data, "props.slots.CardSlot", updatedCards);
    return data;
  },
  render: (props) => <DirectoryGridWrapper {...props} />,
};
