import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
  Slot,
} from "@puckeditor/core";
import { YextField } from "../../editor/YextField.tsx";
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
import { defaultDirectoryCardSlotData } from "./DirectoryCard.tsx";
import { StreamDocument } from "../../utils/types/StreamDocument.ts";
import { resolveDirectoryListChildren } from "../../utils/urls/resolveDirectoryListChildren.ts";
import { getThemeValue } from "../../utils/getThemeValue.ts";

export type DirectoryGridProps = {
  styles: {
    backgroundColor?: ThemeColor;
  };
  slots: {
    CardSlot: Slot;
  };
};

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
  const sortedDirectoryChildren = sortAlphabetically(directoryChildren, "name");
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

const directoryGridFields: Fields<DirectoryGridProps> = {
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        }
      ),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
};

const DirectoryGridWrapper: PuckComponent<DirectoryGridProps> = (props) => {
  const { slots, styles } = props;

  return (
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
  );
};

export const DirectoryGrid: ComponentConfig<{
  props: DirectoryGridProps;
}> = {
  label: msg("components.directoryGrid", "Directory Grid"),
  fields: directoryGridFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    slots: {
      CardSlot: [],
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
