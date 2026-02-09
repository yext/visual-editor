import {
  ComponentConfig,
  ComponentData,
  PuckComponent,
  setDeep,
} from "@puckeditor/core";
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
      showImage: YextField(msg("fields.showImage", "Show Image"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showTitle: YextField(msg("fields.showTitle", "Show Title"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showPhone: YextField(msg("fields.showPhone", "Show Phone"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showEmail: YextField(msg("fields.showEmail", "Show Email"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showCTA: YextField(msg("fields.showCTA", "Show CTA"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
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

export const TeamCardsWrapper: ComponentConfig<{
  props: TeamCardsWrapperProps;
}> = {
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

      const requiredLength = resolvedTeam.length;
      const currentLength = data.props.slots.CardSlot.length;
      const cardsToAdd =
        currentLength < requiredLength
          ? Array(requiredLength - currentLength)
              .fill(null)
              .map(() =>
                defaultTeamCardSlotData(
                  `TeamCard-${crypto.randomUUID()}`,
                  undefined,
                  sharedCardProps?.backgroundColor,
                  sharedCardProps?.slotStyles
                )
              )
          : [];
      const updatedCardSlot = [
        ...data.props.slots.CardSlot,
        ...cardsToAdd,
      ].slice(0, requiredLength) as ComponentData<TeamCardProps>[];

      return setDeep(
        data,
        "props.slots.CardSlot",
        updatedCardSlot.map((card, i) => {
          card.props.index = i;
          return setDeep(card, "props.parentData", {
            field: data.props.data.field,
            person: resolvedTeam[i],
          } satisfies TeamCardProps["parentData"]);
        })
      );
    } else {
      let updatedData = data;

      if (!Array.isArray(data.props.data.constantValue)) {
        updatedData = setDeep(updatedData, "props.data.constantValue", []);
        return updatedData;
      }

      const inUseIds = new Set<string>();
      const newSlots = data.props.data.constantValue.map(({ id }, i) => {
        const existingCard = id
          ? (data.props.slots.CardSlot.find(
              (slot) => slot.props.id === id
            ) as ComponentData<TeamCardProps>)
          : (data.props.slots.CardSlot[i] as
              | ComponentData<TeamCardProps>
              | undefined);

        let newCard = existingCard
          ? (JSON.parse(JSON.stringify(existingCard)) as typeof existingCard)
          : undefined;

        let newId = newCard?.props.id || `TeamCard-${crypto.randomUUID()}`;

        if (newCard && inUseIds.has(newId)) {
          newId = `TeamCard-${crypto.randomUUID()}`;
          Object.entries(newCard.props.slots).forEach(
            ([slotKey, slotArray]) => {
              slotArray[0].props.id = newId + "-" + slotKey;
            }
          );
        }
        inUseIds.add(newId);

        if (!newCard) {
          return defaultTeamCardSlotData(
            newId,
            i,
            sharedCardProps?.backgroundColor,
            sharedCardProps?.slotStyles
          );
        }

        newCard = setDeep(newCard, "props.id", newId);
        newCard = setDeep(newCard, "props.index", i);
        newCard = setDeep(newCard, "props.parentData", undefined);

        return newCard;
      });

      updatedData = setDeep(updatedData, "props.slots.CardSlot", newSlots);
      updatedData = setDeep(
        updatedData,
        "props.data.constantValue",
        newSlots.map((card) => ({ id: card.props.id }))
      );
      return updatedData;
    }
  },
  render: (props) => <TeamCardsWrapperComponent {...props} />,
};
