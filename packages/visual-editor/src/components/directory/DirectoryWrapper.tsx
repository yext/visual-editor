import {
  ComponentConfig,
  ComponentData,
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
  themeManagerCn,
} from "@yext/visual-editor";
import { CardContextProvider } from "../../hooks/useCardContext.tsx";
import { sortAlphabetically } from "../../utils/directory/utils";
import {
  defaultDirectoryCardSlotData,
  DirectoryCardProps,
} from "./DirectoryCard.tsx";

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
        className={themeManagerCn("flex min-h-0 min-w-0 mx-auto")}
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
    const currentLength = data.props.slots.CardSlot.length;

    if (requiredLength === currentLength) {
      return data;
    }

    const cardsToAdd =
      currentLength < requiredLength
        ? Array(requiredLength - currentLength)
            .fill(null)
            .map(() =>
              defaultDirectoryCardSlotData(
                `DirectoryCard-${crypto.randomUUID()}`
              )
            )
        : [];

    const updatedCardSlot = [...data.props.slots.CardSlot, ...cardsToAdd].slice(
      0,
      requiredLength
    ) as ComponentData<DirectoryCardProps>[];

    data = setDeep(
      data,
      "props.slots.CardSlot",
      updatedCardSlot.map((card, i) => {
        card.props.index = i;
        return setDeep(card, "props.parentData", {
          profile: sortedDirectoryChildren[i],
        });
      })
    );
    return data;
  },
  render: (props) => <DirectoryGridWrapper {...props} />,
};
