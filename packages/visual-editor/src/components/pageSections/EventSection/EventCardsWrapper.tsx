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
import { toPuckFields, YextComponentConfig } from "../../../fields/fields.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import {
  getMappedCardSourceMode,
  resolveLinkedEntityMappedField,
  resolveLinkedEntitySourceItems,
  syncCardSlotLength,
} from "../../../utils/cardSlots/linkedEntityListWrapper.ts";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";

export type EventCardsWrapperProps = CardWrapperType<EventSectionType> & {
  cards?: {
    title: YextEntityField<EventStruct["title"]>;
    date: YextEntityField<string>;
    description: YextEntityField<EventStruct["description"]>;
    cta: YextEntityField<EventStruct["cta"]>;
    image: YextEntityField<EventStruct["image"]>;
  };
  styles: {
    showImage: boolean;
    showDateTime: boolean;
    showDescription: boolean;
    showCTA: boolean;
  };
};

const createEventCardsMappingFields = (sourceField?: string) =>
  YextField(msg("fields.cards", "Cards"), {
    type: "object",
    objectFields: {
      title: YextField(msg("fields.title", "Title"), {
        type: "entityField",
        disableConstantValueToggle: true,
        filter: {
          types: ["type.string"],
          ...(sourceField ? { descendantsOf: sourceField } : {}),
        },
      }),
      date: YextField(msg("fields.date", "Date"), {
        type: "entityField",
        disableConstantValueToggle: true,
        filter: {
          types: ["type.datetime"],
          ...(sourceField ? { descendantsOf: sourceField } : {}),
        },
      }),
      description: YextField(msg("fields.description", "Description"), {
        type: "entityField",
        disableConstantValueToggle: true,
        filter: {
          types: ["type.rich_text_v2"],
          ...(sourceField ? { descendantsOf: sourceField } : {}),
        },
      }),
      cta: YextField(msg("fields.showCTA", "CTA"), {
        type: "entityField",
        disableConstantValueToggle: true,
        filter: {
          types: ["type.cta"],
          ...(sourceField ? { descendantsOf: sourceField } : {}),
        },
      }),
      image: YextField(msg("fields.showImage", "Image"), {
        type: "entityField",
        disableConstantValueToggle: true,
        filter: {
          types: ["type.image"],
          ...(sourceField ? { descendantsOf: sourceField } : {}),
        },
      }),
    },
  });

const eventCardsWrapperFields = {
  ...cardWrapperFields<EventCardsWrapperProps>(
    msg("components.events", "Events"),
    ComponentFields.EventSection.type,
    true,
    true
  ),
  cards: createEventCardsMappingFields(),
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
    cards: {
      title: {
        field: "",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      date: {
        field: "",
        constantValue: "",
        constantValueEnabled: false,
      },
      description: {
        field: "",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      cta: {
        field: "",
        constantValue: {
          label: { defaultValue: "" },
          link: "",
          linkType: "URL",
          ctaType: "textAndLink",
        },
        constantValueEnabled: false,
      },
      image: {
        field: "",
        constantValue: {
          url: "",
          width: 0,
          height: 0,
        },
        constantValueEnabled: false,
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
  resolveFields: (data, params) => {
    const streamDocument = params.metadata.streamDocument ?? {};
    const isMappedItemListMode =
      !data.props.data.constantValueEnabled &&
      !!data.props.data.field &&
      getMappedCardSourceMode(
        streamDocument,
        data.props.data.field,
        "events"
      ) === "itemList";

    return toPuckFields({
      ...(eventCardsWrapperFields as any),
      cards: {
        ...(createEventCardsMappingFields(
          isMappedItemListMode ? data.props.data.field : undefined
        ) as any),
        visible: isMappedItemListMode,
      },
    });
  },
  resolveData: (data, params) => {
    const streamDocument = params.metadata.streamDocument ?? {};
    const locale = i18nComponentsInstance.language || "en";
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
      const sourceMode = getMappedCardSourceMode(
        streamDocument,
        data.props.data.field,
        "events"
      );

      if (sourceMode === "itemList") {
        const resolvedLinkedEntities = resolveLinkedEntitySourceItems<
          Record<string, unknown>
        >(streamDocument, data.props.data.field);

        if (!resolvedLinkedEntities.length) {
          return setDeep(data, "props.slots.CardSlot", []);
        }

        const updatedCardSlot = syncCardSlotLength(
          data.props.slots.CardSlot as ComponentData<EventCardProps>[],
          resolvedLinkedEntities.length,
          () =>
            defaultEventCardSlotData(
              `EventCard-${crypto.randomUUID()}`,
              undefined,
              sharedCardProps?.backgroundColor,
              sharedCardProps?.truncateDescription,
              sharedCardProps?.slotStyles
            ) as ComponentData<EventCardProps>
        );

        return setDeep(
          data,
          "props.slots.CardSlot",
          updatedCardSlot.map((card, i) => {
            card.props.index = i;

            const linkedEntity = resolvedLinkedEntities[i];
            const mappedTitle = resolveLinkedEntityMappedField<
              EventStruct["title"]
            >(
              linkedEntity,
              data.props.data.field,
              data.props.cards?.title.field
            );

            return setDeep(card, "props.parentData", {
              field: data.props.data.field,
              fields: {
                image: data.props.cards?.image.field || undefined,
                title: data.props.cards?.title.field || undefined,
                dateTime: data.props.cards?.date.field || undefined,
                description: data.props.cards?.description.field || undefined,
                cta: data.props.cards?.cta.field || undefined,
              },
              event: {
                image: resolveLinkedEntityMappedField<EventStruct["image"]>(
                  linkedEntity,
                  data.props.data.field,
                  data.props.cards?.image.field
                ),
                title: mappedTitle
                  ? resolveComponentData(mappedTitle, locale, linkedEntity)
                  : undefined,
                dateTime: resolveLinkedEntityMappedField<string>(
                  linkedEntity,
                  data.props.data.field,
                  data.props.cards?.date.field
                ),
                description: resolveLinkedEntityMappedField<
                  EventStruct["description"]
                >(
                  linkedEntity,
                  data.props.data.field,
                  data.props.cards?.description.field
                ),
                cta: resolveLinkedEntityMappedField<EventStruct["cta"]>(
                  linkedEntity,
                  data.props.data.field,
                  data.props.cards?.cta.field
                ) ?? {
                  label: { defaultValue: "" },
                  link: "",
                  linkType: "URL",
                  ctaType: "textAndLink",
                },
              },
            } satisfies EventCardProps["parentData"]);
          })
        );
      }

      // ENTITY VALUES
      const resolvedEvents = resolveYextEntityField<
        EventSectionType | { events: undefined }
      >(
        streamDocument,
        {
          ...data.props.data,
          constantValue: { events: undefined },
        },
        locale
      )?.events;

      if (!resolvedEvents?.length) {
        return setDeep(data, "props.slots.CardSlot", []);
      }

      const updatedCardSlot = syncCardSlotLength(
        data.props.slots.CardSlot as ComponentData<EventCardProps>[],
        resolvedEvents.length,
        () =>
          defaultEventCardSlotData(
            `EventCard-${crypto.randomUUID()}`,
            undefined,
            sharedCardProps?.backgroundColor,
            sharedCardProps?.truncateDescription,
            sharedCardProps?.slotStyles
          ) as ComponentData<EventCardProps>
      );

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
