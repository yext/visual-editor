import {
  type ComponentData,
  PuckComponent,
  type Slot,
  setDeep,
} from "@puckeditor/core";
import {
  TestimonialStruct,
  type TranslatableRichText,
  type TranslatableString,
} from "../../../types/types.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import {
  defaultTestimonialCardItemData,
  defaultTestimonialCardSlotData,
  type TestimonialCardProps,
} from "./TestimonialCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import {
  toPuckFields,
  type YextComponentConfig,
  type YextFields,
} from "../../../fields/fields.ts";
import { renderMappedEntityFieldEmptyState } from "../EntityFieldSectionEmptyState.tsx";
import {
  MappedEntityFieldConditionalRender,
  withMappedEntityFieldConditionalRender,
} from "../entityFieldSectionUtils.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { type YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { type StreamDocument } from "../../../utils/index.ts";
import { createItemSource } from "../../../utils/itemSource/createItemSource.ts";
import { buildListSectionCards } from "../../../utils/cardSlots/listSectionData.ts";

type TestimonialCardItem = {
  description: YextEntityField<TranslatableRichText>;
  contributorName: YextEntityField<TranslatableString>;
  contributionDate: YextEntityField<string>;
};

export type TestimonialCardsWrapperProps = {
  data: {
    field: string;
    constantValueEnabled?: boolean;
    constantValue: TestimonialCardItem[];
  };
  cards?: TestimonialCardItem;
  styles: {
    showName: boolean;
    showDate: boolean;
  };
  slots: {
    CardSlot: Slot;
  };
  conditionalRender?: MappedEntityFieldConditionalRender;
};

const testimonialCards = createItemSource<
  TestimonialCardsWrapperProps,
  TestimonialCardItem
>({
  itemSourcePath: "data",
  itemMappingsPath: "cards",
  itemSourceLabel: msg("components.testimonial", "Testimonial"),
  itemMappingsLabel: msg("fields.cards", "Cards"),
  itemFields: {
    description: {
      type: "entityField",
      label: msg("fields.description", "Description"),
      filter: {
        types: ["type.string", "type.rich_text_v2"],
      },
    },
    contributorName: {
      type: "entityField",
      label: msg("fields.contributorName", "Contributor Name"),
      filter: {
        types: ["type.string"],
      },
    },
    contributionDate: {
      type: "entityField",
      label: msg("fields.contributionDate", "Contribution Date"),
      disableConstantValueToggle: true,
      filter: {
        types: ["type.datetime"],
      },
    },
  },
});

const testimonialCardsWrapperFields: YextFields<TestimonialCardsWrapperProps> =
  {
    ...testimonialCards.fields,
    styles: {
      type: "object",
      label: msg("fields.styles", "Styles"),
      objectFields: {
        showName: {
          label: msg("fields.showName", "Show Name"),
          type: "radio",
          options: ThemeOptions.SHOW_HIDE,
        },
        showDate: {
          label: msg("fields.showDate", "Show Date"),
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

const createTestimonialCard = (
  currentCards: ComponentData<TestimonialCardProps>[]
): ComponentData<TestimonialCardProps> => {
  const existingCard = currentCards[0];

  return defaultTestimonialCardSlotData(
    `TestimonialCard-${crypto.randomUUID()}`,
    undefined,
    existingCard?.props.styles.backgroundColor,
    existingCard ? gatherSlotStyles(existingCard.props.slots) : undefined
  ) as unknown as ComponentData<TestimonialCardProps>;
};

const syncCards = <TData extends { props: TestimonialCardsWrapperProps }>(
  data: TData,
  items: Record<string, unknown>[]
): TData => {
  const currentCards =
    (data.props.slots
      .CardSlot as unknown as ComponentData<TestimonialCardProps>[]) ?? [];

  return setDeep(
    data,
    "props.slots.CardSlot",
    buildListSectionCards<TestimonialCardProps, Record<string, unknown>>({
      currentCards,
      items,
      createCard: () => createTestimonialCard(currentCards),
      decorateCard: (card, item, index) => ({
        ...card,
        props: {
          ...card.props,
          index,
          itemData: {
            field: data.props.data.field,
            description: item.description as TestimonialStruct["description"],
            contributorName:
              item.contributorName as TestimonialStruct["contributorName"],
            contributionDate:
              item.contributionDate as TestimonialStruct["contributionDate"],
          },
        },
      }),
    })
  ) as TData;
};

const TestimonialCardsWrapperComponent: PuckComponent<
  TestimonialCardsWrapperProps
> = ({ slots }) => (
  <CardContextProvider>
    <slots.CardSlot
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center"
      allow={[]}
    />
  </CardContextProvider>
);

export const TestimonialCardsWrapper: YextComponentConfig<TestimonialCardsWrapperProps> =
  {
    label: msg("components.testimonialCardsWrapper", "Testimonial Cards"),
    fields: testimonialCardsWrapperFields,
    defaultProps: {
      ...testimonialCards.defaultProps,
      data: {
        ...testimonialCards.defaultProps.data!,
        constantValue: Array.from(
          { length: 3 },
          () =>
            JSON.parse(
              JSON.stringify(defaultTestimonialCardItemData)
            ) as TestimonialCardItem
        ),
      },
      cards: testimonialCards.defaultProps.cards as TestimonialCardItem,
      slots: {
        CardSlot: [],
      },
      styles: {
        showName: true,
        showDate: true,
      },
    },
    resolveFields: (data) =>
      toPuckFields({
        ...testimonialCardsWrapperFields,
        ...testimonialCards.resolveFields(data),
      }),
    resolveData: (data, params) => {
      const normalizedData = testimonialCards.normalizeData(data, params);
      const items = testimonialCards.resolveItems(
        normalizedData.props.data,
        normalizedData.props.cards,
        (params.metadata?.streamDocument ?? {}) as StreamDocument
      );

      return withMappedEntityFieldConditionalRender(
        syncCards(normalizedData, items),
        !normalizedData.props.data.constantValueEnabled &&
          Boolean(normalizedData.props.data.field) &&
          items.length === 0
      );
    },
    render: (props) =>
      props.conditionalRender?.isMappedContentEmpty ? (
        renderMappedEntityFieldEmptyState(props.puck.isEditing)
      ) : (
        <TestimonialCardsWrapperComponent {...props} />
      ),
  };
