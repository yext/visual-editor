import * as React from "react";
import {
  ComponentConfig,
  ComponentData,
  PuckComponent,
  setDeep,
} from "@measured/puck";
import {
  TeamSectionType,
  ComponentFields,
  msg,
  i18nComponentsInstance,
  resolveYextEntityField,
} from "@yext/visual-editor";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import {
  cardWrapperFields,
  CardWrapperType,
} from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import { defaultTeamCardSlotData, TeamCardProps } from "./TeamCard.tsx";

export type TeamCardsWrapperProps = CardWrapperType<TeamSectionType>;

const teamCardsWrapperFields = cardWrapperFields<TeamCardsWrapperProps>(
  msg("components.team", "Team"),
  ComponentFields.TeamSection.type
);

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
      constantValue: [{}, {}, {}],
      constantValueEnabled: true,
      field: "",
    },
    slots: {
      CardSlot: [],
    },
  },
  resolveData: (data, params) => {
    const streamDocument = params.metadata.streamDocument;

    // Ensure data structure is valid
    if (!data?.props?.data) {
      return data;
    }

    if (!data.props.data.constantValueEnabled && data.props.data.field) {
      // ENTITY VALUES
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
      // If CardSlot is shorter, create an array of placeholder cards and append them.
      // If CardSlot is longer or equal, this will just be an empty array.
      const cardsToAdd =
        currentLength < requiredLength
          ? Array(requiredLength - currentLength)
              .fill(null)
              .map(() =>
                defaultTeamCardSlotData(`TeamCard-${crypto.randomUUID()}`)
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
      // STATIC VALUES
      let updatedData = data;

      // Ensure constantValue is an array
      const constantValue = Array.isArray(data.props.data.constantValue)
        ? data.props.data.constantValue
        : [{}, {}, {}]; // fallback to default structure

      // For each id in constantValue, check if there's already an existing card.
      // If not, add a new default card.
      // Also, de-duplicate ids to avoid conflicts.
      // Finally, update the card slot and the constantValue object.
      const inUseIds = new Set<string>();
      const newSlots = constantValue.map((item, i) => {
        const id = item?.id;
        const existingCard = id
          ? (data.props.slots.CardSlot.find(
              (slot) => slot.props.id === id
            ) as ComponentData<TeamCardProps>)
          : undefined;

        // Make a deep copy of existingCard to avoid mutating multiple cards
        let newCard = existingCard
          ? (JSON.parse(JSON.stringify(existingCard)) as typeof existingCard)
          : undefined;

        let newId = newCard?.props.id || `TeamCard-${crypto.randomUUID()}`;

        if (newCard && inUseIds.has(newId)) {
          newId = `TeamCard-${crypto.randomUUID()}`;
          // Update the ids of the components in the child slots as well
          Object.entries(newCard.props.slots).forEach(
            ([slotKey, slotArray]) => {
              slotArray[0].props.id = newId + "-" + slotKey;
            }
          );
        }
        inUseIds.add(newId);

        if (!newCard) {
          return defaultTeamCardSlotData(newId, i);
        }

        newCard = setDeep(newCard, "props.id", newId); // update the id
        newCard = setDeep(newCard, "props.index", i); // update the index
        newCard = setDeep(newCard, "props.parentData", undefined); // set to constant values

        return newCard;
      });

      // update the  cards
      updatedData = setDeep(updatedData, "props.slots.CardSlot", newSlots);
      // update the constantValue for the sidebar
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
