import * as React from "react";
import {
  ComponentConfig,
  ComponentData,
  PuckComponent,
  setDeep,
} from "@measured/puck";
import {
  EventSectionType,
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
import { defaultEventCardSlotData, EventCardProps } from "./EventCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";

export type EventCardsWrapperProps = CardWrapperType<EventSectionType>;

const eventCardsWrapperFields = cardWrapperFields<EventCardsWrapperProps>(
  msg("components.events", "Events"),
  ComponentFields.EventSection.type
);

const EventCardsWrapperComponent: PuckComponent<EventCardsWrapperProps> = (
  props
) => {
  const { slots } = props;

  return (
    <CardContextProvider>
      <slots.CardSlot className="flex flex-col gap-8" allow={[]} />
    </CardContextProvider>
  );
};

export const EventCardsWrapper: ComponentConfig<{
  props: EventCardsWrapperProps;
}> = {
  label: msg("components.eventCardsWrapper", "Event Cards"),
  fields: eventCardsWrapperFields,
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
    const sharedCardProps =
      data.props.slots.CardSlot.length === 0
        ? undefined
        : {
            backgroundColor:
              data.props.slots.CardSlot[0].props.styles.backgroundColor,
            truncateDescription:
              data.props.slots.CardSlot[0].props.truncateDescription,
            slotStyles: gatherSlotStyles(
              data.props.slots.CardSlot[0].props.slots
            ),
          };

    if (!data.props.data.constantValueEnabled && data.props.data.field) {
      // ENTITY VALUES
      const resolvedEvents = resolveYextEntityField<
        EventSectionType | { events: undefined }
      >(
        streamDocument,
        {
          ...data.props.data,
          constantValue: { events: undefined },
        },
        i18nComponentsInstance.language || "en"
      )?.events;

      if (!resolvedEvents?.length) {
        return setDeep(data, "props.slots.CardSlot", []);
      }

      const requiredLength = resolvedEvents.length;
      const currentLength = data.props.slots.CardSlot.length;
      // If CardSlot is shorter, create an array of placeholder cards and append them.
      // If CardSlot is longer or equal, this will just be an empty array.
      const cardsToAdd =
        currentLength < requiredLength
          ? Array(requiredLength - currentLength)
              .fill(null)
              .map(() =>
                defaultEventCardSlotData(
                  `EventCard-${crypto.randomUUID()}`,
                  undefined,
                  sharedCardProps?.backgroundColor,
                  sharedCardProps?.truncateDescription,
                  sharedCardProps?.slotStyles
                )
              )
          : [];
      const updatedCardSlot = [
        ...data.props.slots.CardSlot,
        ...cardsToAdd,
      ].slice(0, requiredLength) as ComponentData<EventCardProps>[];

      return setDeep(
        data,
        "props.slots.CardSlot",
        updatedCardSlot.map((card, i) => {
          card.props.index = i;
          return setDeep(card, "props.parentData", {
            field: data.props.data.field,
            event: resolvedEvents[i],
          } satisfies EventCardProps["parentData"]);
        })
      );
    } else {
      // STATIC VALUES
      let updatedData = data;

      // For each id in constantValue, check if there's already an existing card.
      // If not, add a new default card.
      // Also, de-duplicate ids to avoid conflicts.
      // Finally, update the card slot and the constantValue object.
      const inUseIds = new Set<string>();
      const newSlots = data.props.data.constantValue.map(({ id }, i) => {
        const existingCard = id
          ? (data.props.slots.CardSlot.find(
              (slot) => slot.props.id === id
            ) as ComponentData<EventCardProps>)
          : undefined;

        // Make a deep copy of existingCard to avoid mutating multiple cards
        let newCard = existingCard
          ? (JSON.parse(JSON.stringify(existingCard)) as typeof existingCard)
          : undefined;

        let newId = newCard?.props.id || `EventCard-${crypto.randomUUID()}`;

        if (newCard && inUseIds.has(newId)) {
          newId = `EventCard-${crypto.randomUUID()}`;
          // Update the ids of the components in the child slots as well
          Object.entries(newCard.props.slots).forEach(
            ([slotKey, slotArray]) => {
              slotArray[0].props.id = newId + "-" + slotKey;
            }
          );
        }
        inUseIds.add(newId);

        if (!newCard) {
          return defaultEventCardSlotData(
            newId,
            i,
            sharedCardProps?.backgroundColor,
            sharedCardProps?.truncateDescription,
            sharedCardProps?.slotStyles
          );
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
  render: (props) => <EventCardsWrapperComponent {...props} />,
};
