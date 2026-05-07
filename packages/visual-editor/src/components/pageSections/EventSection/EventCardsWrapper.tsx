import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { EventStruct } from "../../../types/types.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { SlotMappedCardWrapperType } from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import { defaultEventCardSlotData, EventCardProps } from "./EventCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { renderMappedEntityFieldEmptyState } from "../EntityFieldSectionEmptyState.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import {
  MappedEntityFieldConditionalRender,
  withMappedEntityFieldConditionalRender,
} from "../entityFieldSectionUtils.ts";
import { createSlotMappedCardsSource } from "../../../utils/itemSource/index.ts";
import {
  syncLinkedSlotMappedCards,
  syncManualSlotMappedCards,
} from "../../../utils/cardSlots/slotMappedCards.ts";

type EventCardMappings = {
  image: EventStruct["image"];
  title: EventStruct["title"];
  dateTime: EventStruct["dateTime"];
  description: EventStruct["description"];
  cta: EventStruct["cta"];
};

export const eventCardsSource = createSlotMappedCardsSource<EventCardMappings>({
  label: msg("components.events", "Events"),
  manualItemLabel: "Event",
  mappingFields: {
    image: {
      type: "entityField",
      label: msg("fields.image", "Image"),
      filter: { types: ["type.image"] },
    },
    title: {
      type: "entityField",
      label: msg("fields.title", "Title"),
      filter: { types: ["type.string"] },
    },
    dateTime: {
      type: "entityField",
      label: msg("fields.dateTime", "Date & Time"),
      filter: { types: ["type.datetime"] },
    },
    description: {
      type: "entityField",
      label: msg("fields.description", "Description"),
      filter: { types: ["type.rich_text_v2"] },
    },
    cta: {
      type: "entityField",
      label: msg("fields.cta", "CTA"),
      filter: { types: ["type.cta"] },
    },
  },
});

export type EventCardsWrapperProps =
  SlotMappedCardWrapperType<EventCardMappings> & {
    styles: {
      showImage: boolean;
      showDateTime: boolean;
      showDescription: boolean;
      showCTA: boolean;
    };

    /** @internal */
    conditionalRender?: MappedEntityFieldConditionalRender;
  };

const eventCardsWrapperFields: YextFields<EventCardsWrapperProps> = {
  data: eventCardsSource.field,
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot" },
    },
    visible: false,
  },
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
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
  },
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
      ...eventCardsSource.defaultValue,
      constantValue: [{}, {}, {}],
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
  // Keep the wrapper slot tree aligned with either mapped entity data or
  // constant-value cards, and mark the mapped-empty case so the parent section
  // can hide on live while still showing an editor empty state.
  resolveData: (data, params) => {
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
      const resolvedEvents = eventCardsSource.resolveMappedItems(
        data.props.data,
        params.metadata.streamDocument!
      );

      if (!resolvedEvents?.length) {
        const updatedData = setDeep(data, "props.slots.CardSlot", []);
        return withMappedEntityFieldConditionalRender(updatedData, true);
      }

      const updatedData = setDeep(
        data,
        "props.slots.CardSlot",
        syncLinkedSlotMappedCards({
          items: resolvedEvents,
          currentCards: data.props.slots
            .CardSlot as ComponentData<EventCardProps>[],
          createCard: (id, index) =>
            defaultEventCardSlotData(
              id,
              index,
              sharedCardProps?.backgroundColor,
              sharedCardProps?.truncateDescription,
              sharedCardProps?.slotStyles
            ) as ComponentData<EventCardProps>,
          toParentData: (event) => ({
            field: data.props.data.field,
            event: event as EventStruct,
          }),
          normalizeId: (id) => `EventCard-${id}`,
        })
      );

      return withMappedEntityFieldConditionalRender(updatedData, false);
    }

    const normalizedCards = syncManualSlotMappedCards({
      cardReferences: data.props.data.constantValue,
      currentCards: data.props.slots
        .CardSlot as ComponentData<EventCardProps>[],
      createCard: (id, index) =>
        defaultEventCardSlotData(
          id,
          index,
          sharedCardProps?.backgroundColor,
          sharedCardProps?.truncateDescription,
          sharedCardProps?.slotStyles
        ) as ComponentData<EventCardProps>,
      syncChildSlotIds: (card, id) => {
        Object.entries(card.props.slots).forEach(([slotKey, slotArray]) => {
          slotArray[0].props.id = `${id}-${slotKey}`;
        });
        return card;
      },
      normalizeId: (id) => `EventCard-${id}`,
    });

    return withMappedEntityFieldConditionalRender(
      setDeep(
        setDeep(data, "props.slots.CardSlot", normalizedCards.cards),
        "props.data.constantValue",
        normalizedCards.cardReferences
      ),
      false
    );
  },
  render: (props) => {
    if (props.conditionalRender?.isMappedContentEmpty) {
      return renderMappedEntityFieldEmptyState(props.puck.isEditing);
    }

    return <EventCardsWrapperComponent {...props} />;
  },
};
