import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { EventSectionType, EventStruct } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import {
  cardWrapperFields,
  CardWrapperType,
  createMappedSubfieldFields,
} from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import { defaultEventCardSlotData, EventCardProps } from "./EventCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { YextComponentConfig } from "../../../fields/fields.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import {
  resolveMappedListWrapperData,
  resolveMappedListFields,
} from "../../../utils/cardSlots/mappedListWrapper.ts";
import { resolveMappedSourceField } from "../../../utils/cardSlots/mappedSource.ts";
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
  createMappedSubfieldFields(msg("fields.cards", "Cards"), sourceField, {
    title: {
      label: msg("fields.title", "Title"),
      types: ["type.string"],
    },
    date: {
      label: msg("fields.date", "Date"),
      types: ["type.datetime"],
      disableConstantValueToggle: true,
    },
    description: {
      label: msg("fields.description", "Description"),
      types: ["type.string", "type.rich_text_v2"],
    },
    cta: {
      label: msg("fields.cta", "CTA"),
      types: ["type.cta"],
    },
    image: {
      label: msg("fields.image", "Image"),
      types: ["type.image"],
      disableConstantValueToggle: true,
    },
  });

const createEventCardsWrapperFields = (sourceField?: string) => ({
  ...cardWrapperFields<EventCardsWrapperProps>({
    label: msg("components.events", "Events"),
    entityFieldType: ComponentFields.EventSection.type,
    listFieldName: "events",
    sourceRootKinds: ["linkedEntityRoot", "baseListRoot"],
    sourceRootsOnly: true,
    requiredDescendantTypes: [
      ["type.string"],
      ["type.datetime"],
      ["type.string", "type.rich_text_v2"],
      ["type.cta"],
      ["type.image"],
    ],
  }),
  cards: createEventCardsMappingFields(sourceField) as any,
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
});

const eventCardsWrapperFields = createEventCardsWrapperFields();

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
    return resolveMappedListFields({
      data: data as ComponentData<EventCardsWrapperProps>,
      streamDocument,
      listFieldName: "events",
      createFields: createEventCardsWrapperFields,
      mappingFieldName: "cards",
      createMappingFields: createEventCardsMappingFields,
    });
  },
  resolveData: (data, params) => {
    const streamDocument = params.metadata.streamDocument ?? {};
    const locale = i18nComponentsInstance.language || "en";
    return resolveMappedListWrapperData<
      EventCardsWrapperProps,
      EventCardProps,
      Record<string, unknown>,
      EventStruct,
      {
        backgroundColor?: EventCardProps["styles"]["backgroundColor"];
        truncateDescription?: boolean;
        slotStyles?: Record<string, any>;
      }
    >({
      data: data as ComponentData<EventCardsWrapperProps>,
      streamDocument,
      listFieldName: "events",
      cardIdPrefix: "EventCard",
      getSharedCardProps: (card) =>
        !card
          ? undefined
          : {
              backgroundColor: card.props.styles.backgroundColor,
              truncateDescription: card.props.styles.truncateDescription,
              slotStyles: gatherSlotStyles(card.props.slots),
            },
      createCard: (id, index, sharedCardProps) =>
        defaultEventCardSlotData(
          id,
          index,
          sharedCardProps?.backgroundColor,
          sharedCardProps?.truncateDescription,
          sharedCardProps?.slotStyles
        ) as ComponentData<EventCardProps>,
      decorateMappedItemCard: (card, item, index) => {
        const mappedTitle = resolveMappedSourceField<EventStruct["title"]>(
          item,
          data.props.data.field,
          data.props.cards?.title,
          locale
        );

        return setDeep(
          setDeep(card, "props.index", index),
          "props.parentData",
          {
            field: data.props.data.field,
            fields: {
              image: data.props.cards?.image?.field || undefined,
              title: data.props.cards?.title?.field || undefined,
              dateTime: data.props.cards?.date?.field || undefined,
              description: data.props.cards?.description?.field || undefined,
              cta: data.props.cards?.cta?.field || undefined,
            },
            event: {
              image: resolveMappedSourceField<EventStruct["image"]>(
                item,
                data.props.data.field,
                data.props.cards?.image,
                locale
              ),
              title: mappedTitle
                ? resolveComponentData(mappedTitle, locale, item)
                : undefined,
              dateTime: resolveMappedSourceField<string>(
                item,
                data.props.data.field,
                data.props.cards?.date,
                locale
              ),
              description: resolveMappedSourceField<EventStruct["description"]>(
                item,
                data.props.data.field,
                data.props.cards?.description,
                locale
              ),
              cta: resolveMappedSourceField<EventStruct["cta"]>(
                item,
                data.props.data.field,
                data.props.cards?.cta,
                locale
              ) ?? {
                label: { defaultValue: "" },
                link: "",
                linkType: "URL",
                ctaType: "textAndLink",
              },
            },
          } satisfies EventCardProps["parentData"]
        );
      },
      decorateSectionItemCard: (card, event, index) =>
        setDeep(setDeep(card, "props.index", index), "props.parentData", {
          field: data.props.data.field,
          event,
        } satisfies EventCardProps["parentData"]),
    });
  },
  render: (props) => <EventCardsWrapperComponent {...props} />,
};
