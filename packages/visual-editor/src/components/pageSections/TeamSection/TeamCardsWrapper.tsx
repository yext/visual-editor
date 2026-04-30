import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { TeamSectionType } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import {
  cardWrapperFields,
  CardWrapperType,
} from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import { defaultTeamCardSlotData, TeamCardProps } from "./TeamCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { YextComponentConfig } from "../../../fields/fields.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { buildListSectionCards } from "../../../utils/cardSlots/listSectionData.ts";
import { syncManualListCards } from "../../../utils/cardSlots/mappedListWrapper.ts";

export type TeamCardsWrapperProps = CardWrapperType<TeamSectionType> & {
  styles: {
    showImage: boolean;
    showTitle: boolean;
    showPhone: boolean;
    showEmail: boolean;
    showCTA: boolean;
  };
};

const teamCardsWrapperFields = {
  ...cardWrapperFields<TeamCardsWrapperProps>(
    msg("components.team", "Team"),
    ComponentFields.TeamSection.type
  ),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      showImage: {
        label: msg("fields.showImage", "Show Image"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showTitle: {
        label: msg("fields.showTitle", "Show Title"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showPhone: {
        label: msg("fields.showPhone", "Show Phone"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showEmail: {
        label: msg("fields.showEmail", "Show Email"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showCTA: {
        label: msg("fields.showCTA", "Show CTA"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
    },
  }),
};

const TeamCardsWrapperComponent: PuckComponent<TeamCardsWrapperProps> = (
  props
) => {
  const { slots } = props;

  return (
    <CardContextProvider>
      <slots.CardSlot
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center"
        allow={[]}
      />
    </CardContextProvider>
  );
};

export const TeamCardsWrapper: YextComponentConfig<TeamCardsWrapperProps> = {
  label: msg("components.teamCardsWrapper", "Team Cards"),
  fields: teamCardsWrapperFields,
  defaultProps: {
    data: {
      field: "",
      constantValueEnabled: true,
      constantValue: [],
    },
    styles: {
      showImage: true,
      showTitle: true,
      showPhone: true,
      showEmail: true,
      showCTA: true,
    },
    slots: {
      CardSlot: [],
    },
  },
  resolveData: (data, params) => {
    const streamDocument = params.metadata.streamDocument;
    const sharedCardProps =
      data.props.slots.CardSlot.length === 0
        ? undefined
        : {
            backgroundColor:
              data.props.slots.CardSlot[0].props.styles.backgroundColor,
            slotStyles: gatherSlotStyles(
              data.props.slots.CardSlot[0].props.slots
            ),
          };

    if (!data?.props?.data) {
      return data;
    }

    if (!data.props.data.constantValueEnabled && data.props.data.field) {
      const resolvedTeam = resolveYextEntityField<
        TeamSectionType | { people: undefined }
      >(
        streamDocument,
        {
          ...data.props.data,
          constantValue: { people: undefined },
        },
        i18nComponentsInstance.language || "en"
      )?.people;

      if (!resolvedTeam?.length) {
        return setDeep(data, "props.slots.CardSlot", []);
      }

      return setDeep(
        data,
        "props.slots.CardSlot",
        buildListSectionCards<TeamCardProps, TeamSectionType["people"][number]>(
          {
            currentCards: data.props.slots
              .CardSlot as ComponentData<TeamCardProps>[],
            createCard: () =>
              defaultTeamCardSlotData(
                `TeamCard-${crypto.randomUUID()}`,
                undefined,
                sharedCardProps?.backgroundColor,
                sharedCardProps?.slotStyles
              ) as ComponentData<TeamCardProps>,
            decorateCard: (card, person, index) =>
              setDeep(setDeep(card, "props.index", index), "props.parentData", {
                field: data.props.data.field,
                person,
              } satisfies TeamCardProps["parentData"]),
            items: resolvedTeam,
          }
        )
      );
    } else {
      if (!Array.isArray(data.props.data.constantValue)) {
        return setDeep(data, "props.data.constantValue", []);
      }

      const syncedCards = syncManualListCards<TeamCardProps>({
        currentCards: data.props.slots
          .CardSlot as ComponentData<TeamCardProps>[],
        constantValue: data.props.data.constantValue,
        createId: () => `TeamCard-${crypto.randomUUID()}`,
        createCard: (id, index) =>
          defaultTeamCardSlotData(
            id,
            index,
            sharedCardProps?.backgroundColor,
            sharedCardProps?.slotStyles
          ) as ComponentData<TeamCardProps>,
        fallbackToIndex: true,
        rewriteChildSlotIds: (card, newId) => {
          Object.entries(card.props.slots).forEach(([slotKey, slotArray]) => {
            slotArray[0].props.id = `${newId}-${slotKey}`;
          });
        },
      });
      return setDeep(
        setDeep(data, "props.slots.CardSlot", syncedCards.slots),
        "props.data.constantValue",
        syncedCards.constantValue
      );
    }
  },
  render: (props) => <TeamCardsWrapperComponent {...props} />,
};
