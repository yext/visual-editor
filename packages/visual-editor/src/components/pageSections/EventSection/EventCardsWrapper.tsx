import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { EventSectionType, EventStruct } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import {
  cardWrapperFields,
  CardWrapperType,
} from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import { defaultEventCardSlotData, EventCardProps } from "./EventCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import { buildListSectionCards } from "../../../utils/cardSlots/listSectionData.ts";

export type EventCardsWrapperProps = CardWrapperType<EventSectionType> & {
  styles: {
    showImage: boolean;
    showDateTime: boolean;
    showDescription: boolean;
    showCTA: boolean;
  };
};

const eventCardsWrapperFields: YextFields<EventCardsWrapperProps> = {
  ...cardWrapperFields<EventSectionType>(
    msg("components.events", "Events"),
    ComponentFields.EventSection.type
  ),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      showImage: {
        label: msg("fields.showImage", "Show Image"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showDateTime: {
        label: msg("fields.showDateTime", "Show Date & Time"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showDescription: {
        label: msg("fields.showDescription", "Show Description"),
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

export const EventCardsWrapper: YextComponentConfig<EventCardsWrapperProps> = {
  label: msg("components.eventCardsWrapper", "Event Cards"),
  fields: eventCardsWrapperFields,
  defaultProps: {
    data: {
      constantValue: [{}, {}, {}],
      constantValueEnabled: true,
      field: "",
    },
    styles: {
      showImage: true,
      showDateTime: true,
      showDescription: true,
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
            truncateDescription:
              data.props.slots.CardSlot[0].props.truncateDescription,
            slotStyles: gatherSlotStyles(
              data.props.slots.CardSlot[0].props.slots
            ),
          };

    if (
      streamDocument &&
      !data.props.data.constantValueEnabled &&
      data.props.data.field
    ) {
      // ENTITY VALUES
      const resolvedEvents = resolveYextEntityField<Partial<EventSectionType>>(
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

      return setDeep(
        data,
        "props.slots.CardSlot",
        buildListSectionCards<EventCardProps, EventStruct>({
          currentCards: data.props.slots
            .CardSlot as ComponentData<EventCardProps>[],
          createCard: () =>
            defaultEventCardSlotData(
              `EventCard-${crypto.randomUUID()}`,
              undefined,
              sharedCardProps?.backgroundColor,
              sharedCardProps?.truncateDescription,
              sharedCardProps?.slotStyles
            ) as ComponentData<EventCardProps>,
          decorateCard: (card, event, index) =>
            setDeep(setDeep(card, "props.index", index), "props.parentData", {
              field: data.props.data.field,
              event,
            } satisfies EventCardProps["parentData"]) as ComponentData<EventCardProps>,
          items: resolvedEvents,
        })
      );
    }

    // STATIC VALUES
    let updatedData = data;
    // Rebuild the slot array from the saved ids, reusing existing cards when
    // possible and de-duplicating ids to avoid collisions.
    const inUseIds = new Set<string>();
    const newSlots = data.props.data.constantValue.map(({ id }, i) => {
      const existingCard = id
        ? (data.props.slots.CardSlot.find(
            (slot) => slot.props.id === id
          ) as ComponentData<EventCardProps>)
        : undefined;

      // Deep clone reused cards so id and parentData updates do not mutate the
      // original slot entry in multiple places.
      let newCard = existingCard
        ? (JSON.parse(JSON.stringify(existingCard)) as typeof existingCard)
        : undefined;

      let newId = newCard?.props.id || `EventCard-${crypto.randomUUID()}`;

      if (newCard && inUseIds.has(newId)) {
        newId = `EventCard-${crypto.randomUUID()}`;
        Object.entries(newCard.props.slots).forEach(([slotKey, slotArray]) => {
          slotArray[0].props.id = newId + "-" + slotKey;
        });
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

      newCard = setDeep(newCard, "props.id", newId);
      newCard = setDeep(newCard, "props.index", i);
      newCard = setDeep(newCard, "props.parentData", undefined);

      return newCard;
    });

    // Keep the rendered card slot and sidebar ids in sync.
    updatedData = setDeep(updatedData, "props.slots.CardSlot", newSlots);
    updatedData = setDeep(
      updatedData,
      "props.data.constantValue",
      newSlots.map((card) => ({ id: card.props.id }))
    );
    return updatedData;
  },
  render: (props) => <EventCardsWrapperComponent {...props} />,
};
