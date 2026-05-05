import {
  type ComponentData,
  PuckComponent,
  type Slot,
  setDeep,
} from "@puckeditor/core";
import { type StreamDocument, createItemSource } from "../../../utils/index.ts";
import { EventStruct } from "../../../types/types.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { defaultEventCardSlotData, type EventCardProps } from "./EventCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import {
  toPuckFields,
  type YextComponentConfig,
  type YextFields,
} from "../../../fields/fields.ts";
import { type YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { buildListSectionCards } from "../../../utils/cardSlots/listSectionData.ts";

type EventCardItem = {
  title: YextEntityField<EventStruct["title"]>;
  date: YextEntityField<string>;
  description: YextEntityField<EventStruct["description"]>;
  cta: YextEntityField<EventStruct["cta"]>;
  image: YextEntityField<EventStruct["image"]>;
};

export type EventCardsWrapperProps = {
  data: {
    field: string;
    constantValueEnabled?: boolean;
    constantValue: EventCardItem[];
  };
  cards?: EventCardItem;
  styles: {
    showImage: boolean;
    showDateTime: boolean;
    showDescription: boolean;
    showCTA: boolean;
  };
  slots: {
    CardSlot: Slot;
  };
};

const defaultEventCta = {
  label: { defaultValue: "" },
  link: "",
  linkType: "URL",
  ctaType: "textAndLink",
} satisfies EventStruct["cta"];

const eventCards = createItemSource<EventCardsWrapperProps, EventCardItem>({
  itemSourcePath: "data",
  itemMappingsPath: "cards",
  itemSourceLabel: msg("components.events", "Events"),
  itemMappingsLabel: msg("fields.cards", "Cards"),
  itemFields: {
    title: {
      type: "entityField",
      label: msg("fields.title", "Title"),
      filter: {
        types: ["type.string"],
      },
    },
    date: {
      type: "entityField",
      label: msg("fields.date", "Date"),
      disableConstantValueToggle: true,
      filter: {
        types: ["type.datetime"],
      },
    },
    description: {
      type: "entityField",
      label: msg("fields.description", "Description"),
      filter: {
        types: ["type.string", "type.rich_text_v2"],
      },
    },
    cta: {
      type: "entityField",
      label: msg("fields.cta", "CTA"),
      filter: {
        types: ["type.cta"],
      },
    },
    image: {
      type: "entityField",
      label: msg("fields.image", "Image"),
      disableConstantValueToggle: true,
      filter: {
        types: ["type.image"],
      },
    },
  },
});

const eventCardsWrapperFields: YextFields<EventCardsWrapperProps> = {
  ...eventCards.fields,
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
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
};

const createEventCard = (
  currentCards: ComponentData<EventCardProps>[]
): ComponentData<EventCardProps> => {
  const existingCard = currentCards[0];

  return defaultEventCardSlotData(
    `EventCard-${crypto.randomUUID()}`,
    undefined,
    existingCard?.props.styles.backgroundColor,
    existingCard?.props.styles.truncateDescription,
    existingCard ? gatherSlotStyles(existingCard.props.slots) : undefined
  ) as unknown as ComponentData<EventCardProps>;
};

const toEventCardItemData = (
  item: Record<string, unknown>,
  sourceField: string,
  cardMappings?: EventCardItem
): EventCardProps["itemData"] => ({
  field: sourceField,
  fields: {
    image: cardMappings?.image.field || undefined,
    title: cardMappings?.title.field || undefined,
    dateTime: cardMappings?.date.field || undefined,
    description: cardMappings?.description.field || undefined,
    cta: cardMappings?.cta.field || undefined,
  },
  image: item.image as EventStruct["image"],
  title: item.title as EventStruct["title"],
  dateTime: item.date as string | undefined,
  description: item.description as EventStruct["description"],
  cta: (item.cta as EventStruct["cta"] | undefined) ?? defaultEventCta,
});

const syncCards = <TData extends { props: EventCardsWrapperProps }>(
  data: TData,
  resolvedItems: Record<string, unknown>[]
): TData => {
  const currentCards =
    (data.props.slots.CardSlot as unknown as ComponentData<EventCardProps>[]) ??
    [];

  return setDeep(
    data,
    "props.slots.CardSlot",
    buildListSectionCards<EventCardProps, Record<string, unknown>>({
      currentCards,
      items: resolvedItems,
      createCard: () => createEventCard(currentCards),
      decorateCard: (card, item, index) => ({
        ...card,
        props: {
          ...card.props,
          index,
          itemData: toEventCardItemData(
            item,
            data.props.data.field,
            data.props.cards
          ),
        },
      }),
    })
  ) as TData;
};

const EventCardsWrapperComponent: PuckComponent<EventCardsWrapperProps> = ({
  slots,
}) => (
  <CardContextProvider>
    <slots.CardSlot className="flex flex-col gap-8" allow={[]} />
  </CardContextProvider>
);

export const EventCardsWrapper: YextComponentConfig<EventCardsWrapperProps> = {
  label: msg("components.eventCardsWrapper", "Event Cards"),
  fields: eventCardsWrapperFields,
  defaultProps: {
    ...eventCards.defaultProps,
    data: {
      ...eventCards.defaultProps.data!,
      constantValue: [{}, {}, {}] as EventCardItem[],
    },
    cards: {
      ...(eventCards.defaultProps.cards as EventCardItem),
      cta: {
        field: "",
        constantValueEnabled: false,
        constantValue: defaultEventCta,
      },
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
  resolveFields: (data) =>
    toPuckFields({
      ...eventCardsWrapperFields,
      ...eventCards.resolveFields(data),
    }),
  resolveData: (data, params) => {
    const normalizedData = eventCards.normalizeData(data, params);
    const resolvedItems = eventCards.resolveItems(
      normalizedData.props.data,
      normalizedData.props.cards,
      (params.metadata?.streamDocument ?? {}) as StreamDocument
    );

    return syncCards(normalizedData, resolvedItems);
  },
  render: (props) => <EventCardsWrapperComponent {...props} />,
};
