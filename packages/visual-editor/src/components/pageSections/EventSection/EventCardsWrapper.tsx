import { ComponentData, PuckComponent } from "@puckeditor/core";
import { EventSectionType, EventStruct } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { CardWrapperType } from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import { defaultEventCardSlotData, EventCardProps } from "./EventCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { toPuckFields, YextComponentConfig } from "../../../fields/fields.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { createMappedItems } from "../../../utils/cardSlots/createMappedItems.ts";
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

const defaultEventCta = {
  label: { defaultValue: "" },
  link: "",
  linkType: "URL",
  ctaType: "textAndLink",
} satisfies EventStruct["cta"];

const eventCards = createMappedItems<EventCardsWrapperProps>({
  sourceFieldPath: "data.field",
  mappingGroupPath: "cards",
  sourceLabel: msg("components.events", "Events"),
  mappingGroupLabel: msg("fields.cards", "Cards"),
  mappings: {
    title: {
      label: msg("fields.title", "Title"),
      types: ["type.string"],
      defaultValue: { defaultValue: "" },
    },
    date: {
      label: msg("fields.date", "Date"),
      types: ["type.datetime"],
      defaultValue: "",
      disableConstantValueToggle: true,
    },
    description: {
      label: msg("fields.description", "Description"),
      types: ["type.string", "type.rich_text_v2"],
      defaultValue: { defaultValue: "" },
    },
    cta: {
      label: msg("fields.cta", "CTA"),
      types: ["type.cta"],
      defaultValue: defaultEventCta,
    },
    image: {
      label: msg("fields.image", "Image"),
      types: ["type.image"],
      defaultValue: {
        url: "",
        width: 0,
        height: 0,
      },
      disableConstantValueToggle: true,
    },
  },
})
  .withConstantValueMode({
    constantValueType: ComponentFields.EventSection.type,
    defaultConstantValue: [{}, {}, {}],
  })
  .withRepeatedSlot({
    slotPath: "slots.CardSlot",
    createItem: (id, index, existingItem) =>
      defaultEventCardSlotData(
        id,
        index,
        existingItem?.props.styles.backgroundColor,
        existingItem?.props.styles.truncateDescription,
        existingItem ? gatherSlotStyles(existingItem.props.slots) : undefined
      ) as ComponentData<EventCardProps>,
    getParentData: (item, resolvedData) => {
      const locale = i18nComponentsInstance.language || "en";
      const title = eventCards.resolveMapping<EventStruct["title"]>(
        resolvedData.props.cards?.title,
        item,
        locale
      );

      return {
        field: resolvedData.props.data.field,
        fields: {
          image: resolvedData.props.cards?.image?.field || undefined,
          title: resolvedData.props.cards?.title?.field || undefined,
          dateTime: resolvedData.props.cards?.date?.field || undefined,
          description:
            resolvedData.props.cards?.description?.field || undefined,
          cta: resolvedData.props.cards?.cta?.field || undefined,
        },
        event: {
          image: eventCards.resolveMapping<EventStruct["image"]>(
            resolvedData.props.cards?.image,
            item,
            locale
          ),
          title: title ? resolveComponentData(title, locale, item) : undefined,
          dateTime: eventCards.resolveMapping<string>(
            resolvedData.props.cards?.date,
            item,
            locale
          ),
          description: eventCards.resolveMapping<EventStruct["description"]>(
            resolvedData.props.cards?.description,
            item,
            locale
          ),
          cta:
            eventCards.resolveMapping<EventStruct["cta"]>(
              resolvedData.props.cards?.cta,
              item,
              locale
            ) ?? defaultEventCta,
        },
      } satisfies EventCardProps["parentData"];
    },
  });

const eventCardsWrapperFields = {
  ...eventCards.fields,
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

const EventCardsWrapperComponent: PuckComponent<EventCardsWrapperProps> = ({
  slots,
}) => {
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
    ...eventCards.defaultProps,
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
  resolveData: (data, params) => eventCards.resolveItems(data, params).data,
  render: (props) => <EventCardsWrapperComponent {...props} />,
};
