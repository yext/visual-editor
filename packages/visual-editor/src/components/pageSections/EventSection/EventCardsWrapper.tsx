import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { EventSectionType, EventStruct } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { defaultEventCardSlotData, EventCardProps } from "./EventCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import { CardWrapperType } from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import {
  createListSourceField,
  type ListSourceFieldValue,
} from "../../../editor/ListSourceField.tsx";
import { EVENT_SECTION_CONSTANT_CONFIG } from "../../../internal/puck/constant-value-fields/EventSection.tsx";
import {
  buildListSectionCards,
  resolveListSectionItems,
} from "../../../utils/cardSlots/listSectionData.ts";

export type EventCardsWrapperProps = Omit<
  CardWrapperType<EventSectionType>,
  "data"
> & {
  data: ListSourceFieldValue;
  styles: {
    showImage: boolean;
    showDateTime: boolean;
    showDescription: boolean;
    showCTA: boolean;
  };
};

const eventCardsWrapperFields: YextFields<EventCardsWrapperProps> = {
  data: createListSourceField({
    label: msg("components.events", "Events"),
    legacySourceFilter: {
      types: [ComponentFields.EventSection.type],
    },
    constantField: EVENT_SECTION_CONSTANT_CONFIG,
    mappingConfigs: [
      {
        key: "image",
        label: msg("fields.options.image", "Image"),
        preferredFieldNames: ["image"],
        required: false,
        types: ["type.image"],
      },
      {
        key: "title",
        label: msg("fields.showTitle", "Title"),
        preferredFieldNames: ["title", "name"],
        types: ["type.string"],
      },
      {
        key: "dateTime",
        label: msg("fields.showDateTime", "Show Date & Time"),
        preferredFieldNames: ["dateTime", "start", "startDate"],
        required: false,
        types: ["type.datetime"],
      },
      {
        key: "description",
        label: msg("fields.showDescription", "Description"),
        preferredFieldNames: ["description"],
        required: false,
        types: ["type.rich_text_v2"],
      },
      {
        key: "cta",
        label: msg("fields.showCTA", "CTA"),
        preferredFieldNames: ["cta"],
        required: false,
        types: ["type.cta"],
      },
    ],
  }),
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
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
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
    if (!streamDocument) {
      return data;
    }
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
      const { items: resolvedEvents, requiredLength } =
        resolveListSectionItems<EventStruct>({
          buildMappedItem: (resolvedItemFields) => ({
            image: resolvedItemFields.image as EventStruct["image"],
            title:
              typeof resolvedItemFields.title === "string"
                ? resolvedItemFields.title
                : undefined,
            dateTime:
              typeof resolvedItemFields.dateTime === "string"
                ? resolvedItemFields.dateTime
                : undefined,
            description:
              resolvedItemFields.description as EventStruct["description"],
            cta: resolvedItemFields.cta as EventStruct["cta"],
          }),
          data: data.props.data,
          isValidItem: (event) => Boolean(event.title),
          resolveLegacyItems: () =>
            resolveYextEntityField<Partial<EventSectionType>>(
              streamDocument,
              {
                ...data.props.data,
                constantValue: { events: undefined },
              },
              i18nComponentsInstance.language || "en"
            )?.events,
          streamDocument,
        });

      if (!requiredLength || !resolvedEvents) {
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
