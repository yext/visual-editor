import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
  Slot,
} from "@measured/puck";
import {
  backgroundColors,
  Body,
  MaybeLink,
  msg,
  PageSection,
} from "@yext/visual-editor";
import { CardContextProvider } from "../../hooks/useCardContext.tsx";
import { sortAlphabetically } from "../../utils/directory/utils";
import { defaultDirectoryCardSlotData } from "./DirectoryCard.tsx";

export type DirectoryGridProps = {
  slots: {
    CardSlot: Slot;
  };
};

export const DirectoryList = ({
  directoryChildren,
  relativePrefixToRoot,
  level,
}: {
  directoryChildren: any[];
  relativePrefixToRoot: string;
  level: string;
}) => {
  const sortedDirectoryChildren = sortAlphabetically(directoryChildren, "name");

  return (
    <PageSection
      verticalPadding="sm"
      background={backgroundColors.background1.value}
    >
      <ul className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
        {sortedDirectoryChildren.map((child, idx) => {
          let label;
          switch (level) {
            case "dm_root":
              label = child.dm_addressCountryDisplayName ?? child.name;
              break;
            case "dm_country":
              label = child.dm_addressRegionDisplayName ?? child.name;
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
                    ? relativePrefixToRoot + child.slug
                    : child.slug
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
  label: msg("components.DirectoryGrid", "Directory Grid"),
  fields: directoryGridFields,
  defaultProps: {
    slots: {
      CardSlot: [],
    },
  },
  resolveData: (data, params) => {
    const streamDocument = params.metadata.streamDocument;

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

    // Update CardSlots data but not styles
    const updatedCards = Array(requiredLength)
      .fill(null)
      .map((_, i) =>
        defaultDirectoryCardSlotData(
          `DirectoryCard-${crypto.randomUUID()}`,
          i,
          sortedDirectoryChildren[i],
          data.props.slots?.CardSlot[i]?.props.styles
        )
      );

    data = setDeep(data, "props.slots.CardSlot", updatedCards);
    return data;
  },
  render: (props) => <DirectoryGridWrapper {...props} />,
};
