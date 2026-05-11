import { PuckComponent } from "@puckeditor/core";
import { EventStruct } from "../../../types/types.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { SlotMappedCardWrapperType } from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import { defaultEventCardSlotData, EventCardProps } from "./EventCard.tsx";
import { renderMappedEntityFieldEmptyState } from "../EntityFieldSectionEmptyState.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import { MappedEntityFieldConditionalRender } from "../entityFieldSectionUtils.ts";
import { createSlottedItemSource } from "../../../utils/itemSource/index.ts";

type EventCardMappings = {
  image: EventStruct["image"];
  title: EventStruct["title"];
  dateTime: EventStruct["dateTime"];
  description: EventStruct["description"];
  cta: EventStruct["cta"];
};

export const eventCardsSource = createSlottedItemSource<
  EventCardMappings,
  EventCardProps
>({
  label: msg("components.events", "Events"),
  itemLabel: "Event",
  cardName: "EventCard",
  defaultItemProps: defaultEventCardSlotData().props,
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
    ...eventCardsSource.defaultWrapperProps,
    styles: {
      showImage: true,
      showDateTime: true,
      showDescription: true,
      showCTA: true,
    },
  },
  resolveData: (data, params) =>
    eventCardsSource.populateSlots(data, params.metadata.streamDocument),
  render: (props) => {
    if (props.conditionalRender?.isMappedContentEmpty) {
      return renderMappedEntityFieldEmptyState(props.puck.isEditing);
    }

    return <EventCardsWrapperComponent {...props} />;
  },
};
